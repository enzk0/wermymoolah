import { readFile } from 'node:fs/promises';
import { requireDatabaseUrl } from './env.js';
import { initDb, closeDb } from './db.js';

const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');

const pool = initDb(requireDatabaseUrl());
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('[migrate] schema applied');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('[migrate] failed:', err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await closeDb();
}
