import { pool, query } from './db.js';

const MARKER = '[seed]';

const SAMPLES = [
  [2, 42500, 'Groceries', 'Food'],
  [2, 8000, 'Jeepney fare', 'Transport'],
  [5, 129900, 'Electricity bill', 'Bills'],
  [7, 24500, 'Coffee with Mia', 'Fun'],
  [9, 0, 'No spend day', 'Other'],
  [12, 315000, 'New headphones', 'Shopping'],
  [12, 18500, 'Lunch', 'Food'],
  [15, 67000, 'Pharmacy', 'Health'],
  [18, 55000, 'Grab ride', 'Transport'],
  [21, 89000, 'Dinner out', 'Food'],
  [24, 150000, 'Internet', 'Bills'],
  [27, 32000, 'Movie tickets', 'Fun'],
];

const pad = (n) => String(n).padStart(2, '0');

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

const lastDay = new Date(year, month, 0).getDate();

try {
  const cleared = await query('DELETE FROM entries WHERE note LIKE $1', [`%${MARKER}`]);
  if (cleared.rowCount > 0) {
    console.log(`[seed] cleared ${cleared.rowCount} previous seed rows`);
  }

  for (const [day, cents, note, category] of SAMPLES) {
    if (day > lastDay) continue;
    await query(
      `INSERT INTO entries (entry_date, amount_cents, note, category)
            VALUES ($1, $2, $3, $4)`,
      [`${year}-${pad(month)}-${pad(day)}`, cents, `${note} ${MARKER}`, category],
    );
  }

  console.log(`[seed] inserted sample entries for ${year}-${pad(month)}`);
} catch (err) {
  console.error('[seed] failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
