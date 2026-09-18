import { z } from 'zod';

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  dob: z.coerce.date().optional(),
  googleId: z.string().trim().min(1).max(255).optional(),
  appleId: z.string().trim().min(1).max(255).optional(),
  phoneNo: z.string().trim().min(1).max(20).optional(),
  address: z.string().trim().min(1).max(255).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
  .pick({ name: true, email: true, dob: true, googleId: true, appleId: true, phoneNo: true, address: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const findUserQuerySchema = z.object({
  email: z.string().trim().email().max(255),
});

export type FindUserQuery = z.infer<typeof findUserQuerySchema>;
