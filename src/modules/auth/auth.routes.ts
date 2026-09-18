import { Router } from 'express';

import { login, logout, refresh, register } from './auth.controller.js';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from './auth.schema.js';
import { validate } from '../../middleware/validate.js';

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterInput' }
 *     responses:
 *       201:
 *         description: Access + refresh token pair
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokenPair' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: Email already registered, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
authRouter.post('/auth/register', validate({ body: registerSchema }), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email + password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200:
 *         description: Access + refresh token pair
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokenPair' }
 *       401: { description: Invalid credentials, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
authRouter.post('/auth/login', validate({ body: loginSchema }), login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new token pair (rotated)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RefreshInput' }
 *     responses:
 *       200:
 *         description: New access + refresh token pair
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokenPair' }
 *       401: { description: Invalid or expired refresh token, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
authRouter.post('/auth/refresh', validate({ body: refreshSchema }), refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LogoutInput' }
 *     responses:
 *       204: { description: Revoked }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
authRouter.post('/auth/logout', validate({ body: logoutSchema }), logout);
