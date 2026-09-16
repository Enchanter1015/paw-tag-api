import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_ENV = 'test';

const { getHealth } = await import('../src/modules/health/health.controller.js');
const { config } = await import('../src/config/index.js');

const createRes = () => {
  const json = mock.fn();
  const status = mock.fn(() => ({ json }));
  return { status, json } as unknown as Response & { status: typeof status; json: typeof json };
};

describe('getHealth', () => {
  it('responds 200 with the expected health payload', () => {
    const res = createRes();

    getHealth({} as Request, res);

    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    const statusResult = (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.result as {
      json: ReturnType<typeof mock.fn>;
    };
    const body = statusResult.json.mock.calls[0]!.arguments[0] as {
      status: string;
      service: string;
      env: string;
      uptimeSeconds: number;
      timestamp: string;
    };

    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'paw-tag-api');
    assert.equal(body.env, config.env);
    assert.ok(Number.isInteger(body.uptimeSeconds));
    assert.ok(body.uptimeSeconds >= 0);
    assert.ok(Date.parse(body.timestamp));
  });
});
