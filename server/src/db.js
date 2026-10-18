import 'dotenv/config';
import pg from 'pg';

pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in.',
  );
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export function query(sql, params = []) {
  return pool.query(sql, params);
}
