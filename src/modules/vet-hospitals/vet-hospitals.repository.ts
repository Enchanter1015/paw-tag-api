import type { Prisma } from '@prisma/client';

import { prisma } from '../../db/prisma.js';

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export const vetHospitalsRepository = {
  create: (data: Prisma.VetHospitalUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.vetHospital.create({ data }),
  findById: (id: string, client: PrismaClientOrTx = prisma) =>
    client.vetHospital.findUnique({ where: { id } }),
  search: (where: Prisma.VetHospitalWhereInput, client: PrismaClientOrTx = prisma) =>
    client.vetHospital.findMany({ where, orderBy: { name: 'asc' } }),
  update: (id: string, data: Prisma.VetHospitalUncheckedUpdateInput, client: PrismaClientOrTx = prisma) =>
    client.vetHospital.update({ where: { id }, data }),
  remove: (id: string, client: PrismaClientOrTx = prisma) =>
    client.vetHospital.update({ where: { id }, data: { isArchived: true } }),
  addMember: (data: Prisma.VetHospitalMemberUncheckedCreateInput, client: PrismaClientOrTx = prisma) =>
    client.vetHospitalMember.create({ data }),
  findMemberById: (vetHospitalId: string, memberId: string, client: PrismaClientOrTx = prisma) =>
    client.vetHospitalMember.findFirst({ where: { id: memberId, vetHospitalId } }),
  updateMember: (
    memberId: string,
    data: Prisma.VetHospitalMemberUncheckedUpdateInput,
    client: PrismaClientOrTx = prisma,
  ) => client.vetHospitalMember.update({ where: { id: memberId }, data }),
  removeMember: (memberId: string, client: PrismaClientOrTx = prisma) =>
    client.vetHospitalMember.delete({ where: { id: memberId } }),
  listMembers: (vetHospitalId: string, client: PrismaClientOrTx = prisma) =>
    client.vetHospitalMember.findMany({ where: { vetHospitalId }, orderBy: { joinedAt: 'asc' } }),
};
