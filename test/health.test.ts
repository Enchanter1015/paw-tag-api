import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import request from 'supertest';

process.env.NODE_ENV = 'test';

const { createApp } = await import('../src/app.js');

describe('GET /api/v1/health', () => {
  let app: ReturnType<typeof createApp>;

  before(() => {
    app = createApp();
  });

  it('returns 200 with service status', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);

    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'paw-tag-api');
    assert.ok(typeof res.body.uptimeSeconds === 'number');
    assert.ok(Date.parse(res.body.timestamp));
  });

  it('returns 404 with an error envelope for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist').expect(404);

    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.ok(res.body.error.message.includes('/api/v1/does-not-exist'));
  });
});
