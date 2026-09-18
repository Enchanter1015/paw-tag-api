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

/**
 * @openapi
 * /animals:
 *   post:
 *     summary: Register a street animal
 *     tags: [Animals]
 *     security: [{ ActorId: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateAnimalInput' }
 *     responses:
 *       201:
 *         description: Created animal
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Animal' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       401: { description: Missing/invalid actor, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
animalsRouter.post('/animals', requireActor, validate({ body: createAnimalSchema }), registerAnimal);

/**
 * @openapi
 * /animals:
 *   get:
 *     summary: Search animals
 *     tags: [Animals]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema: { type: string }
 *       - in: query
 *         name: animalTypeId
 *         schema: { type: integer }
 *       - in: query
 *         name: isStreet
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Matching animals
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/Animal' } }
 */
animalsRouter.get('/animals', validate({ query: searchAnimalsQuerySchema }), searchAnimals);

/**
 * @openapi
 * /animals/{id}:
 *   get:
 *     summary: View animal information
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, minLength: 8, maxLength: 8 }
 *     responses:
 *       200:
 *         description: Animal found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Animal' }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
animalsRouter.get('/animals/:id', validate({ params: animalIdParamsSchema }), getAnimal);

/**
 * @openapi
 * /animals/{id}:
 *   patch:
 *     summary: Update animal information
 *     tags: [Animals]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, minLength: 8, maxLength: 8 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateAnimalInput' }
 *     responses:
 *       200:
 *         description: Updated animal
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Animal' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
animalsRouter.patch(
  '/animals/:id',
  requireActor,
  validate({ params: animalIdParamsSchema, body: updateAnimalSchema }),
  updateAnimal,
);

/**
 * @openapi
 * /animals/{id}:
 *   delete:
 *     summary: Remove an animal record (administrator)
 *     tags: [Animals]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, minLength: 8, maxLength: 8 }
 *     responses:
 *       204: { description: Removed }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
animalsRouter.delete('/animals/:id', requireActor, validate({ params: animalIdParamsSchema }), removeAnimal);

/**
 * @openapi
 * /animals/{id}/merge:
 *   post:
 *     summary: Merge a duplicate animal record into a target record (administrator)
 *     tags: [Animals]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Source animal id (removed after merge)
 *         schema: { type: string, minLength: 8, maxLength: 8 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MergeAnimalInput' }
 *     responses:
 *       200:
 *         description: The removed source animal record
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Animal' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
animalsRouter.post(
  '/animals/:id/merge',
  requireActor,
  validate({ params: animalIdParamsSchema, body: mergeAnimalBodySchema }),
  mergeAnimal,
);
