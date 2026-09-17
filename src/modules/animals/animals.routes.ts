import { Router } from 'express';

import { getAnimal, registerAnimal } from './animals.controller.js';
import { animalIdParamsSchema, createAnimalSchema } from './animals.schema.js';
import { requireActor } from '../../middleware/actor.js';
import { validate } from '../../middleware/validate.js';

export const animalsRouter = Router();

animalsRouter.post('/animals', requireActor, validate({ body: createAnimalSchema }), registerAnimal);
animalsRouter.get('/animals/:id', validate({ params: animalIdParamsSchema }), getAnimal);
