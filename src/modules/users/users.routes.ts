import { Router } from 'express';

import { findUserByEmail, getUser, registerUser, updateUser } from './users.controller.js';
import { createUserSchema, findUserQuerySchema, updateUserSchema, userIdParamsSchema } from './users.schema.js';
import { requireActor } from '../../middleware/actor.js';
import { validate } from '../../middleware/validate.js';

export const usersRouter = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Register a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserInput' }
 *     responses:
 *       201:
 *         description: Created user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: Duplicate email/googleId/appleId, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
usersRouter.post('/users', validate({ body: createUserSchema }), registerUser);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Find a user by email
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Matching user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
usersRouter.get('/users', validate({ query: findUserQuerySchema }), findUserByEmail);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: View a user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
usersRouter.get('/users/:id', validate({ params: userIdParamsSchema }), getUser);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateUserInput' }
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: Duplicate email/googleId/appleId, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
usersRouter.patch(
  '/users/:id',
  requireActor,
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  updateUser,
);
