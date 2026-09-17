import { z } from 'zod';

export const animalIdParamsSchema = z.object({
  id: z.string().trim().length(8),
});

export const createAnimalSchema = z.object({
  name: z.string().trim().min(1).max(100),
  dob: z.coerce.date().optional(),
  animalTypeId: z.coerce.number().int().positive(),
  breed: z.string().trim().min(1).max(100).optional(),
  isStreet: z.coerce.boolean().optional(),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;

export const updateAnimalSchema = createAnimalSchema
  .pick({ name: true, dob: true, animalTypeId: true, breed: true, isStreet: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
