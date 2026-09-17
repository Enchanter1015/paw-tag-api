import { Router } from 'express';

import { getAnimal, mergeAnimal, registerAnimal, removeAnimal, searchAnimals, updateAnimal } from './animals.controller.js';
import {
  animalIdParamsSchema,
  createAnimalSchema,
  mergeAnimalBodySchema,
  searchAnimalsQuerySchema,
  updateAnimalSchema,
} from './animals.schema.js';
import { requireActor } from '../../middleware/actor.js';
import { validate } from '../../middleware/validate.js';

export const animalsRouter = Router();

animalsRouter.post('/animals', requireActor, validate({ body: createAnimalSchema }), registerAnimal);
animalsRouter.get('/animals', validate({ query: searchAnimalsQuerySchema }), searchAnimals);
animalsRouter.get('/animals/:id', validate({ params: animalIdParamsSchema }), getAnimal);
animalsRouter.patch(
  '/animals/:id',
  requireActor,
  validate({ params: animalIdParamsSchema, body: updateAnimalSchema }),
  updateAnimal,
);
animalsRouter.delete('/animals/:id', requireActor, validate({ params: animalIdParamsSchema }), removeAnimal);
animalsRouter.post(
  '/animals/:id/merge',
  requireActor,
  validate({ params: animalIdParamsSchema, body: mergeAnimalBodySchema }),
  mergeAnimal,
);
