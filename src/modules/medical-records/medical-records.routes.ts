import { Router } from 'express';

import {
  addVaccinationRecord,
  getMedicalRecord,
  listVaccinationRecords,
  updateVaccinationRecord,
  verifyMedicalRecord,
} from './medical-records.controller.js';
import {
  animalMedicalRecordsParamsSchema,
  createVaccinationRecordSchema,
  medicalRecordIdParamsSchema,
  updateVaccinationRecordSchema,
  verifyMedicalRecordSchema,
} from './medical-records.schema.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { validate } from '../../middleware/validate.js';

export const medicalRecordsRouter = Router();

/**
 * @openapi
 * /animals/{animalId}/medical-records:
 *   post:
 *     summary: Add a vaccination record for an animal
 *     tags: [MedicalRecords]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: animalId
 *         required: true
 *         schema: { type: string, minLength: 8, maxLength: 8 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateVaccinationRecordInput' }
 *     responses:
 *       201:
 *         description: Created medical record
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MedicalRecord' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Animal or vet hospital member not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
medicalRecordsRouter.post(
  '/animals/:animalId/medical-records',
  authenticate,
  requirePermission('medical-records:write'),
  validate({ params: animalMedicalRecordsParamsSchema, body: createVaccinationRecordSchema }),
  addVaccinationRecord,
);

/**
 * @openapi
 * /animals/{animalId}/medical-records:
 *   get:
 *     summary: List vaccination records for an animal
 *     tags: [MedicalRecords]
 *     parameters:
 *       - in: path
 *         name: animalId
 *         required: true
 *         schema: { type: string, minLength: 8, maxLength: 8 }
 *     responses:
 *       200:
 *         description: Vaccination records ordered newest first
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/MedicalRecord' } }
 *       404: { description: Animal not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
medicalRecordsRouter.get(
  '/animals/:animalId/medical-records',
  validate({ params: animalMedicalRecordsParamsSchema }),
  listVaccinationRecords,
);

/**
 * @openapi
 * /medical-records/{id}:
 *   get:
 *     summary: View a medical record by id
 *     tags: [MedicalRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Medical record found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MedicalRecord' }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
medicalRecordsRouter.get(
  '/medical-records/:id',
  validate({ params: medicalRecordIdParamsSchema }),
  getMedicalRecord,
);

/**
 * @openapi
 * /medical-records/{id}:
 *   patch:
 *     summary: Update a vaccination record
 *     tags: [MedicalRecords]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateVaccinationRecordInput' }
 *     responses:
 *       200:
 *         description: Updated medical record
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MedicalRecord' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
medicalRecordsRouter.patch(
  '/medical-records/:id',
  authenticate,
  requirePermission('medical-records:write'),
  validate({ params: medicalRecordIdParamsSchema, body: updateVaccinationRecordSchema }),
  updateVaccinationRecord,
);

/**
 * @openapi
 * /medical-records/{id}/verify:
 *   patch:
 *     summary: Verify a medical record
 *     tags: [MedicalRecords]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VerifyMedicalRecordInput' }
 *     responses:
 *       200:
 *         description: Verified medical record
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MedicalRecord' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
medicalRecordsRouter.patch(
  '/medical-records/:id/verify',
  authenticate,
  requirePermission('medical-records:verify'),
  validate({ params: medicalRecordIdParamsSchema, body: verifyMedicalRecordSchema }),
  verifyMedicalRecord,
);
