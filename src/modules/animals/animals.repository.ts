import type { Prisma } from '@prisma/client';

import { prisma } from '../../db/prisma.js';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const animalsRepository = {
  create: (data: Prisma.AnimalUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.animal.create({ data }),
  findById: (id: string, client: PrismaClientOrTx = prisma) => client.animal.findUnique({ where: { id } }),
};
