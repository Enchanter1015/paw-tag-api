import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_ENV = 'test';

const { findUserByEmail, getUser, registerUser, updateUser } = await import(
  '../src/modules/users/users.controller.js'
);
const { usersService } = await import('../src/modules/users/users.service.js');

const createRes = () => {
  const json = mock.fn();
  const status = mock.fn(() => ({ json }));
  return { status, json } as unknown as Response & { status: typeof status; json: typeof json };
};

describe('registerUser', () => {
  it('responds 201 with the created user', async () => {
    const created = { id: 'user-1', name: 'Jane', email: 'jane@example.com' };
    const register = mock.method(usersService, 'register', async () => created);

    const req = { body: { name: 'Jane', email: 'jane@example.com' } } as unknown as Request;
    const res = createRes();

    await registerUser(req, res, () => {});

    assert.equal(register.mock.calls[0]!.arguments[0], req.body);
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.CREATED);

    const statusResult = (res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.result as {
      json: ReturnType<typeof mock.fn>;
    };
    assert.deepEqual(statusResult.json.mock.calls[0]!.arguments[0], created);

    register.mock.restore();
  });
});

describe('getUser', () => {
  it('responds 200 with the user', async () => {
    const user = { id: 'user-1', name: 'Jane' };
    const getById = mock.method(usersService, 'getById', async () => user);

    const req = { params: { id: 'user-1' } } as unknown as Request;
    const res = createRes();

    await getUser(req, res, () => {});

    assert.equal(getById.mock.calls[0]!.arguments[0], 'user-1');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    getById.mock.restore();
  });
});

describe('findUserByEmail', () => {
  it('responds 200 with the user matching the email', async () => {
    const user = { id: 'user-1', email: 'jane@example.com' };
    const getByEmail = mock.method(usersService, 'getByEmail', async () => user);

    const req = { query: { email: 'jane@example.com' } } as unknown as Request;
    const res = createRes();

    await findUserByEmail(req, res, () => {});

    assert.equal(getByEmail.mock.calls[0]!.arguments[0], 'jane@example.com');
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    getByEmail.mock.restore();
  });
});

describe('updateUser', () => {
  it('responds 200 with the updated user', async () => {
    const updated = { id: 'user-1', name: 'Jane Updated' };
    const update = mock.method(usersService, 'update', async () => updated);

    const req = { params: { id: 'user-1' }, body: { name: 'Jane Updated' } } as unknown as Request;
    const res = createRes();

    await updateUser(req, res, () => {});

    assert.equal(update.mock.calls[0]!.arguments[0], 'user-1');
    assert.deepEqual(update.mock.calls[0]!.arguments[1], { name: 'Jane Updated' });
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    update.mock.restore();
  });
});
