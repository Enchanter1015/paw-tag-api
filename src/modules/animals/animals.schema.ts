import { z } from 'zod';

export const createAnimalSchema = z.object({
  name: z.string().trim().min(1).max(100),
  dob: z.coerce.date().optional(),
  animalTypeId: z.coerce.number().int().positive(),
  breed: z.string().trim().min(1).max(100).optional(),
  isStreet: z.coerce.boolean().optional(),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;
