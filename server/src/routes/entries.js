import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';

export const entriesRouter = Router();

const COLUMNS = 'id, entry_date, amount_cents, note, category, created_at, updated_at';

function toEntry(row) {
  return {
    id: row.id,
    entryDate: row.entry_date,
    amountCents: row.amount_cents,
    note: row.note,
    category: row.category,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const dayKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
  .refine((value) => {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    );
  }, 'not a real calendar date');

const amountCents = z
  .number()
  .int('amount must be whole cents')
  .min(0)
  .max(9_000_000_000_000);

const newEntrySchema = z
  .object({
    entryDate: dayKey,
    amountCents,
    note: z.string().max(2000).default(''),
    category: z.string().max(60).nullish(),
  })
  .refine((entry) => entry.amountCents > 0 || entry.note.trim() !== '', {
    message: 'provide an amount, a note, or both',
  });

const patchSchema = z
  .object({
    entryDate: dayKey.optional(),
    amountCents: amountCents.optional(),
    note: z.string().max(2000).optional(),
    category: z.string().max(60).nullish(),
  })
  .refine((patch) => Object.keys(patch).length > 0, {
    message: 'patch body is empty',
  });

const rangeSchema = z
  .object({ from: dayKey, to: dayKey })
  .refine((range) => range.from <= range.to, {
    message: 'from must be on or before to',
  });

function parseId(text) {
  const id = Number(text);
  return Number.isInteger(id) && id > 0 ? id : null;
}

entriesRouter.get('/', async (req, res) => {
  const parsed = rangeSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid range', details: parsed.error.issues });
    return;
  }

  const { from, to } = parsed.data;
  const result = await query(
    `SELECT ${COLUMNS}
       FROM entries
      WHERE entry_date BETWEEN $1 AND $2
      ORDER BY entry_date, id`,
    [from, to],
  );

  res.json(result.rows.map(toEntry));
});

entriesRouter.post('/', async (req, res) => {
  const parsed = newEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid entry', details: parsed.error.issues });
    return;
  }

  const { entryDate, amountCents, note, category } = parsed.data;
  const result = await query(
    `INSERT INTO entries (entry_date, amount_cents, note, category)
          VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNS}`,
    [entryDate, amountCents, note, category ?? null],
  );

  res.status(201).json(toEntry(result.rows[0]));
});

entriesRouter.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'invalid id' });
    return;
  }

  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid patch', details: parsed.error.issues });
    return;
  }

  const columns = {
    entryDate: 'entry_date',
    amountCents: 'amount_cents',
    note: 'note',
    category: 'category',
  };

  const setClauses = [];
  const values = [];
  for (const [field, column] of Object.entries(columns)) {
    if (!(field in parsed.data)) continue;
    values.push(parsed.data[field] ?? null);
    setClauses.push(`${column} = $${values.length}`);
  }

  values.push(id);
  const result = await query(
    `UPDATE entries
        SET ${setClauses.join(', ')}
      WHERE id = $${values.length}
  RETURNING ${COLUMNS}`,
    values,
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'entry not found' });
    return;
  }

  res.json(toEntry(result.rows[0]));
});

entriesRouter.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'invalid id' });
    return;
  }

  const result = await query('DELETE FROM entries WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: 'entry not found' });
    return;
  }

  res.status(204).end();
});
