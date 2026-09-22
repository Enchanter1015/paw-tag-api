import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type {
  CreateVaccinationRecordInput,
  UpdateVaccinationRecordInput,
  VerifyMedicalRecordInput,
} from './medical-records.schema.js';
import { medicalRecordsService } from './medical-records.service.js';
import { asyncHandler } from '../../lib/async-handler.js';

export const addVaccinationRecord = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateVaccinationRecordInput;
  const record = await medicalRecordsService.addVaccinationRecord(req.params.animalId!, input, req.actorId!);
  res.status(StatusCodes.CREATED).json(record);
});

export const listMedicalRecords = asyncHandler(async (req: Request, res: Response) => {
  const records = await medicalRecordsService.listMedicalRecords(req.params.animalId!);
  res.status(StatusCodes.OK).json(records);
});

export const getMedicalRecord = asyncHandler(async (req: Request, res: Response) => {
  const record = await medicalRecordsService.getById(req.params.id!);
  res.status(StatusCodes.OK).json(record);
});

export const updateVaccinationRecord = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateVaccinationRecordInput;
  const record = await medicalRecordsService.updateVaccinationRecord(req.params.id!, input);
  res.status(StatusCodes.OK).json(record);
});

export const verifyMedicalRecord = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as VerifyMedicalRecordInput;
  const record = await medicalRecordsService.verify(req.params.id!, input);
  res.status(StatusCodes.OK).json(record);
});
