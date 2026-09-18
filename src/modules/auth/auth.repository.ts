import type { Prisma } from '@prisma/client';

import { prisma } from '../../db/prisma.js';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const authRepository = {
  findUserByEmail: (email: string, client: PrismaClientOrTx = prisma) =>
    client.user.findUnique({ where: { email }, include: { role: true } }),
  findUserById: (id: string, client: PrismaClientOrTx = prisma) =>
    client.user.findUnique({ where: { id }, include: { role: true } }),
  findDefaultRole: (client: PrismaClientOrTx = prisma) => client.role.findFirst({ where: { name: 'User' } }),
  createUser: (data: Prisma.UserUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.user.create({ data, include: { role: true } }),
  findRolePermissionNames: (roleId: number, client: PrismaClientOrTx = prisma) =>
    client.permission.findMany({
      where: { rolePermissions: { some: { roleId } } },
      select: { name: true },
    }),
  createRefreshToken: (data: Prisma.RefreshTokenUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.refreshToken.create({ data }),
  findRefreshTokenByHash: (tokenHash: string, client: PrismaClientOrTx = prisma) =>
    client.refreshToken.findUnique({ where: { tokenHash } }),
  revokeRefreshToken: (id: string, client: PrismaClientOrTx = prisma) =>
    client.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),
};
