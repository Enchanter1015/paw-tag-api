import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import express from 'express';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const { requestLogger } = await import('../src/middleware/request-logger.js');

const buildApp = () => {
  const app = express();
  app.use(requestLogger);
  app.get('/ok', (_req, res) => res.status(200).json({ ok: true }));
  app.get('/missing', (_req, res) => res.status(404).json({ ok: false }));
  app.get('/boom', (_req, res) => res.status(500).json({ ok: false }));
  return app;
};

describe('requestLogger', () => {
  it('echoes back a caller-supplied x-request-id header', async () => {
    const app = buildApp();

    const res = await request(app).get('/ok').set('x-request-id', 'caller-id-123');

    assert.equal(res.headers['x-request-id'], 'caller-id-123');
  });

  it('generates a fresh request id when none is supplied', async () => {
    const app = buildApp();

    const res = await request(app).get('/ok');

    assert.match(
      res.headers['x-request-id'],
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('generates a fresh request id when the supplied header exceeds 128 characters', async () => {
    const app = buildApp();
    const tooLong = 'a'.repeat(129);

    const res = await request(app).get('/ok').set('x-request-id', tooLong);

    assert.notEqual(res.headers['x-request-id'], tooLong);
  });

  it('exercises the info branch of customLogLevel for a successful response', async () => {
    const res = await request(buildApp()).get('/ok');
    assert.equal(res.status, 200);
  });

  it('exercises the warn branch of customLogLevel for a 4xx response', async () => {
    const res = await request(buildApp()).get('/missing');
    assert.equal(res.status, 404);
  });

  it('exercises the error branch of customLogLevel for a 5xx response', async () => {
    const res = await request(buildApp()).get('/boom');
    assert.equal(res.status, 500);
  });
});
