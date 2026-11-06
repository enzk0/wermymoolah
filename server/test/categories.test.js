import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('GET /api/categories', () => {
  it('should get all the categories', async () => {
    await request(app).post('/api/categories').send({ name: 'Food' });
    await request(app).post('/api/categories').send({ name: 'Transport' });

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ name: 'Food' });
    expect(res.body[1]).toMatchObject({ name: 'Transport' });
  });

  it('returns undefined if categories is empty', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
    expect(res.body[0]).toMatchObject(undefined);
  });

  it('should get a category with an id', async () => {
    const res1 = await request(app).post('/api/categories').send({ name: 'Food' });
    const res2 = await request(app).post('/api/categories').send({ name: 'Transport' });

    const res3 = await request(app).get(`/api/categories/${res1.body.id}`);

    expect(res3.status).toBe(200);
    expect(res3.body).toMatchObject({ name: 'Food' });
  });

  it('returns an error with invalid id', async () => {
    const res3 = await request(app).get(`/api/categories/${undefined}`);

    expect(res3.status).toBe(400);
    expect(res3.body).toMatchObject({ error: 'invalid id' });
  });

  it('returns an error if id does not exist', async () => {
    const res3 = await request(app).get(`/api/categories/${3}`);

    expect(res3.status).toBe(404);
    expect(res3.body).toMatchObject({ error: 'category not found' });
  });

  it('returns an error if id is a string', async () => {
    const res3 = await request(app).get(`/api/categories/${'hello'}`);

    expect(res3.status).toBe(400);
    expect(res3.body).toMatchObject({ error: 'invalid id' });
  });
});

// describe('POST /api/categories', () => {});
// describe('PATCH /api/categories', () => {});
// describe('DELETE /api/categories', () => {});
