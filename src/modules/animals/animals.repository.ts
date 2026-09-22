import type { Prisma } from '@prisma/client';

import { prisma } from '../../db/prisma.js';
import { withTransaction } from '../../db/transaction.js';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const animalsRepository = {
  create: (data: Prisma.AnimalUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.animal.create({ data }),
  findById: (id: string, client: PrismaClientOrTx = prisma) =>
    client.animal.findUnique({ where: { id }, include: { images: true } }),
  update: (id: string, data: Prisma.AnimalUncheckedUpdateInput, client: PrismaClientOrTx = prisma) =>
    client.animal.update({ where: { id }, data }),
  search: (where: Prisma.AnimalWhereInput, client: PrismaClientOrTx = prisma) =>
    client.animal.findMany({ where, orderBy: { name: 'asc' }, include: { images: true } }),
  remove: (id: string, client: PrismaClientOrTx = prisma) => client.animal.delete({ where: { id } }),
  // Reassigns weights/medical records/owners from source to target, then deletes source, atomically.
  mergeInto: (sourceId: string, targetId: string) =>
    withTransaction(
      async (tx) => {
        await tx.animalWeight.updateMany({ where: { animalId: sourceId }, data: { animalId: targetId } });
        await tx.medicalRecord.updateMany({ where: { animalId: sourceId }, data: { animalId: targetId } });
        const [sourceOwners, targetOwnerIds] = await Promise.all([
          tx.animalOwner.findMany({ where: { animalId: sourceId } }),
          tx.animalOwner.findMany({ where: { animalId: targetId }, select: { userId: true } }),
        ]);
        const existingTargetUserIds = new Set(targetOwnerIds.map((owner) => owner.userId));
        const ownersToMove = sourceOwners.filter((owner) => !existingTargetUserIds.has(owner.userId));
        if (ownersToMove.length > 0) {
          await tx.animalOwner.createMany({
            data: ownersToMove.map((owner) => ({ userId: owner.userId, animalId: targetId })),
            skipDuplicates: true,
          });
        }
        await tx.animalOwner.deleteMany({ where: { animalId: sourceId } });
        return tx.animal.delete({ where: { id: sourceId } });
      },
      { maxWait: 10_000, timeout: 20_000 },
    ),
};
