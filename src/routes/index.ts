import { Router } from 'express';

import { animalsRouter } from '../modules/animals/animals.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { healthRouter } from '../modules/health/health.routes.js';
import { imagesRouter } from '../modules/images/images.routes.js';
import { lookupsRouter } from '../modules/lookups/lookups.routes.js';
import { medicalRecordsRouter } from '../modules/medical-records/medical-records.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { vetHospitalsRouter } from '../modules/vet-hospitals/vet-hospitals.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use(authRouter);
apiRouter.use(lookupsRouter);
apiRouter.use(animalsRouter);
apiRouter.use(usersRouter);
apiRouter.use(vetHospitalsRouter);
apiRouter.use(medicalRecordsRouter);
apiRouter.use(imagesRouter);
