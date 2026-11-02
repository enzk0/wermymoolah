import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('POST /api/entries', () => {
  it('saves an entry and returns it', async () => {
    const res = await request(app)
      .post('/api/entries')
      .send({ entryDate: '2026-10-15', amountCents: 12550, note: 'lunch' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 1,
      entryDate: '2026-10-15',
      amountCents: 12550,
      note: 'lunch',
      category: null,
    });

    const list = await request(app).get('/api/entries?from=2026-10-01&to=2026-10-31');
    expect(list.body).toHaveLength(1);
  });

  it('rejects a date that does not exist', async () => {
    const res = await request(app)
      .post('/api/entries')
      .send({ entryDate: '2026-02-30', amountCents: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid entry');
  });
});
