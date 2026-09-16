import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { NextFunction, Request } from 'express';

import { notFoundHandler } from '../src/middleware/not-found.js';
import { NotFoundError } from '../src/lib/errors.js';

describe('notFoundHandler', () => {
  it('calls next with a NotFoundError describing the missing route', () => {
    const req = { method: 'GET', originalUrl: '/api/v1/does-not-exist' } as Request;
    const next = mock.fn<NextFunction>();

    notFoundHandler(req, {} as never, next);

    assert.equal(next.mock.calls.length, 1);
    const err = next.mock.calls[0]!.arguments[0] as NotFoundError;
    assert.ok(err instanceof NotFoundError);
    assert.equal(err.message, 'Route GET /api/v1/does-not-exist not found');
    assert.equal(err.statusCode, 404);
    assert.equal(err.code, 'NOT_FOUND');
  });
});
