import { z } from 'zod';

export const vetHospitalIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const vetHospitalMemberParamsSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
});

export const createVetHospitalSchema = z.object({
  name: z.string().trim().min(1).max(150),
  phoneNo: z.string().trim().min(1).max(20).optional(),
  address: z.string().trim().min(1).max(255).optional(),
  businessEmail: z.string().trim().email().max(255).optional(),
  vetHospitalTypeId: z.coerce.number().int().positive(),
});

export type CreateVetHospitalInput = z.infer<typeof createVetHospitalSchema>;

export const updateVetHospitalSchema = createVetHospitalSchema
  .pick({ name: true, phoneNo: true, address: true, businessEmail: true, vetHospitalTypeId: true })
  .partial()
  .extend({ isVerified: z.boolean().optional() })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export type UpdateVetHospitalInput = z.infer<typeof updateVetHospitalSchema>;

export const addVetHospitalMemberSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.coerce.number().int().positive(),
});

export type AddVetHospitalMemberInput = z.infer<typeof addVetHospitalMemberSchema>;

export const updateVetHospitalMemberSchema = z.object({
  roleId: z.coerce.number().int().positive(),
});

export type UpdateVetHospitalMemberInput = z.infer<typeof updateVetHospitalMemberSchema>;
