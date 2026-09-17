import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncHandler } from '../../lib/async-handler.js';
import { lookupsService } from './lookups.service.js';

export const getAnimalTypes = asyncHandler(async (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json(await lookupsService.listAnimalTypes());
});

export const getMedicalRecordTypes = asyncHandler(async (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json(await lookupsService.listMedicalRecordTypes());
});

export const getVetHospitalTypes = asyncHandler(async (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json(await lookupsService.listVetHospitalTypes());
});

export const getRoles = asyncHandler(async (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json(await lookupsService.listRoles());
});
