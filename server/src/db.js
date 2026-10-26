import pg from 'pg';

pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

let pool = null;

export function initDb(databaseUrl) {
  if (pool) throw new Error('initDb() was already called.');
  pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
  return pool;
}

export function getPool() {
  if (!pool) throw new Error('The database is not initialised. Call initDb() first.');
  return pool;
}

export function query(sql, params = []) {
  return getPool().query(sql, params);
}

export async function closeDb() {
  if (!pool) return;
  await pool.end();
  pool = null;
}
