import type { Prisma } from '@prisma/client';

import { prisma } from '../../db/prisma.js';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const medicalRecordsRepository = {
  findTypeByName: (name: string, client: PrismaClientOrTx = prisma) =>
    client.medicalRecordType.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } }),
  findTypeById: (id: number, client: PrismaClientOrTx = prisma) =>
    client.medicalRecordType.findUnique({ where: { id } }),
  findAnimalById: (animalId: string, client: PrismaClientOrTx = prisma) =>
    client.animal.findUnique({ where: { id: animalId } }),
  findVetHospitalMemberById: (id: string, client: PrismaClientOrTx = prisma) =>
    client.vetHospitalMember.findUnique({ where: { id } }),
  findVetHospitalById: (id: string, client: PrismaClientOrTx = prisma) =>
    client.vetHospital.findUnique({ where: { id } }),
  create: (data: Prisma.MedicalRecordUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.medicalRecord.create({ data }),
  findById: (id: string, client: PrismaClientOrTx = prisma) =>
    client.medicalRecord.findUnique({ where: { id }, include: { images: true } }),
  update: (id: string, data: Prisma.MedicalRecordUncheckedUpdateInput, client: PrismaClientOrTx = prisma) =>
    client.medicalRecord.update({ where: { id }, data }),
  listByAnimal: (animalId: string, client: PrismaClientOrTx = prisma) =>
    client.medicalRecord.findMany({
      where: { animalId },
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    }),
};
