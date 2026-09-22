import type { Role, User } from '@prisma/client';

import { authRepository } from './auth.repository.js';
import type { LoginInput, LogoutInput, RefreshInput, RegisterInput } from './auth.schema.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../../lib/errors.js';
import { passwordService } from '../../lib/password.js';
import { tokenService } from '../../lib/tokens.js';

const issueTokenPair = async (user: User & { role: Role }) => {
  const permissionRows = await authRepository.findRolePermissionNames(user.roleId);
  const accessToken = tokenService.signAccessToken({
    sub: user.id,
    role: user.role.name,
    permissions: permissionRows.map((p) => p.name),
  });

  const refreshToken = tokenService.generateRefreshToken();
  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: tokenService.hashRefreshToken(refreshToken),
    expiresAt: tokenService.refreshTokenExpiresAt(),
  });

  return { accessToken, refreshToken };
};

export const authService = {
  register: async (input: RegisterInput) => {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const role = await authRepository.findDefaultRole();
    if (!role) {
      throw new BadRequestError("Default 'User' role is not configured");
    }

    const { password, ...profile } = input;
    const passwordHash = await passwordService.hashPassword(password);
    const user = await authRepository.createUser({ ...profile, passwordHash, roleId: role.id });

    return issueTokenPair(user);
  },

  login: async (input: LoginInput) => {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user?.passwordHash || !(await passwordService.verifyPassword(input.password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    return issueTokenPair(user);
  },

  refresh: async (input: RefreshInput) => {
    const tokenHash = tokenService.hashRefreshToken(input.refreshToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Rotate: the presented token is single-use regardless of what happens next.
    await authRepository.revokeRefreshToken(stored.id);

    const user = await authRepository.findUserById(stored.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    return issueTokenPair(user);
  },

  logout: async (input: LogoutInput) => {
    const tokenHash = tokenService.hashRefreshToken(input.refreshToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);
    if (stored && !stored.revokedAt) {
      await authRepository.revokeRefreshToken(stored.id);
    }
  },
};
