import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_ENV = 'test';

const {
  addVetHospitalMember,
  getVetHospital,
  listVetHospitalMembers,
  registerVetHospital,
  removeVetHospital,
  removeVetHospitalMember,
  searchVetHospitals,
  updateVetHospital,
  updateVetHospitalMember,
} = await import('../src/modules/vet-hospitals/vet-hospitals.controller.js');
const { vetHospitalsService } = await import('../src/modules/vet-hospitals/vet-hospitals.service.js');

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

describe('registerVetHospital', () => {
  it('responds 201 with the created vet hospital', async () => {
    const created = { id: 'vh-1', name: 'Central Vet' };
    const register = mock.method(vetHospitalsService, 'register', async () => created);

    const req = {
      body: { name: 'Central Vet', vetHospitalTypeId: 1 },
      actorId: 'user-1',
    } as unknown as Request;
    const res = createRes();

    await registerVetHospital(req, res, () => {});

    assert.equal(register.mock.calls[0]!.arguments[0], req.body);
    assert.equal(register.mock.calls[0]!.arguments[1], 'user-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.CREATED);

    register.mock.restore();
  });
});

describe('getVetHospital', () => {
  it('responds 200 with the vet hospital', async () => {
    const vetHospital = { id: 'vh-1' };
    const getById = mock.method(vetHospitalsService, 'getById', async () => vetHospital);

    const req = { params: { id: 'vh-1' } } as unknown as Request;
    const res = createRes();

    await getVetHospital(req, res, () => {});

    assert.equal(getById.mock.calls[0]!.arguments[0], 'vh-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    getById.mock.restore();
  });
});

describe('searchVetHospitals', () => {
  it('responds 200 with matching vet hospitals', async () => {
    const results = [{ id: 'vh-1' }];
    const search = mock.method(vetHospitalsService, 'search', async () => results);

    const req = { query: { name: 'Central' } } as unknown as Request;
    const res = createRes();

    await searchVetHospitals(req, res, () => {});

    assert.equal(search.mock.calls[0]!.arguments[0], 'Central');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    search.mock.restore();
  });
});

describe('updateVetHospital', () => {
  it('responds 200 with the updated vet hospital', async () => {
    const updated = { id: 'vh-1', name: 'Updated' };
    const update = mock.method(vetHospitalsService, 'update', async () => updated);

    const req = { params: { id: 'vh-1' }, body: { name: 'Updated' } } as unknown as Request;
    const res = createRes();

    await updateVetHospital(req, res, () => {});

    assert.equal(update.mock.calls[0]!.arguments[0], 'vh-1');
    assert.deepEqual(update.mock.calls[0]!.arguments[1], { name: 'Updated' });
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    update.mock.restore();
  });
});

describe('removeVetHospital', () => {
  it('responds 204 after removing', async () => {
    const remove = mock.method(vetHospitalsService, 'remove', async () => ({ id: 'vh-1' }));

    const req = { params: { id: 'vh-1' } } as unknown as Request;
    const res = createRes();

    await removeVetHospital(req, res, () => {});

    assert.equal(remove.mock.calls[0]!.arguments[0], 'vh-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.NO_CONTENT);

    remove.mock.restore();
  });
});

describe('addVetHospitalMember', () => {
  it('responds 201 with the created member', async () => {
    const member = { id: 'member-1', vetHospitalId: 'vh-1', userId: 'user-1', roleId: 1 };
    const addMember = mock.method(vetHospitalsService, 'addMember', async () => member);

    const req = { params: { id: 'vh-1' }, body: { userId: 'user-1', roleId: 1 } } as unknown as Request;
    const res = createRes();

    await addVetHospitalMember(req, res, () => {});

    assert.equal(addMember.mock.calls[0]!.arguments[0], 'vh-1');
    assert.deepEqual(addMember.mock.calls[0]!.arguments[1], { userId: 'user-1', roleId: 1 });
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.CREATED);

    addMember.mock.restore();
  });
});

describe('listVetHospitalMembers', () => {
  it('responds 200 with the members list', async () => {
    const members = [{ id: 'member-1' }];
    const listMembers = mock.method(vetHospitalsService, 'listMembers', async () => members);

    const req = { params: { id: 'vh-1' } } as unknown as Request;
    const res = createRes();

    await listVetHospitalMembers(req, res, () => {});

    assert.equal(listMembers.mock.calls[0]!.arguments[0], 'vh-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    listMembers.mock.restore();
  });
});

describe('updateVetHospitalMember', () => {
  it('responds 200 with the updated member', async () => {
    const updated = { id: 'member-1', roleId: 2 };
    const updateMember = mock.method(vetHospitalsService, 'updateMember', async () => updated);

    const req = {
      params: { id: 'vh-1', memberId: 'member-1' },
      body: { roleId: 2 },
    } as unknown as Request;
    const res = createRes();

    await updateVetHospitalMember(req, res, () => {});

    assert.equal(updateMember.mock.calls[0]!.arguments[0], 'vh-1');
    assert.equal(updateMember.mock.calls[0]!.arguments[1], 'member-1');
    assert.deepEqual(updateMember.mock.calls[0]!.arguments[2], { roleId: 2 });
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    updateMember.mock.restore();
  });
});

describe('removeVetHospitalMember', () => {
  it('responds 204 after removing the member', async () => {
    const removeMember = mock.method(vetHospitalsService, 'removeMember', async () => ({ id: 'member-1' }));

    const req = { params: { id: 'vh-1', memberId: 'member-1' } } as unknown as Request;
    const res = createRes();

    await removeVetHospitalMember(req, res, () => {});

    assert.equal(removeMember.mock.calls[0]!.arguments[0], 'vh-1');
    assert.equal(removeMember.mock.calls[0]!.arguments[1], 'member-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.NO_CONTENT);

    removeMember.mock.restore();
  });
});
