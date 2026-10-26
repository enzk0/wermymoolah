import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { query } from './db.js';
import { entriesRouter } from './routes/entries.js';
import { categoriesRouter } from './routes/categories.js';

export function createApp({ corsOrigin = true, clientDir } = {}) {
  const app = express();

  app.use(cors({ origin: corsOrigin }));

  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', async (req, res) => {
    try {
      await query('SELECT 1');
      res.json({ ok: true });
    } catch (err) {
      res.status(503).json({ ok: false, error: err.message });
    }
  });

  app.use('/api/entries', entriesRouter);
  app.use('/api/categories', categoriesRouter);

  if (clientDir) {
    const indexHtml = path.join(clientDir, 'index.html');

    app.use(express.static(clientDir));

    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/') || path.extname(req.path)) {
        return next();
      }
      res.sendFile(indexHtml);
    });
  }

  app.use((req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[api]', err);
    res.status(500).json({ error: 'internal server error' });
  });

  return app;
}
