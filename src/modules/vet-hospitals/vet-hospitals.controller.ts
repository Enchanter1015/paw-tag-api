import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type {
  AddVetHospitalMemberInput,
  CreateVetHospitalInput,
  SearchVetHospitalsQuery,
  UpdateVetHospitalInput,
  UpdateVetHospitalMemberInput,
} from './vet-hospitals.schema.js';
import { vetHospitalsService } from './vet-hospitals.service.js';
import { asyncHandler } from '../../lib/async-handler.js';

export const registerVetHospital = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateVetHospitalInput;
  const vetHospital = await vetHospitalsService.register(input, req.actorId!);
  res.status(StatusCodes.CREATED).json(vetHospital);
});

export const getVetHospital = asyncHandler(async (req: Request, res: Response) => {
  const vetHospital = await vetHospitalsService.getById(req.params.id!);
  res.status(StatusCodes.OK).json(vetHospital);
});

export const searchVetHospitals = asyncHandler(async (req: Request, res: Response) => {
  const { name, memberUserId } = req.query as SearchVetHospitalsQuery;
  const vetHospitals = await vetHospitalsService.search(name, memberUserId);
  res.status(StatusCodes.OK).json(vetHospitals);
});

export const updateVetHospital = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateVetHospitalInput;
  const vetHospital = await vetHospitalsService.update(req.params.id!, input);
  res.status(StatusCodes.OK).json(vetHospital);
});

export const removeVetHospital = asyncHandler(async (req: Request, res: Response) => {
  await vetHospitalsService.remove(req.params.id!);
  res.status(StatusCodes.NO_CONTENT).send();
});

export const addVetHospitalMember = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as AddVetHospitalMemberInput;
  const member = await vetHospitalsService.addMember(req.params.id!, input);
  res.status(StatusCodes.CREATED).json(member);
});

export const listVetHospitalMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await vetHospitalsService.listMembers(req.params.id!);
  res.status(StatusCodes.OK).json(members);
});

export const listVetHospitalAnimals = asyncHandler(async (req: Request, res: Response) => {
  const animals = await vetHospitalsService.listAnimals(req.params.id!);
  res.status(StatusCodes.OK).json(animals);
});

export const updateVetHospitalMember = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateVetHospitalMemberInput;
  const member = await vetHospitalsService.updateMember(req.params.id!, req.params.memberId!, input);
  res.status(StatusCodes.OK).json(member);
});

export const removeVetHospitalMember = asyncHandler(async (req: Request, res: Response) => {
  await vetHospitalsService.removeMember(req.params.id!, req.params.memberId!);
  res.status(StatusCodes.NO_CONTENT).send();
});
