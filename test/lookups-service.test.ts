import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

process.env.NODE_ENV = 'test';

const { lookupsRepository } = await import('../src/modules/lookups/lookups.repository.js');
const { lookupsService } = await import('../src/modules/lookups/lookups.service.js');

describe('lookupsService', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it('listAnimalTypes delegates to the repository', async () => {
    const rows = [{ id: 1, name: 'Dog' }];
    mock.method(lookupsRepository, 'findAnimalTypes', async () => rows);

    assert.deepEqual(await lookupsService.listAnimalTypes(), rows);
  });

  it('listMedicalRecordTypes delegates to the repository', async () => {
    const rows = [{ id: 1, name: 'Vaccination' }];
    mock.method(lookupsRepository, 'findMedicalRecordTypes', async () => rows);

    assert.deepEqual(await lookupsService.listMedicalRecordTypes(), rows);
  });

  it('listVetHospitalTypes delegates to the repository', async () => {
    const rows = [{ id: 1, name: 'Clinic' }];
    mock.method(lookupsRepository, 'findVetHospitalTypes', async () => rows);

    assert.deepEqual(await lookupsService.listVetHospitalTypes(), rows);
  });

  it('listRoles delegates to the repository', async () => {
    const rows = [{ id: 1, name: 'Admin' }];
    mock.method(lookupsRepository, 'findRoles', async () => rows);

    assert.deepEqual(await lookupsService.listRoles(), rows);
  });
});
