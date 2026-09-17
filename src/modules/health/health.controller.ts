import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { config } from '../../config/index.js';
import { prisma } from '../../db/prisma.js';

export const getHealth = (_req: Request, res: Response): void => {
  res.status(StatusCodes.OK).json({
    status: 'ok',
    service: 'paw-tag-api',
    env: config.env,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

export const getHealthReady = async (req: Request, res: Response): Promise<void> => {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(StatusCodes.OK).json({
      status: 'ok',
      dbLatencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    req.log?.warn({ err }, 'Readiness check failed');
    res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      status: 'error',
      message: 'Database is not reachable',
      timestamp: new Date().toISOString(),
    });
  }
};
