import { Router } from 'express';

import { uploadAnimalImages, uploadMedicalRecordImages } from './images.controller.js';
import { animalImagesParamsSchema, medicalRecordImagesParamsSchema } from './images.schema.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { imagesUpload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';

export const imagesRouter = Router();

/**
 * @openapi
 * /animals/{animalId}/images:
 *   post:
 *     summary: Upload one or more images for an animal profile
 *     tags: [Images]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: animalId
 *         required: true
 *         schema: { type: string, minLength: 8, maxLength: 8 }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Uploaded images
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/AnimalImage' } }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Animal not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
imagesRouter.post(
  '/animals/:animalId/images',
  authenticate,
  requirePermission('animals:write'),
  validate({ params: animalImagesParamsSchema }),
  imagesUpload.array('images'),
  uploadAnimalImages,
);

/**
 * @openapi
 * /medical-records/{id}/images:
 *   post:
 *     summary: Upload one or more images for a medical record
 *     tags: [Images]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Uploaded images
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/MedicalRecordImage' } }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Medical record not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
imagesRouter.post(
  '/medical-records/:id/images',
  authenticate,
  requirePermission('medical-records:write'),
  validate({ params: medicalRecordImagesParamsSchema }),
  imagesUpload.array('images'),
  uploadMedicalRecordImages,
);
