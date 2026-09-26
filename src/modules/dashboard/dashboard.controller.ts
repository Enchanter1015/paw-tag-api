import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { dashboardService } from './dashboard.service.js';
import { asyncHandler } from '../../lib/async-handler.js';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getStats();
  res.status(StatusCodes.OK).json(stats);
});
