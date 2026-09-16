import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import express from 'express';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const { apiRouter } = await import('../src/routes/index.js');

describe('apiRouter', () => {
  it('mounts the health router under /health', async () => {
    const app = express();
    app.use(apiRouter);

    const res = await request(app).get('/health').expect(200);

    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'paw-tag-api');
  });
});
