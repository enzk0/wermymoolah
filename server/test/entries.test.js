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

describe('GET /api/entries', () => {
  it('filters entry by range', async () => {
    await request(app)
      .post('/api/entries')
      .send({ entryDate: '2026-09-30', amountCents: 100, note: 'test1' });
    await request(app)
      .post('/api/entries')
      .send({ entryDate: '2026-10-01', amountCents: 100, note: 'test2' });
    await request(app)
      .post('/api/entries')
      .send({ entryDate: '2026-11-01', amountCents: 100, note: 'test3' });

    const res = await request(app).get('/api/entries?from=2026-10-01&to=2026-10-31');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      entryDate: '2026-10-01',
      amountCents: 100,
      note: 'test2',
      category: null,
    });
  });

  it('rejects with a backward range', async () => {
    const res = await request(app).get('/api/entries?from=2026-10-31&to=2026-10-01');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: 'invalid range' });
    expect(res.body.error).toBe('invalid range');
  });
});

describe('PATCH&DELETE /api/entries', () => {
  it('correctly patches an entry', async () => {
    const res1 = await request(app).post('/api/entries').send({
      entryDate: '2026-10-15',
      amountCents: 1500,
      note: 'hi my name is verity',
      category: null,
    });

    const res2 = await request(app).patch(`/api/entries/${res1.body.id}`).send({
      note: 'my name is now falsity',
    });

    expect(res2.status).toBe(200);
    expect(res2.body).toMatchObject({
      id: res1.body.id,
      note: 'my name is now falsity',
      amountCents: 1500,
    });
  });

  it('throws an error if no id is given', async () => {
    const res1 = await request(app).patch(`/api/entries/${undefined}`);

    expect(res1.status).toBe(400);
    expect(res1.body).toMatchObject({ error: 'invalid id' });

    const res2 = await request(app).patch(`/api/entries/${null}`);

    expect(res2.status).toBe(400);
    expect(res2.body).toMatchObject({ error: 'invalid id' });
  });
});
