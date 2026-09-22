import { z } from 'zod';

export const animalImagesParamsSchema = z.object({
  animalId: z.string().trim().length(8),
});

export const medicalRecordImagesParamsSchema = z.object({
  id: z.string().uuid(),
});
