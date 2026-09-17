import { prisma } from '../../db/prisma.js';

export const lookupsRepository = {
  findAnimalTypes: () => prisma.animalType.findMany({ orderBy: { name: 'asc' } }),
  findMedicalRecordTypes: () => prisma.medicalRecordType.findMany({ orderBy: { name: 'asc' } }),
  findVetHospitalTypes: () => prisma.vetHospitalType.findMany({ orderBy: { name: 'asc' } }),
  findRoles: () => prisma.role.findMany({ orderBy: { name: 'asc' } }),
};
