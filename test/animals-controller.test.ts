import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_ENV = 'test';

const { getAnimal, mergeAnimal, registerAnimal, removeAnimal, searchAnimals, updateAnimal } = await import('../src/modules/animals/animals.controller.js');
const { animalsService } = await import('../src/modules/animals/animals.service.js');

const createRes = () => {
  const json = mock.fn();
  const status = mock.fn(() => ({ json }));
  return { status, json } as unknown as Response & { status: typeof status; json: typeof json };
};

describe('registerAnimal', () => {
  it('responds 201 with the created animal', async () => {
    const created = { id: 'abcd1234', name: 'Rex', animalTypeId: 1 };
    const register = mock.method(animalsService, 'register', async () => created);

    const req = { body: { name: 'Rex', animalTypeId: 1 }, actorId: 'user-1' } as unknown as Request;
    const res = createRes();

    await registerAnimal(req, res, () => {});

    assert.equal(register.mock.calls[0]!.arguments[0], req.body);
    assert.equal(register.mock.calls[0]!.arguments[1], 'user-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.CREATED);

    const statusResult = (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.result as {
      json: ReturnType<typeof mock.fn>;
    };
    assert.deepEqual(statusResult.json.mock.calls[0]!.arguments[0], created);

    register.mock.restore();
  });
});

describe('getAnimal', () => {
  it('responds 200 with the requested animal', async () => {
    const animal = { id: 'abcd1234', name: 'Rex' };
    const getById = mock.method(animalsService, 'getById', async () => animal);

    const req = { params: { id: 'abcd1234' } } as unknown as Request;
    const res = createRes();

    await getAnimal(req, res, () => {});

    assert.equal(getById.mock.calls[0]!.arguments[0], 'abcd1234');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    const statusResult = (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.result as {
      json: ReturnType<typeof mock.fn>;
    };
    assert.deepEqual(statusResult.json.mock.calls[0]!.arguments[0], animal);

    getById.mock.restore();
  });
});

describe('updateAnimal', () => {
  it('responds 200 with the updated animal', async () => {
    const animal = { id: 'abcd1234', name: 'Rex Updated' };
    const update = mock.method(animalsService, 'update', async () => animal);

    const req = { params: { id: 'abcd1234' }, body: { name: 'Rex Updated' } } as unknown as Request;
    const res = createRes();

    await updateAnimal(req, res, () => {});

    assert.equal(update.mock.calls[0]!.arguments[0], 'abcd1234');
    assert.equal(update.mock.calls[0]!.arguments[1], req.body);
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    const statusResult = (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.result as {
      json: ReturnType<typeof mock.fn>;
    };
    assert.deepEqual(statusResult.json.mock.calls[0]!.arguments[0], animal);

    update.mock.restore();
  });
});

describe('searchAnimals', () => {
  it('responds 200 with the matching animals', async () => {
    const results = [{ id: 'abcd1234', name: 'Rex' }];
    const search = mock.method(animalsService, 'search', async () => results);

    const req = { query: { query: 'Rex' } } as unknown as Request;
    const res = createRes();

    await searchAnimals(req, res, () => {});

    assert.deepEqual(search.mock.calls[0]!.arguments[0], { query: 'Rex' });
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    const statusResult = (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.result as {
      json: ReturnType<typeof mock.fn>;
    };
    assert.deepEqual(statusResult.json.mock.calls[0]!.arguments[0], results);

    search.mock.restore();
  });
});

describe('removeAnimal', () => {
  it('responds 204 after removing the animal', async () => {
    const remove = mock.method(animalsService, 'remove', async () => ({ id: 'abcd1234' }));
    const send = mock.fn();
    const status = mock.fn(() => ({ send }));

    const req = { params: { id: 'abcd1234' }, actorId: 'user-1' } as unknown as Request;
    const res = { status } as unknown as Response;

    await removeAnimal(req, res, () => {});

    assert.equal(remove.mock.calls[0]!.arguments[0], 'abcd1234');
    assert.equal(remove.mock.calls[0]!.arguments[1], 'user-1');
    assert.equal((status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.NO_CONTENT);

    remove.mock.restore();
  });
});

describe('mergeAnimal', () => {
  it('responds 200 with the merge result', async () => {
    const merged = { id: 'abcd1234' };
    const merge = mock.method(animalsService, 'merge', async () => merged);

    const req = {
      params: { id: 'abcd1234' },
      body: { targetId: 'wxyz5678' },
      actorId: 'user-1',
    } as unknown as Request;
    const res = createRes();

    await mergeAnimal(req, res, () => {});

    assert.equal(merge.mock.calls[0]!.arguments[0], 'abcd1234');
    assert.equal(merge.mock.calls[0]!.arguments[1], 'wxyz5678');
    assert.equal(merge.mock.calls[0]!.arguments[2], 'user-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    const statusResult = (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.result as {
      json: ReturnType<typeof mock.fn>;
    };
    assert.deepEqual(statusResult.json.mock.calls[0]!.arguments[0], merged);

    merge.mock.restore();
  });
});
