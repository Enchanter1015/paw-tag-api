import { Router } from 'express';

import { healthRouter } from '../modules/health/health.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
// Register additional module routers here, e.g.:
// apiRouter.use('/getAnimalById', healthRouter);
// apiRouter.use('/tags', tagsRouter);
