import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError } from 'zod';

process.env.NODE_ENV = 'test';

const { errorHandler } = await import('../src/middleware/error-handler.js');
const { BadRequestError } = await import('../src/lib/errors.js');

interface MockLog {
  error: ReturnType<typeof mock.fn>;
  warn: ReturnType<typeof mock.fn>;
}

const createReq = (log?: MockLog): Request =>
  ({ id: 'req-1', log }) as unknown as Request;

const createRes = () => {
  const json = mock.fn();
  const status = mock.fn(() => ({ json }));
  return { status, json } as unknown as Response & { status: typeof status; json: typeof json };
};

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
    stack?: string;
  };
}

const getJsonBody = (res: ReturnType<typeof createRes>): ErrorBody => {
  const statusMock = res.status as ReturnType<typeof mock.fn>;
  const statusResult = statusMock.mock.calls[0]!.result as { json: ReturnType<typeof mock.fn> };
  return statusResult.json.mock.calls[0]!.arguments[0] as ErrorBody;
};

describe('errorHandler', () => {
  it('handles AppError instances without details, logging a warning', () => {
    const log: MockLog = { error: mock.fn(), warn: mock.fn() };
    const req = createReq(log);
    const res = createRes();
    const err = new BadRequestError('bad input');

    errorHandler(err, req, res as unknown as Response, () => {});

    assert.equal(log.error.mock.calls.length, 0);
    assert.equal(log.warn.mock.calls.length, 1);
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.BAD_REQUEST);

    const body = getJsonBody(res);
    assert.equal(body.error.code, 'BAD_REQUEST');
    assert.equal(body.error.message, 'bad input');
    assert.equal(body.error.details, undefined);
    assert.equal(body.error.requestId, 'req-1');
    assert.ok('stack' in body.error);
  });

  it('handles AppError instances with details', () => {
    const req = createReq();
    const res = createRes();
    const err = new BadRequestError('bad input', { details: { field: 'name' } });

    errorHandler(err, req, res as unknown as Response, () => {});

    const body = getJsonBody(res);
    assert.deepEqual(body.error.details, { field: 'name' });
  });

  it('handles ZodError instances', () => {
    const req = createReq();
    const res = createRes();
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({});
    const err = result.error as ZodError;

    errorHandler(err, req, res as unknown as Response, () => {});

    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.BAD_REQUEST);
    const body = getJsonBody(res);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.equal(body.error.message, 'Request validation failed');
    assert.ok(Array.isArray(body.error.details));
    assert.equal(body.error.details[0].path, 'name');
  });

  it('handles body-parser-like errors carrying a 4xx status', () => {
    const req = createReq();
    const res = createRes();
    const err = Object.assign(new Error('bad json'), { status: 401 });

    errorHandler(err, req, res as unknown as Response, () => {});

    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], 401);
    const body = getJsonBody(res);
    assert.equal(body.error.code, 'BAD_REQUEST');
    assert.equal(body.error.message, 'Unauthorized');
  });

  it('falls back to a 500 for unrecognized errors and logs an error', () => {
    const log: MockLog = { error: mock.fn(), warn: mock.fn() };
    const req = createReq(log);
    const res = createRes();
    const err = new Error('boom');

    errorHandler(err, req, res as unknown as Response, () => {});

    assert.equal(log.error.mock.calls.length, 1);
    assert.equal(log.warn.mock.calls.length, 0);
    assert.equal(
      (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0],
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    const body = getJsonBody(res);
    assert.equal(body.error.code, 'INTERNAL_ERROR');
    assert.equal(body.error.message, 'An unexpected error occurred');
  });

  it('does not throw when req.log is undefined', () => {
    const req = createReq(undefined);
    const res = createRes();

    assert.doesNotThrow(() => {
      errorHandler(new Error('boom'), req, res as unknown as Response, () => {});
    });
  });

  it('treats AppError instances that carry a plain object as an unrecognized error', () => {
    const req = createReq();
    const res = createRes();
    // A non-Error, non-ZodError, non-http-status object hits the final fallback branch.
    const err = { message: 'weird' };

    errorHandler(err, req, res as unknown as Response, () => {});

    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
