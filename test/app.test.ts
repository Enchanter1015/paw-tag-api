import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import request from 'supertest';

process.env.NODE_ENV = 'test';

const { createApp } = await import('../src/app.js');

describe('createApp', () => {
  it('disables x-powered-by and applies helmet security headers', async () => {
    const app = createApp();

    const res = await request(app).get('/api/v1/health');

    assert.equal(res.headers['x-powered-by'], undefined);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
  });

  it('sets trust proxy to false outside production', () => {
    const app = createApp();

    assert.equal(app.get('trust proxy'), false);
  });

  it('applies CORS headers for cross-origin requests', async () => {
    const app = createApp();

    const res = await request(app).get('/api/v1/health').set('Origin', 'https://example.com');

    assert.ok(res.headers['access-control-allow-origin']);
  });

  it('parses JSON request bodies without error', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/v1/does-not-exist')
      .send({ name: 'Rex' })
      .set('Content-Type', 'application/json');

    // Unknown route still hits notFoundHandler, proving the body parser ran without throwing.
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  it('parses urlencoded request bodies without error', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/v1/does-not-exist')
      .send('name=Rex')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    assert.equal(res.status, 404);
  });

  it('rejects oversized JSON payloads via the error handler', async () => {
    const app = createApp();
    const oversizedPayload = { data: 'x'.repeat(200_000) };

    const res = await request(app)
      .post('/api/v1/does-not-exist')
      .send(oversizedPayload)
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 413);
    assert.ok(res.body.error);
  });

  it('mounts the rate limiter, which skips limiting in the test environment', async () => {
    const app = createApp();

    // config.isTest makes rateLimiter.skip() return true, so headers aren't set but requests still pass.
    const res = await request(app).get('/api/v1/health');

    assert.equal(res.status, 200);
    assert.equal(res.headers['ratelimit-policy'], undefined);
  });

  it('mounts the API router under /api/v1', async () => {
    const app = createApp();

    const res = await request(app).get('/api/v1/health').expect(200);

    assert.equal(res.body.status, 'ok');
  });

  it('routes unknown paths to the not-found handler', async () => {
    const app = createApp();

    const res = await request(app).get('/nowhere').expect(404);

    assert.equal(res.body.error.code, 'NOT_FOUND');
  });
});
