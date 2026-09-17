import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { animalsService } from './animals.service.js';
import type { CreateAnimalInput, SearchAnimalsQuery, UpdateAnimalInput } from './animals.schema.js';
import { asyncHandler } from '../../lib/async-handler.js';

export const registerAnimal = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateAnimalInput;
  const animal = await animalsService.register(body, req.actorId!);
  res.status(StatusCodes.CREATED).json(animal);
});

export const getAnimal = asyncHandler(async (req: Request, res: Response) => {
  const animal = await animalsService.getById(req.params.id!);
  res.status(StatusCodes.OK).json(animal);
});

export const updateAnimal = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateAnimalInput;
  const animal = await animalsService.update(req.params.id!, body);
  res.status(StatusCodes.OK).json(animal);
});

export const searchAnimals = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as SearchAnimalsQuery;
  const animals = await animalsService.search(query);
  res.status(StatusCodes.OK).json(animals);
});
