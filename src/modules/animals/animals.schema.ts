import { z } from 'zod';

// z.coerce.boolean() is unsuitable here: Boolean("false") is true.
const booleanInput = z.union([z.boolean(), z.enum(['true', 'false'])]).transform((v) => v === true || v === 'true');

export const animalIdParamsSchema = z.object({
  id: z.string().trim().length(8),
});

export const createAnimalSchema = z.object({
  name: z.string().trim().min(1).max(100),
  dob: z.coerce.date().optional(),
  animalTypeId: z.coerce.number().int().positive(),
  breed: z.string().trim().min(1).max(100).optional(),
  isStreet: booleanInput.optional(),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;

export const updateAnimalSchema = createAnimalSchema
  .pick({ name: true, dob: true, animalTypeId: true, breed: true, isStreet: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;

// Location-based search is deferred until GPS columns land on `animal` (SCRUM-54).
export const searchAnimalsQuerySchema = z.object({
  query: z.string().trim().min(1).max(100).optional(),
  animalTypeId: z.coerce.number().int().positive().optional(),
  isStreet: booleanInput.optional(),
});

export type SearchAnimalsQuery = z.infer<typeof searchAnimalsQuerySchema>;
