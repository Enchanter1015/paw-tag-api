import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { LoginInput, LogoutInput, RefreshInput, RegisterInput } from './auth.schema.js';
import { authService } from './auth.service.js';
import { asyncHandler } from '../../lib/async-handler.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const tokens = await authService.register(input);
  res.status(StatusCodes.CREATED).json(tokens);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const tokens = await authService.login(input);
  res.status(StatusCodes.OK).json(tokens);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RefreshInput;
  const tokens = await authService.refresh(input);
  res.status(StatusCodes.OK).json(tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LogoutInput;
  await authService.logout(input);
  res.status(StatusCodes.NO_CONTENT).send();
});
