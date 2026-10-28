import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startEmbeddedDb } from './embeddedDb.js';
import { initDb, closeDb } from './db.js';
import { migrate } from './schema.js';
import { createApp } from './app.js';

const dataDir =
  process.env.EMBEDDED_DATA_DIR ?? fileURLToPath(new URL('../.embedded', import.meta.url));
const clientDir = fileURLToPath(new URL('../../client/dist', import.meta.url));

if (!existsSync(path.join(clientDir, 'index.html'))) {
  console.error('[embedded] client/dist is missing. Run `npm run build` first.');
  process.exit(1);
}

const db = await startEmbeddedDb({ dataDir });
console.log(`[embedded] postgres ready, data in ${dataDir}`);

const pool = initDb(db.databaseUrl);
try {
  await migrate(pool);
  console.log('[embedded] schema applied');
} catch (err) {
  console.error('[embedded] migrate failed:', err.message);
  await closeDb();
  await db.stop();
  process.exit(1);
}

const app = createApp({ clientDir });
const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`[api] listening on http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n[embedded] ${signal}, shutting down`);
    server.close(async () => {
      await closeDb();
      await db.stop();
      process.exit(0);
    });
  });
}
