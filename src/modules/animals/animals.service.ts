import type { CreateAnimalInput } from './animals.schema.js';
import { animalsRepository } from './animals.repository.js';

export const animalsService = {
  // The 8-char id is DB-generated; clients never supply it.
  register: (input: CreateAnimalInput, createdBy: string) =>
    animalsRepository.create({ ...input, createdBy }),
};
