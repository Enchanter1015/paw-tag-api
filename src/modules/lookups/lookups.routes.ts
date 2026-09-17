import { Router } from 'express';

import { getAnimalTypes, getMedicalRecordTypes, getRoles, getVetHospitalTypes } from './lookups.controller.js';

export const lookupsRouter = Router();

lookupsRouter.get('/animal-types', getAnimalTypes);
lookupsRouter.get('/medical-record-types', getMedicalRecordTypes);
lookupsRouter.get('/vet-hospital-types', getVetHospitalTypes);
lookupsRouter.get('/roles', getRoles);
