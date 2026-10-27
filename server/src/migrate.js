import { requireDatabaseUrl } from './env.js';
import { initDb, closeDb } from './db.js';
import { migrate } from './schema.js';

const pool = initDb(requireDatabaseUrl());
try {
  await migrate(pool);
  console.log('[migrate] schema applied');
} catch (err) {
  console.error('[migrate] failed:', err.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
