import { afterAll, beforeEach, inject } from 'vitest';
import { initDb, closeDb, query } from '../src/db.js';

// Runs inside every test file.
initDb(inject('databaseUrl'));

beforeEach(async () => {
  await query('TRUNCATE entries, categories RESTART IDENTITY');
});

afterAll(async () => {
  await closeDb();
});
