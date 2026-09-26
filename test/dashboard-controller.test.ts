import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_ENV = 'test';

const { getDashboardStats } = await import('../src/modules/dashboard/dashboard.controller.js');
const { dashboardService } = await import('../src/modules/dashboard/dashboard.service.js');

const createRes = () => {
  const json = mock.fn();
  const status = mock.fn(() => ({ json }));
  return { status, json } as unknown as Response & { status: typeof status; json: typeof json };
};

describe('getDashboardStats', () => {
  it('responds 200 with the stats from the service', async () => {
    const stats = {
      totalAnimals: 10,
      vaccinatedAnimals: 7,
      vaccinationDueAnimals: 2,
      recentAnimals: [],
    };
    const getStats = mock.method(dashboardService, 'getStats', async () => stats);

    const res = createRes();
    await getDashboardStats({} as Request, res, (() => {}) as never);

    assert.equal(getStats.mock.calls.length, 1);
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    const statusResult = (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.result as {
      json: ReturnType<typeof mock.fn>;
    };
    assert.deepEqual(statusResult.json.mock.calls[0]!.arguments[0], stats);

    getStats.mock.restore();
  });
});
