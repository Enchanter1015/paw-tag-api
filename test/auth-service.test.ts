import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-test-access-secret-32';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-test-refresh-secret-32';

const { authService } = await import('../src/modules/auth/auth.service.js');
const { authRepository } = await import('../src/modules/auth/auth.repository.js');
const { passwordService } = await import('../src/lib/password.js');
const { tokenService } = await import('../src/lib/tokens.js');
const { BadRequestError, ConflictError, UnauthorizedError } = await import('../src/lib/errors.js');

const role = { id: 2, name: 'User' };
const user = { id: 'user-1', email: 'jane@example.com', passwordHash: 'hashed', roleId: 2, role, isActive: true };

describe('authService.register', () => {
  it('creates a user with a hashed password under the default role and returns a token pair', async () => {
    const findUserByEmail = mock.method(authRepository, 'findUserByEmail', async () => null);
    const findDefaultRole = mock.method(authRepository, 'findDefaultRole', async () => role);
    const hashPassword = mock.method(passwordService, 'hashPassword', async () => 'hashed');
    const createUser = mock.method(authRepository, 'createUser', async () => user);
    const findRolePermissionNames = mock.method(authRepository, 'findRolePermissionNames', async () => [
      { name: 'animals:write' },
    ]);
    const signAccessToken = mock.method(tokenService, 'signAccessToken', () => 'access-token');
    const generateRefreshToken = mock.method(tokenService, 'generateRefreshToken', () => 'refresh-token');
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'refresh-token-hash');
    const refreshTokenExpiresAt = mock.method(tokenService, 'refreshTokenExpiresAt', () => new Date('2030-01-01'));
    const createRefreshToken = mock.method(authRepository, 'createRefreshToken', async () => ({}));

    const result = await authService.register({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });

    assert.deepEqual(createUser.mock.calls[0]!.arguments[0], {
      name: 'Jane',
      email: 'jane@example.com',
      passwordHash: 'hashed',
      roleId: 2,
    });
    assert.deepEqual(signAccessToken.mock.calls[0]!.arguments[0], {
      sub: 'user-1',
      role: 'User',
      permissions: ['animals:write'],
    });
    assert.deepEqual(createRefreshToken.mock.calls[0]!.arguments[0], {
      userId: 'user-1',
      tokenHash: 'refresh-token-hash',
      expiresAt: new Date('2030-01-01'),
    });
    assert.deepEqual(result, { accessToken: 'access-token', refreshToken: 'refresh-token' });

    findUserByEmail.mock.restore();
    findDefaultRole.mock.restore();
    hashPassword.mock.restore();
    createUser.mock.restore();
    findRolePermissionNames.mock.restore();
    signAccessToken.mock.restore();
    generateRefreshToken.mock.restore();
    hashRefreshToken.mock.restore();
    refreshTokenExpiresAt.mock.restore();
    createRefreshToken.mock.restore();
  });

  it('throws ConflictError when the email is already registered', async () => {
    const findUserByEmail = mock.method(authRepository, 'findUserByEmail', async () => user);

    await assert.rejects(
      () => authService.register({ name: 'Jane', email: 'jane@example.com', password: 'password123' }),
      ConflictError,
    );

    findUserByEmail.mock.restore();
  });

  it('throws BadRequestError when the default role is not configured', async () => {
    const findUserByEmail = mock.method(authRepository, 'findUserByEmail', async () => null);
    const findDefaultRole = mock.method(authRepository, 'findDefaultRole', async () => null);

    await assert.rejects(
      () => authService.register({ name: 'Jane', email: 'jane@example.com', password: 'password123' }),
      BadRequestError,
    );

    findUserByEmail.mock.restore();
    findDefaultRole.mock.restore();
  });
});

describe('authService.login', () => {
  it('issues a token pair on correct credentials', async () => {
    const findUserByEmail = mock.method(authRepository, 'findUserByEmail', async () => user);
    const verifyPassword = mock.method(passwordService, 'verifyPassword', async () => true);
    const findRolePermissionNames = mock.method(authRepository, 'findRolePermissionNames', async () => []);
    const signAccessToken = mock.method(tokenService, 'signAccessToken', () => 'access-token');
    const generateRefreshToken = mock.method(tokenService, 'generateRefreshToken', () => 'refresh-token');
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const refreshTokenExpiresAt = mock.method(tokenService, 'refreshTokenExpiresAt', () => new Date());
    const createRefreshToken = mock.method(authRepository, 'createRefreshToken', async () => ({}));

    const result = await authService.login({ email: 'jane@example.com', password: 'password123' });

    assert.deepEqual(result, { accessToken: 'access-token', refreshToken: 'refresh-token' });

    findUserByEmail.mock.restore();
    verifyPassword.mock.restore();
    findRolePermissionNames.mock.restore();
    signAccessToken.mock.restore();
    generateRefreshToken.mock.restore();
    hashRefreshToken.mock.restore();
    refreshTokenExpiresAt.mock.restore();
    createRefreshToken.mock.restore();
  });

  it('throws UnauthorizedError when the user does not exist', async () => {
    const findUserByEmail = mock.method(authRepository, 'findUserByEmail', async () => null);

    await assert.rejects(
      () => authService.login({ email: 'missing@example.com', password: 'password123' }),
      UnauthorizedError,
    );

    findUserByEmail.mock.restore();
  });

  it('throws UnauthorizedError when the user has no password set', async () => {
    const findUserByEmail = mock.method(authRepository, 'findUserByEmail', async () => ({ ...user, passwordHash: null }));

    await assert.rejects(
      () => authService.login({ email: 'jane@example.com', password: 'password123' }),
      UnauthorizedError,
    );

    findUserByEmail.mock.restore();
  });

  it('throws UnauthorizedError on a wrong password', async () => {
    const findUserByEmail = mock.method(authRepository, 'findUserByEmail', async () => user);
    const verifyPassword = mock.method(passwordService, 'verifyPassword', async () => false);

    await assert.rejects(
      () => authService.login({ email: 'jane@example.com', password: 'wrong' }),
      UnauthorizedError,
    );

    findUserByEmail.mock.restore();
    verifyPassword.mock.restore();
  });

  it('throws UnauthorizedError when the account is deactivated', async () => {
    const findUserByEmail = mock.method(authRepository, 'findUserByEmail', async () => ({ ...user, isActive: false }));
    const verifyPassword = mock.method(passwordService, 'verifyPassword', async () => true);

    await assert.rejects(
      () => authService.login({ email: 'jane@example.com', password: 'password123' }),
      UnauthorizedError,
    );

    findUserByEmail.mock.restore();
    verifyPassword.mock.restore();
  });
});

describe('authService.refresh', () => {
  it('rotates a valid refresh token and returns a new pair', async () => {
    const stored = { id: 'rt-1', userId: 'user-1', revokedAt: null, expiresAt: new Date('2999-01-01') };
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const findRefreshTokenByHash = mock.method(authRepository, 'findRefreshTokenByHash', async () => stored);
    const revokeRefreshToken = mock.method(authRepository, 'revokeRefreshToken', async () => ({}));
    const findUserById = mock.method(authRepository, 'findUserById', async () => user);
    const findRolePermissionNames = mock.method(authRepository, 'findRolePermissionNames', async () => []);
    const signAccessToken = mock.method(tokenService, 'signAccessToken', () => 'new-access-token');
    const generateRefreshToken = mock.method(tokenService, 'generateRefreshToken', () => 'new-refresh-token');
    const refreshTokenExpiresAt = mock.method(tokenService, 'refreshTokenExpiresAt', () => new Date());
    const createRefreshToken = mock.method(authRepository, 'createRefreshToken', async () => ({}));

    const result = await authService.refresh({ refreshToken: 'presented-token' });

    assert.equal(revokeRefreshToken.mock.calls[0]!.arguments[0], 'rt-1');
    assert.deepEqual(result, { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' });

    hashRefreshToken.mock.restore();
    findRefreshTokenByHash.mock.restore();
    revokeRefreshToken.mock.restore();
    findUserById.mock.restore();
    findRolePermissionNames.mock.restore();
    signAccessToken.mock.restore();
    generateRefreshToken.mock.restore();
    refreshTokenExpiresAt.mock.restore();
    createRefreshToken.mock.restore();
  });

  it('throws UnauthorizedError when the token is unknown', async () => {
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const findRefreshTokenByHash = mock.method(authRepository, 'findRefreshTokenByHash', async () => null);

    await assert.rejects(() => authService.refresh({ refreshToken: 'nope' }), UnauthorizedError);

    hashRefreshToken.mock.restore();
    findRefreshTokenByHash.mock.restore();
  });

  it('throws UnauthorizedError when the token is revoked', async () => {
    const stored = { id: 'rt-1', userId: 'user-1', revokedAt: new Date(), expiresAt: new Date('2999-01-01') };
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const findRefreshTokenByHash = mock.method(authRepository, 'findRefreshTokenByHash', async () => stored);

    await assert.rejects(() => authService.refresh({ refreshToken: 'revoked' }), UnauthorizedError);

    hashRefreshToken.mock.restore();
    findRefreshTokenByHash.mock.restore();
  });

  it('throws UnauthorizedError when the token is expired', async () => {
    const stored = { id: 'rt-1', userId: 'user-1', revokedAt: null, expiresAt: new Date('2000-01-01') };
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const findRefreshTokenByHash = mock.method(authRepository, 'findRefreshTokenByHash', async () => stored);

    await assert.rejects(() => authService.refresh({ refreshToken: 'expired' }), UnauthorizedError);

    hashRefreshToken.mock.restore();
    findRefreshTokenByHash.mock.restore();
  });

  it('throws UnauthorizedError when the account is deactivated', async () => {
    const stored = { id: 'rt-1', userId: 'user-1', revokedAt: null, expiresAt: new Date('2999-01-01') };
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const findRefreshTokenByHash = mock.method(authRepository, 'findRefreshTokenByHash', async () => stored);
    const revokeRefreshToken = mock.method(authRepository, 'revokeRefreshToken', async () => ({}));
    const findUserById = mock.method(authRepository, 'findUserById', async () => ({ ...user, isActive: false }));

    await assert.rejects(() => authService.refresh({ refreshToken: 'presented-token' }), UnauthorizedError);

    hashRefreshToken.mock.restore();
    findRefreshTokenByHash.mock.restore();
    revokeRefreshToken.mock.restore();
    findUserById.mock.restore();
  });
});

describe('authService.logout', () => {
  it('revokes an active refresh token', async () => {
    const stored = { id: 'rt-1', revokedAt: null };
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const findRefreshTokenByHash = mock.method(authRepository, 'findRefreshTokenByHash', async () => stored);
    const revokeRefreshToken = mock.method(authRepository, 'revokeRefreshToken', async () => ({}));

    await authService.logout({ refreshToken: 'presented-token' });

    assert.equal(revokeRefreshToken.mock.calls[0]!.arguments[0], 'rt-1');

    hashRefreshToken.mock.restore();
    findRefreshTokenByHash.mock.restore();
    revokeRefreshToken.mock.restore();
  });

  it('is a no-op when the token is unknown', async () => {
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const findRefreshTokenByHash = mock.method(authRepository, 'findRefreshTokenByHash', async () => null);
    const revokeRefreshToken = mock.method(authRepository, 'revokeRefreshToken', async () => ({}));

    await authService.logout({ refreshToken: 'unknown' });

    assert.equal(revokeRefreshToken.mock.calls.length, 0);

    hashRefreshToken.mock.restore();
    findRefreshTokenByHash.mock.restore();
    revokeRefreshToken.mock.restore();
  });

  it('is a no-op when the token is already revoked', async () => {
    const stored = { id: 'rt-1', revokedAt: new Date() };
    const hashRefreshToken = mock.method(tokenService, 'hashRefreshToken', () => 'hash');
    const findRefreshTokenByHash = mock.method(authRepository, 'findRefreshTokenByHash', async () => stored);
    const revokeRefreshToken = mock.method(authRepository, 'revokeRefreshToken', async () => ({}));

    await authService.logout({ refreshToken: 'already-revoked' });

    assert.equal(revokeRefreshToken.mock.calls.length, 0);

    hashRefreshToken.mock.restore();
    findRefreshTokenByHash.mock.restore();
    revokeRefreshToken.mock.restore();
  });
});
