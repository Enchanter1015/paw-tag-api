import type { CreateAnimalInput } from './animals.schema.js';
import { animalsRepository } from './animals.repository.js';
import { NotFoundError } from '../../lib/errors.js';

export const animalsService = {
  // The 8-char id is DB-generated; clients never supply it.
  register: (input: CreateAnimalInput, createdBy: string) =>
    animalsRepository.create({ ...input, createdBy }),
  getById: async (id: string) => {
    const animal = await animalsRepository.findById(id);
    if (!animal) {
      throw new NotFoundError(`Animal ${id} not found`);
    }
    return animal;
  },
};
