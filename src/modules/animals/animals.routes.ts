import { Router } from 'express';

import { getAnimal, registerAnimal, searchAnimals, updateAnimal } from './animals.controller.js';
import {
  animalIdParamsSchema,
  createAnimalSchema,
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
