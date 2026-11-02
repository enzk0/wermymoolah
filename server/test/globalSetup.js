import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import pg from 'pg';
import { startEmbeddedDb } from '../src/embeddedDb.js';
import { migrate } from '../src/schema.js';

// Runs once per `vitest run`, before any test file: start a throwaway Postgres and apply
// the schema. Tests never see DATABASE_URL, so they can't reach the dev database.
export default async function setup({ provide }) {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'moolah-test-'));
  const db = await startEmbeddedDb({ dataDir, onLog: () => {} });

  const pool = new pg.Pool({ connectionString: db.databaseUrl });
  await migrate(pool);
  await pool.end();

  provide('databaseUrl', db.databaseUrl);

  return async () => {
    await db.stop();
    await fs.rm(dataDir, { recursive: true, force: true });
  };
}
