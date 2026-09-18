import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { NextFunction, Request, Response } from 'express';

import { requirePermission } from '../src/middleware/require-permission.js';
import { ForbiddenError } from '../src/lib/errors.js';

describe('requirePermission', () => {
  it('calls next with no error when the actor has the permission', () => {
    const middleware = requirePermission('animals:write');
    const req = { actorPermissions: ['animals:write', 'users:manage'] } as unknown as Request;
    const next = mock.fn<NextFunction>();

    middleware(req, {} as Response, next);

    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0]!.arguments[0], undefined);
  });

  it('calls next with ForbiddenError when the permission is missing', () => {
    const middleware = requirePermission('users:manage');
    const req = { actorPermissions: ['animals:write'] } as unknown as Request;
    const next = mock.fn<NextFunction>();

    middleware(req, {} as Response, next);

    assert.equal(next.mock.calls.length, 1);
    assert.ok(next.mock.calls[0]!.arguments[0] instanceof ForbiddenError);
  });

  it('calls next with ForbiddenError when actorPermissions is undefined', () => {
    const middleware = requirePermission('animals:write');
    const req = {} as unknown as Request;
    const next = mock.fn<NextFunction>();

    middleware(req, {} as Response, next);

    assert.ok(next.mock.calls[0]!.arguments[0] instanceof ForbiddenError);
  });
});
