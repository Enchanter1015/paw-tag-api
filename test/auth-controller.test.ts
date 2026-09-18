import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_ENV = 'test';

const { register, login, refresh, logout } = await import('../src/modules/auth/auth.controller.js');
const { authService } = await import('../src/modules/auth/auth.service.js');

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

describe('register', () => {
  it('responds 201 with the token pair', async () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    const registerMock = mock.method(authService, 'register', async () => tokens);

    const req = { body: { name: 'Jane', email: 'jane@example.com', password: 'password123' } } as unknown as Request;
    const res = createRes();

    await register(req, res, () => {});

    assert.equal(registerMock.mock.calls[0]!.arguments[0], req.body);
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.CREATED);

    registerMock.mock.restore();
  });
});

describe('login', () => {
  it('responds 200 with the token pair', async () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    const loginMock = mock.method(authService, 'login', async () => tokens);

    const req = { body: { email: 'jane@example.com', password: 'password123' } } as unknown as Request;
    const res = createRes();

    await login(req, res, () => {});

    assert.equal(loginMock.mock.calls[0]!.arguments[0], req.body);
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    loginMock.mock.restore();
  });
});

describe('refresh', () => {
  it('responds 200 with the rotated token pair', async () => {
    const tokens = { accessToken: 'a2', refreshToken: 'r2' };
    const refreshMock = mock.method(authService, 'refresh', async () => tokens);

    const req = { body: { refreshToken: 'r' } } as unknown as Request;
    const res = createRes();

    await refresh(req, res, () => {});

    assert.equal(refreshMock.mock.calls[0]!.arguments[0], req.body);
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.OK);

    refreshMock.mock.restore();
  });
});

describe('logout', () => {
  it('responds 204 after revoking', async () => {
    const logoutMock = mock.method(authService, 'logout', async () => undefined);

    const req = { body: { refreshToken: 'r' } } as unknown as Request;
    const res = createRes();

    await logout(req, res, () => {});

    assert.equal(logoutMock.mock.calls[0]!.arguments[0], req.body);
    assert.equal((res.status as ReturnType<typeof mock.fn>).mock.calls[0]!.arguments[0], StatusCodes.NO_CONTENT);

    logoutMock.mock.restore();
  });
});
