import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { entriesRouter } from './routes/entries.js';
import { categoriesRouter } from './routes/categories.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));

app.use(express.json({ limit: '64kb' }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.use('/api/entries', entriesRouter);
app.use('/api/categories', categoriesRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[api]', err);
  res.status(500).json({ error: 'internal server error' });
});

const server = app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n[api] ${signal}, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}
