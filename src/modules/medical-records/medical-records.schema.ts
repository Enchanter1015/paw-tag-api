import { z } from 'zod';

export const medicalRecordIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const animalMedicalRecordsParamsSchema = z.object({
  animalId: z.string().trim().length(8),
});

// Empty strings arrive from clients that always send the field; treat them as "not provided".
const optionalDate = z.preprocess((value) => (value === '' ? undefined : value), z.coerce.date().optional());

export const createVaccinationRecordSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).optional(),
  medicalRecordTypeId: z.coerce.number().int().positive(),
  prescribedBy: z.string().uuid(),
  administeredAt: optionalDate,
  nextDueDate: optionalDate,
});

export type CreateVaccinationRecordInput = z.infer<typeof createVaccinationRecordSchema>;

export const updateVaccinationRecordSchema = createVaccinationRecordSchema
  .pick({
    title: true,
    description: true,
    medicalRecordTypeId: true,
    prescribedBy: true,
    administeredAt: true,
    nextDueDate: true,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export type UpdateVaccinationRecordInput = z.infer<typeof updateVaccinationRecordSchema>;

export const verifyMedicalRecordSchema = z.object({
  verifiedBy: z.string().uuid(),
});

export type VerifyMedicalRecordInput = z.infer<typeof verifyMedicalRecordSchema>;
