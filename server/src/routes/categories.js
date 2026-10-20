import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';

export const categoriesRouter = Router();

const COLUMNS = 'id, name, created_at';

function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()),
});

categoriesRouter.get('/', async (req, res) => {
  const result = await query(
    `SELECT ${COLUMNS} FROM categories 
    ORDER BY id`,
  );

  res.json(result.rows.map(toCategory));
});

categoriesRouter.get('/:id', async (req, res) => {
  const parsed = idSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid id', details: parsed.error.issues });
    return;
  }

  const { id } = parsed.data;
  const result = await query(`SELECT ${COLUMNS} FROM categories WHERE id = $1`, [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'category not found' });
    return;
  }

  res.json(toCategory(result.rows[0]));
});

categoriesRouter.post('/', async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid category', details: parsed.error.issues });
    return;
  }

  const { name } = parsed.data;
  const result = await query(
    `INSERT INTO categories (name)
          VALUES ($1)
      ON CONFLICT (name) DO NOTHING
          RETURNING ${COLUMNS}`,
    [name],
  );

  if (result.rows.length === 0) {
    res.status(409).json({ error: 'category already exists' });
    return;
  }

  res.status(201).json(toCategory(result.rows[0]));
});

categoriesRouter.delete('/:id', async (req, res) => {
  const parsed = idSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid id', details: parsed.error.issues });
    return;
  }

  const { id } = parsed.data;
  const result = await query('DELETE FROM categories WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'category not found' });
    return;
  }

  res.sendStatus(204);
});
