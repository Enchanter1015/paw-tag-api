import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { CreateUserInput, FindUserQuery, UpdateUserInput } from './users.schema.js';
import { usersService } from './users.service.js';
import { asyncHandler } from '../../lib/async-handler.js';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateUserInput;
  const user = await usersService.register(input);
  res.status(StatusCodes.CREATED).json(user);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getById(req.params.id!);
  res.status(StatusCodes.OK).json(user);
});

export const findUserByEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query as unknown as FindUserQuery;
  const user = await usersService.getByEmail(email);
  res.status(StatusCodes.OK).json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateUserInput;
  const user = await usersService.update(req.params.id!, input);
  res.status(StatusCodes.OK).json(user);
});
