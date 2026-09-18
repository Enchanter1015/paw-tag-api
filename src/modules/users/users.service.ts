import type { CreateUserInput, UpdateUserInput } from './users.schema.js';
import { usersRepository } from './users.repository.js';
import { BadRequestError, NotFoundError } from '../../lib/errors.js';

export const usersService = {
  register: async (input: CreateUserInput) => {
    const role = await usersRepository.findDefaultRole();
    if (!role) {
      throw new BadRequestError("Default 'User' role is not configured");
    }
    // Created without a password; the user can only authenticate once one is set via POST /auth/register.
    return usersRepository.create({ ...input, roleId: role.id });
  },
  getById: async (id: string) => {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }
    return user;
  },
  getByEmail: async (email: string) => {
    const user = await usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError(`User with email ${email} not found`);
    }
    return user;
  },
  update: async (id: string, input: UpdateUserInput) => {
    // P2025 (not found) and P2002 (duplicate email/google_id/apple_id) are mapped by the global error handler.
    return usersRepository.update(id, input);
  },
};
