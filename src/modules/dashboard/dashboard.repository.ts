import { prisma } from '../../db/prisma.js';

export const dashboardRepository = {
  countAnimals: () => prisma.animal.count(),
  countVaccinatedAnimals: () =>
    prisma.animal.count({ where: { medicalRecords: { some: {} } } }),
  countVaccinationDueAnimals: (asOf: Date) =>
    prisma.animal.count({ where: { medicalRecords: { some: { nextDueDate: { lte: asOf } } } } }),
  listRecentAnimals: (take: number) =>
    prisma.animal.findMany({ orderBy: { createdAt: 'desc' }, take }),
};
