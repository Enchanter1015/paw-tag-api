import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_ENV = 'test';

const {
  addVaccinationRecord,
  getMedicalRecord,
  listVaccinationRecords,
  updateVaccinationRecord,
  verifyMedicalRecord,
} = await import('../src/modules/medical-records/medical-records.controller.js');
const { medicalRecordsService } = await import('../src/modules/medical-records/medical-records.service.js');

const createRes = () => {
  const json = mock.fn();
  const send = mock.fn();
  const status = mock.fn(() => ({ json, send }));
  return { status, json, send } as unknown as Response & {
    status: typeof status;
    json: typeof json;
    send: typeof send;
  };
};

describe('addVaccinationRecord', () => {
  it('responds 201 with the created record', async () => {
    const created = { id: 'record-1' };
    const add = mock.method(medicalRecordsService, 'addVaccinationRecord', async () => created);

    const req = {
      params: { animalId: 'a1b2c3d4' },
      body: { title: 'Rabies vaccine', medicalRecordTypeId: 6, prescribedBy: 'member-1' },
      actorId: 'user-1',
    } as unknown as Request;
    const res = createRes();

    await addVaccinationRecord(req, res, () => {});

    assert.equal(add.mock.calls[0]!.arguments[0], 'a1b2c3d4');
    assert.equal(add.mock.calls[0]!.arguments[1], req.body);
    assert.equal(add.mock.calls[0]!.arguments[2], 'user-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.CREATED);

    add.mock.restore();
  });
});

describe('listVaccinationRecords', () => {
  it('responds 200 with the records', async () => {
    const records = [{ id: 'record-1' }];
    const list = mock.method(medicalRecordsService, 'listVaccinationRecords', async () => records);

    const req = { params: { animalId: 'a1b2c3d4' } } as unknown as Request;
    const res = createRes();

    await listVaccinationRecords(req, res, () => {});

    assert.equal(list.mock.calls[0]!.arguments[0], 'a1b2c3d4');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    list.mock.restore();
  });
});

describe('getMedicalRecord', () => {
  it('responds 200 with the record', async () => {
    const record = { id: 'record-1' };
    const getById = mock.method(medicalRecordsService, 'getById', async () => record);

    const req = { params: { id: 'record-1' } } as unknown as Request;
    const res = createRes();

    await getMedicalRecord(req, res, () => {});

    assert.equal(getById.mock.calls[0]!.arguments[0], 'record-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    getById.mock.restore();
  });
});

describe('updateVaccinationRecord', () => {
  it('responds 200 with the updated record', async () => {
    const updated = { id: 'record-1', title: 'Updated' };
    const update = mock.method(medicalRecordsService, 'updateVaccinationRecord', async () => updated);

    const req = { params: { id: 'record-1' }, body: { title: 'Updated' } } as unknown as Request;
    const res = createRes();

    await updateVaccinationRecord(req, res, () => {});

    assert.equal(update.mock.calls[0]!.arguments[0], 'record-1');
    assert.deepEqual(update.mock.calls[0]!.arguments[1], { title: 'Updated' });
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    update.mock.restore();
  });
});

describe('verifyMedicalRecord', () => {
  it('responds 200 with the verified record', async () => {
    const verified = { id: 'record-1', verifiedBy: 'member-1' };
    const verify = mock.method(medicalRecordsService, 'verify', async () => verified);

    const req = { params: { id: 'record-1' }, body: { verifiedBy: 'member-1' } } as unknown as Request;
    const res = createRes();

    await verifyMedicalRecord(req, res, () => {});

    assert.equal(verify.mock.calls[0]!.arguments[0], 'record-1');
    assert.deepEqual(verify.mock.calls[0]!.arguments[1], { verifiedBy: 'member-1' });
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    verify.mock.restore();
  });
});
