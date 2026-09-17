import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { animalsService } from './animals.service.js';
import type { CreateAnimalInput } from './animals.schema.js';
import { asyncHandler } from '../../lib/async-handler.js';

export const registerAnimal = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateAnimalInput;
  const animal = await animalsService.register(body, req.actorId!);
  res.status(StatusCodes.CREATED).json(animal);
});
