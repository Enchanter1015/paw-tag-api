import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import express from 'express';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const { healthRouter } = await import('../src/modules/health/health.routes.js');

describe('healthRouter', () => {
  it('routes GET / to the health controller', async () => {
    const app = express();
    app.use(healthRouter);

    const res = await request(app).get('/').expect(200);

    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'paw-tag-api');
  });
});
