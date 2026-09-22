import type { Prisma } from '@prisma/client';

import { prisma } from '../../db/prisma.js';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const imagesRepository = {
  findAnimalById: (animalId: string, client: PrismaClientOrTx = prisma) =>
    client.animal.findUnique({ where: { id: animalId } }),
  findMedicalRecordById: (id: string, client: PrismaClientOrTx = prisma) =>
    client.medicalRecord.findUnique({ where: { id } }),
  createAnimalImages: (data: Prisma.AnimalImageUncheckedCreateInput[], client: PrismaClientOrTx = prisma) =>
    client.animalImage.createManyAndReturn({ data }),
  createMedicalRecordImages: (
    data: Prisma.MedicalRecordImageUncheckedCreateInput[],
    client: PrismaClientOrTx = prisma,
  ) => client.medicalRecordImage.createManyAndReturn({ data }),
};
