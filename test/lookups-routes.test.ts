import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import express from 'express';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const { lookupsService } = await import('../src/modules/lookups/lookups.service.js');
const { lookupsRouter } = await import('../src/modules/lookups/lookups.routes.js');

describe('lookupsRouter', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  const buildApp = () => {
    const app = express();
    app.use(lookupsRouter);
    return app;
  };

  it('GET /animal-types returns the lookup rows', async () => {
    mock.method(lookupsService, 'listAnimalTypes', async () => [{ id: 1, name: 'Dog' }]);

    const res = await request(buildApp()).get('/animal-types').expect(200);

    assert.deepEqual(res.body, [{ id: 1, name: 'Dog' }]);
  });

  it('GET /medical-record-types returns the lookup rows', async () => {
    mock.method(lookupsService, 'listMedicalRecordTypes', async () => [{ id: 1, name: 'Vaccination' }]);

    const res = await request(buildApp()).get('/medical-record-types').expect(200);

    assert.deepEqual(res.body, [{ id: 1, name: 'Vaccination' }]);
  });

  it('GET /vet-hospital-types returns the lookup rows', async () => {
    mock.method(lookupsService, 'listVetHospitalTypes', async () => [{ id: 1, name: 'Clinic' }]);

    const res = await request(buildApp()).get('/vet-hospital-types').expect(200);

    assert.deepEqual(res.body, [{ id: 1, name: 'Clinic' }]);
  });

  it('GET /roles returns the lookup rows', async () => {
    mock.method(lookupsService, 'listRoles', async () => [{ id: 1, name: 'Admin' }]);

    const res = await request(buildApp()).get('/roles').expect(200);

    assert.deepEqual(res.body, [{ id: 1, name: 'Admin' }]);
  });
});
