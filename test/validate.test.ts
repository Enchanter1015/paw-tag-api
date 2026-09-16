import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../src/middleware/validate.js';
import { BadRequestError } from '../src/lib/errors.js';

const createReq = (data: Partial<Record<'body' | 'query' | 'params', unknown>>): Request =>
  ({ body: {}, query: {}, params: {}, ...data }) as unknown as Request;

describe('validate', () => {
  it('skips keys without a schema and calls next with no error', () => {
    const middleware = validate({});
    const req = createReq({});
    const next = mock.fn<NextFunction>();

    middleware(req, {} as Response, next);

    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0]!.arguments[0], undefined);
  });

  it('replaces req.body with the parsed data on success', () => {
    const middleware = validate({ body: z.object({ name: z.string() }) });
    const req = createReq({ body: { name: 'Rex' } });
    const next = mock.fn<NextFunction>();

    middleware(req, {} as Response, next);

    assert.deepEqual(req.body, { name: 'Rex' });
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0]!.arguments[0], undefined);
  });

  it('validates body, query and params together', () => {
    const middleware = validate({
      body: z.object({ name: z.string() }),
      query: z.object({ page: z.coerce.number() }),
      params: z.object({ id: z.string() }),
    });
    const req = createReq({ body: { name: 'Rex' }, query: { page: '2' }, params: { id: 'abc' } });
    const next = mock.fn<NextFunction>();

    middleware(req, {} as Response, next);

    assert.deepEqual(req.body, { name: 'Rex' });
    assert.deepEqual(req.query, { page: 2 });
    assert.deepEqual(req.params, { id: 'abc' });
    assert.equal(next.mock.calls.length, 1);
    assert.equal(next.mock.calls[0]!.arguments[0], undefined);
  });

  it('calls next with a BadRequestError including prefixed issue paths on failure', () => {
    const middleware = validate({ body: z.object({ name: z.string() }) });
    const req = createReq({ body: { name: 42 } });
    const next = mock.fn<NextFunction>();

    middleware(req, {} as Response, next);

    assert.equal(next.mock.calls.length, 1);
    const err = next.mock.calls[0]!.arguments[0] as unknown as BadRequestError;
    assert.ok(err instanceof BadRequestError);
    assert.equal(err.code, 'VALIDATION_ERROR');
    assert.equal(err.message, 'Request validation failed');
    assert.deepEqual(err.details, [{ path: 'body.name', message: 'Expected string, received number' }]);
  });

  it('stops at the first failing key without validating the remaining ones', () => {
    const middleware = validate({
      body: z.object({ name: z.string() }),
      query: z.object({ page: z.coerce.number() }),
    });
    const req = createReq({ body: { name: 1 }, query: { page: 'not-a-number' } });
    const next = mock.fn<NextFunction>();

    middleware(req, {} as Response, next);

    assert.equal(next.mock.calls.length, 1);
    const err = next.mock.calls[0]!.arguments[0] as unknown as BadRequestError;
    assert.ok(err instanceof BadRequestError);
    assert.equal((err.details as Array<{ path: string }>)[0]!.path, 'body.name');
    // query was left untouched because body failed first.
    assert.deepEqual(req.query, { page: 'not-a-number' });
  });
});
