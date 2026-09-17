import { Router } from 'express';

import { healthRouter } from '../modules/health/health.routes.js';
import { lookupsRouter } from '../modules/lookups/lookups.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use(lookupsRouter);
// Register additional module routers here, e.g.:
// apiRouter.use('/animals', animalsRouter);
