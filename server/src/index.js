import { requireDatabaseUrl } from './env.js';
import { initDb, closeDb } from './db.js';
import { createApp } from './app.js';

initDb(requireDatabaseUrl());

const app = createApp({ corsOrigin: process.env.CORS_ORIGIN ?? true });
const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n[api] ${signal}, shutting down`);
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
  });
}
