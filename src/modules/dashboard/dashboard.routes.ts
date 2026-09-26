import { Router } from 'express';

import { getDashboardStats } from './dashboard.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/require-permission.js';

export const dashboardRouter = Router();

/**
 * @openapi
 * /dashboard/stats:
 *   get:
 *     summary: View dashboard KPI stats
 *     tags: [Dashboard]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/DashboardStats' }
 *       401: { description: Missing/invalid actor, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Missing permission, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
dashboardRouter.get('/dashboard/stats', authenticate, requirePermission('dashboard:read'), getDashboardStats);
