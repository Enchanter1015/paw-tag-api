import { Router } from 'express';

import {
  addVetHospitalMember,
  getVetHospital,
  listVetHospitalMembers,
  registerVetHospital,
  removeVetHospital,
  removeVetHospitalMember,
  searchVetHospitals,
  updateVetHospital,
  updateVetHospitalMember,
} from './vet-hospitals.controller.js';
import {
  addVetHospitalMemberSchema,
  createVetHospitalSchema,
  updateVetHospitalMemberSchema,
  updateVetHospitalSchema,
  vetHospitalIdParamsSchema,
  vetHospitalMemberParamsSchema,
} from './vet-hospitals.schema.js';
import { requireActor } from '../../middleware/actor.js';
import { validate } from '../../middleware/validate.js';

export const vetHospitalsRouter = Router();

/**
 * @openapi
 * /vet-hospitals:
 *   post:
 *     summary: Register a vet hospital
 *     tags: [VetHospitals]
 *     security: [{ ActorId: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateVetHospitalInput' }
 *     responses:
 *       201:
 *         description: Created vet hospital
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VetHospital' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
vetHospitalsRouter.post(
  '/vet-hospitals',
  requireActor,
  validate({ body: createVetHospitalSchema }),
  registerVetHospital,
);

/**
 * @openapi
 * /vet-hospitals:
 *   get:
 *     summary: Search vet hospitals by name
 *     tags: [VetHospitals]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Matching vet hospitals
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/VetHospital' } }
 */
vetHospitalsRouter.get('/vet-hospitals', searchVetHospitals);

/**
 * @openapi
 * /vet-hospitals/{id}:
 *   get:
 *     summary: View a vet hospital by id
 *     tags: [VetHospitals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Vet hospital found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VetHospital' }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
vetHospitalsRouter.get(
  '/vet-hospitals/:id',
  validate({ params: vetHospitalIdParamsSchema }),
  getVetHospital,
);

/**
 * @openapi
 * /vet-hospitals/{id}:
 *   patch:
 *     summary: Update a vet hospital
 *     tags: [VetHospitals]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateVetHospitalInput' }
 *     responses:
 *       200:
 *         description: Updated vet hospital
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VetHospital' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
vetHospitalsRouter.patch(
  '/vet-hospitals/:id',
  requireActor,
  validate({ params: vetHospitalIdParamsSchema, body: updateVetHospitalSchema }),
  updateVetHospital,
);

/**
 * @openapi
 * /vet-hospitals/{id}:
 *   delete:
 *     summary: Archive a vet hospital
 *     description: Soft-deletes the vet hospital by setting isArchived to true. Archived hospitals are excluded from search results.
 *     tags: [VetHospitals]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Archived }
 *       404: { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
vetHospitalsRouter.delete(
  '/vet-hospitals/:id',
  requireActor,
  validate({ params: vetHospitalIdParamsSchema }),
  removeVetHospital,
);

/**
 * @openapi
 * /vet-hospitals/{id}/members:
 *   post:
 *     summary: Add a member to a vet hospital
 *     tags: [VetHospitals]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AddVetHospitalMemberInput' }
 *     responses:
 *       201:
 *         description: Created membership
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VetHospitalMember' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Vet hospital not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: User is already a member, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
vetHospitalsRouter.post(
  '/vet-hospitals/:id/members',
  requireActor,
  validate({ params: vetHospitalIdParamsSchema, body: addVetHospitalMemberSchema }),
  addVetHospitalMember,
);

/**
 * @openapi
 * /vet-hospitals/{id}/members:
 *   get:
 *     summary: List members of a vet hospital
 *     tags: [VetHospitals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Members list
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/VetHospitalMember' } }
 *       404: { description: Vet hospital not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
vetHospitalsRouter.get(
  '/vet-hospitals/:id/members',
  validate({ params: vetHospitalIdParamsSchema }),
  listVetHospitalMembers,
);

/**
 * @openapi
 * /vet-hospitals/{id}/members/{memberId}:
 *   patch:
 *     summary: Update a vet hospital member's role
 *     tags: [VetHospitals]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateVetHospitalMemberInput' }
 *     responses:
 *       200:
 *         description: Updated membership
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VetHospitalMember' }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Member not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
vetHospitalsRouter.patch(
  '/vet-hospitals/:id/members/:memberId',
  requireActor,
  validate({ params: vetHospitalMemberParamsSchema, body: updateVetHospitalMemberSchema }),
  updateVetHospitalMember,
);

/**
 * @openapi
 * /vet-hospitals/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a vet hospital
 *     tags: [VetHospitals]
 *     security: [{ ActorId: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Removed }
 *       404: { description: Member not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
vetHospitalsRouter.delete(
  '/vet-hospitals/:id/members/:memberId',
  requireActor,
  validate({ params: vetHospitalMemberParamsSchema }),
  removeVetHospitalMember,
);
