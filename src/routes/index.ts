import { Router } from 'express';

import { animalsRouter } from '../modules/animals/animals.routes.js';
import { healthRouter } from '../modules/health/health.routes.js';
import { lookupsRouter } from '../modules/lookups/lookups.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { vetHospitalsRouter } from '../modules/vet-hospitals/vet-hospitals.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use(lookupsRouter);
apiRouter.use(animalsRouter);
apiRouter.use(usersRouter);
apiRouter.use(vetHospitalsRouter);
// Register additional module routers here, e.g.:
// apiRouter.use('/medical-records', medicalRecordsRouter);
