import type { Prisma } from '@prisma/client';

import { prisma } from '../../db/prisma.js';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const usersRepository = {
  findDefaultRole: (client: PrismaClientOrTx = prisma) => client.role.findFirst({ where: { name: 'User' } }),
  create: (data: Prisma.UserUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.user.create({ data }),
  findById: (id: string, client: PrismaClientOrTx = prisma) => client.user.findUnique({ where: { id } }),
  findByEmail: (email: string, client: PrismaClientOrTx = prisma) =>
    client.user.findUnique({ where: { email } }),
  list: (client: PrismaClientOrTx = prisma) => client.user.findMany({ orderBy: { name: 'asc' } }),
  findRoleById: (id: number, client: PrismaClientOrTx = prisma) => client.role.findUnique({ where: { id } }),
  update: (id: string, data: Prisma.UserUncheckedUpdateInput, client: PrismaClientOrTx = prisma) =>
    client.user.update({ where: { id }, data }),
};
