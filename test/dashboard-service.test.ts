import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

process.env.NODE_ENV = 'test';

const { dashboardService } = await import('../src/modules/dashboard/dashboard.service.js');
const { dashboardRepository } = await import('../src/modules/dashboard/dashboard.repository.js');

describe('dashboardService.getStats', () => {
  it('aggregates counts and the recent animals list from the repository', async () => {
    const recentAnimals = [{ id: 'abcd1234', name: 'Rex' }];
    const countAnimals = mock.method(dashboardRepository, 'countAnimals', async () => 10);
    const countVaccinatedAnimals = mock.method(dashboardRepository, 'countVaccinatedAnimals', async () => 7);
    const countVaccinationDueAnimals = mock.method(
      dashboardRepository,
      'countVaccinationDueAnimals',
      async () => 2,
    );
    const listRecentAnimals = mock.method(dashboardRepository, 'listRecentAnimals', async () => recentAnimals);

    const result = await dashboardService.getStats();

    assert.deepEqual(result, {
      totalAnimals: 10,
      vaccinatedAnimals: 7,
      vaccinationDueAnimals: 2,
      recentAnimals,
    });
    assert.equal(listRecentAnimals.mock.calls[0]!.arguments[0], 10);
    assert.ok(countVaccinationDueAnimals.mock.calls[0]!.arguments[0] instanceof Date);

    countAnimals.mock.restore();
    countVaccinatedAnimals.mock.restore();
    countVaccinationDueAnimals.mock.restore();
    listRecentAnimals.mock.restore();
  });
});
