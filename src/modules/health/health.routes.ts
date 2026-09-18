import { Router } from 'express';

import { getHealth, getHealthReady } from './health.controller.js';

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is running
 */
healthRouter.get('/', getHealth);

/**
 * @openapi
 * /health/ready:
 *   get:
 *     summary: Readiness check (verifies DB connectivity)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
healthRouter.get('/ready', getHealthReady);
