import { Router } from 'express';

import { getAnimalTypes, getMedicalRecordTypes, getRoles, getVetHospitalTypes } from './lookups.controller.js';

export const lookupsRouter = Router();

/**
 * @openapi
 * /animal-types:
 *   get:
 *     summary: List animal types
 *     tags: [Lookups]
 *     responses:
 *       200:
 *         description: Array of animal types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lookup'
 */
lookupsRouter.get('/animal-types', getAnimalTypes);

/**
 * @openapi
 * /medical-record-types:
 *   get:
 *     summary: List medical record types
 *     tags: [Lookups]
 *     responses:
 *       200:
 *         description: Array of medical record types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lookup'
 */
lookupsRouter.get('/medical-record-types', getMedicalRecordTypes);

/**
 * @openapi
 * /vet-hospital-types:
 *   get:
 *     summary: List vet hospital types
 *     tags: [Lookups]
 *     responses:
 *       200:
 *         description: Array of vet hospital types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lookup'
 */
lookupsRouter.get('/vet-hospital-types', getVetHospitalTypes);

/**
 * @openapi
 * /roles:
 *   get:
 *     summary: List roles
 *     tags: [Lookups]
 *     responses:
 *       200:
 *         description: Array of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lookup'
 */
lookupsRouter.get('/roles', getRoles);
