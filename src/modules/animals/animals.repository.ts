import type { Prisma } from '@prisma/client';

import { prisma } from '../../db/prisma.js';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const animalsRepository = {
  create: (data: Prisma.AnimalUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.animal.create({ data }),
};
