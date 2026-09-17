import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

import { config } from '../config/index.js';
import { AppError } from '../lib/errors.js';

const PRISMA_KNOWN_REQUEST_STATUS: Record<string, number> = {
  P2002: StatusCodes.CONFLICT,
  P2025: StatusCodes.NOT_FOUND,
  P2003: StatusCodes.BAD_REQUEST,
};

const PRISMA_UNAVAILABLE_CODES = new Set(['P1001', 'P1008', 'P1017']);

interface NormalizedError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

interface HttpLikeError extends Error {
  status?: number;
}

const normalize = (err: unknown): NormalizedError => {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    };
  }

  if (err instanceof ZodError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (PRISMA_UNAVAILABLE_CODES.has(err.code)) {
      return {
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is not reachable',
      };
    }
    const statusCode = PRISMA_KNOWN_REQUEST_STATUS[err.code];
    if (statusCode) {
      return {
        statusCode,
        code: `PRISMA_${err.code}`,
        message: 'Database request failed',
        // meta may contain column/table names; only surface outside production.
        details: config.isProduction ? undefined : err.meta,
      };
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      code: 'PRISMA_VALIDATION_ERROR',
      message: 'Invalid database request',
    };
  }

  // Body-parser / express errors carry a status property.
  const httpErr = err as HttpLikeError;
  if (typeof httpErr?.status === 'number' && httpErr.status >= 400 && httpErr.status < 500) {
    return {
      statusCode: httpErr.status,
      code: 'BAD_REQUEST',
      message: getReasonPhrase(httpErr.status),
    };
  }

  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  };
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { statusCode, code, message, details } = normalize(err);

  if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
    req.log?.error({ err }, 'Unhandled request error');
  } else {
    req.log?.warn({ err: { message: (err as Error)?.message, code } }, 'Request error');
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      requestId: req.id,
      ...(config.isProduction ? {} : { stack: (err as Error)?.stack }),
    },
  });
};
