import { Router } from 'express';

import { animalsRouter } from '../modules/animals/animals.routes.js';
import { healthRouter } from '../modules/health/health.routes.js';
import { lookupsRouter } from '../modules/lookups/lookups.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use(lookupsRouter);
apiRouter.use(animalsRouter);
// Register additional module routers here, e.g.:
// apiRouter.use('/vet-hospitals', vetHospitalsRouter);
