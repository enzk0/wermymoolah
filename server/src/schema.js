import { readFile } from 'node:fs/promises';

export async function migrate(pool, schemaFile = new URL('./schema.sql', import.meta.url)) {
  const sql = await readFile(schemaFile, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
