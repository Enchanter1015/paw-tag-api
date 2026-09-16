import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import express from 'express';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const { rateLimiter } = await import('../src/middleware/rate-limiter.js');

describe('rateLimiter', () => {
  it('skips limiting in the test environment, allowing requests past the configured limit', async () => {
    const app = express();
    app.use(rateLimiter);
    app.get('/', (_req, res) => res.status(200).json({ ok: true }));

    // config.rateLimit.max defaults to 100; exceeding it confirms skip() bypasses limiting.
    for (let i = 0; i <= 100; i += 1) {
      const res = await request(app).get('/');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { ok: true });
    }
  });
});
