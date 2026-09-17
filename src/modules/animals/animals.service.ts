import type { Prisma } from '@prisma/client';

import type { CreateAnimalInput, SearchAnimalsQuery, UpdateAnimalInput } from './animals.schema.js';
import { animalsRepository } from './animals.repository.js';
import { logger } from '../../lib/logger.js';
import { BadRequestError, NotFoundError } from '../../lib/errors.js';

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
  update: async (id: string, input: UpdateAnimalInput) => {
    // P2025 (not found) is mapped to 404 by the global error handler.
    return animalsRepository.update(id, input);
  },
  search: (query: SearchAnimalsQuery) => {
    const where: Prisma.AnimalWhereInput = {};
    if (query.query) {
      where.OR = [{ id: query.query }, { name: { contains: query.query, mode: 'insensitive' } }];
    }
    if (query.animalTypeId !== undefined) {
      where.animalTypeId = query.animalTypeId;
    }
    if (query.isStreet !== undefined) {
      where.isStreet = query.isStreet;
    }
    return animalsRepository.search(where);
  },
  remove: async (id: string, actorId: string) => {
    await animalsService.getById(id);
    const removed = await animalsRepository.remove(id);
    logger.info({ actorId, animalId: id, action: 'remove' }, 'Administrator removed an animal record');
    return removed;
  },
  merge: async (sourceId: string, targetId: string, actorId: string) => {
    if (sourceId === targetId) {
      throw new BadRequestError('Cannot merge an animal into itself');
    }
    await animalsService.getById(sourceId);
    await animalsService.getById(targetId);

    const merged = await animalsRepository.mergeInto(sourceId, targetId);

    logger.info({ actorId, sourceId, targetId, action: 'merge' }, 'Administrator merged an animal record');
    return merged;
  },
};
