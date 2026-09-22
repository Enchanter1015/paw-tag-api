import { Router } from 'express';

import {
  activateUser,
  changeUserRole,
  deactivateUser,
  findUserByEmail,
  getUser,
  listUsers,
  registerUser,
  updateUser,
} from './users.controller.js';
import {
  changeUserRoleSchema,
  createUserSchema,
  findUserQuerySchema,
  updateUserSchema,
  userIdParamsSchema,
} from './users.schema.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { validate } from '../../middleware/validate.js';

export const usersRouter = Router();

/**
 * @openapi
 * /users/list:
 *   get:
 *     summary: List all users (administrator)
 *     tags: [Users]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/User' } }
 *       401: { description: Missing/invalid actor, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Missing permission, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
usersRouter.get('/users/list', authenticate, requirePermission('users:manage'), listUsers);

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
 *     security: [{ BearerAuth: [] }]
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
  authenticate,
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  updateUser,
);

/**
 * @openapi
 * /users/{id}/role:
 *   patch:
 *     summary: Change a user's role (administrator)
 *     tags: [Users]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleId]
 *             properties:
 *               roleId: { type: integer }
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error or unknown role, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       401: { description: Missing/invalid actor, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Missing permission, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
usersRouter.patch(
  '/users/:id/role',
  authenticate,
  requirePermission('users:manage'),
  validate({ params: userIdParamsSchema, body: changeUserRoleSchema }),
  changeUserRole,
);

/**
 * @openapi
 * /users/{id}/deactivate:
 *   post:
 *     summary: Deactivate a user (administrator)
 *     tags: [Users]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { description: Missing/invalid actor, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Missing permission, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
usersRouter.post(
  '/users/:id/deactivate',
  authenticate,
  requirePermission('users:manage'),
  validate({ params: userIdParamsSchema }),
  deactivateUser,
);

/**
 * @openapi
 * /users/{id}/activate:
 *   post:
 *     summary: Reactivate a previously deactivated user (administrator)
 *     tags: [Users]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { description: Missing/invalid actor, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Missing permission, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
usersRouter.post(
  '/users/:id/activate',
  authenticate,
  requirePermission('users:manage'),
  validate({ params: userIdParamsSchema }),
  activateUser,
);
