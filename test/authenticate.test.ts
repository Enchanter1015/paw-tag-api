import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { NextFunction, Request, Response } from 'express';

process.env.NODE_ENV = 'test';

const { tokenService } = await import('../src/lib/tokens.js');
const { authenticate } = await import('../src/middleware/authenticate.js');
const { UnauthorizedError } = await import('../src/lib/errors.js');

describe('authenticate', () => {
  it('populates actor fields from a valid bearer token', async () => {
    const verifyAccessToken = mock.method(tokenService, 'verifyAccessToken', () => ({
      sub: 'user-1',
      role: 'User',
      permissions: ['animals:write'],
    }));

    const req = { header: () => 'Bearer valid.token.here' } as unknown as Request;
    const next = mock.fn<NextFunction>();

    await authenticate(req, {} as Response, next);

    assert.equal(req.actorId, 'user-1');
    assert.equal(req.actorRole, 'User');
    assert.deepEqual(req.actorPermissions, ['animals:write']);
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0]!.arguments[0], undefined);

    verifyAccessToken.mock.restore();
  });

  it('calls next with UnauthorizedError when the header is missing', async () => {
    const req = { header: () => undefined } as unknown as Request;
    const next = mock.fn<NextFunction>();

    await authenticate(req, {} as Response, next);

    assert.ok(next.mock.calls[0]!.arguments[0] instanceof UnauthorizedError);
  });

  it('calls next with UnauthorizedError when the header is not a Bearer token', async () => {
    const req = { header: () => 'Basic abc123' } as unknown as Request;
    const next = mock.fn<NextFunction>();

    await authenticate(req, {} as Response, next);

    assert.ok(next.mock.calls[0]!.arguments[0] instanceof UnauthorizedError);
  });

  it('calls next with UnauthorizedError when the token is invalid or expired', async () => {
    const verifyAccessToken = mock.method(tokenService, 'verifyAccessToken', () => {
      throw new Error('jwt expired');
    });

    const req = { header: () => 'Bearer expired.token.here' } as unknown as Request;
    const next = mock.fn<NextFunction>();

    await authenticate(req, {} as Response, next);

    assert.ok(next.mock.calls[0]!.arguments[0] instanceof UnauthorizedError);

    verifyAccessToken.mock.restore();
  });
});
