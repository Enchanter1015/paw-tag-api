import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { ZodError } from 'zod';

import { config } from '../config/index.js';
import { AppError } from '../lib/errors.js';

const normalize = (err) => {
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

  // Body-parser / express errors carry a status property.
  if (typeof err?.status === 'number' && err.status >= 400 && err.status < 500) {
    return {
      statusCode: err.status,
      code: 'BAD_REQUEST',
      message: getReasonPhrase(err.status),
    };
  }

  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  };
};

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
export const errorHandler = (err, req, res, next) => {
  const { statusCode, code, message, details } = normalize(err);

  if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
    req.log?.error({ err }, 'Unhandled request error');
  } else {
    req.log?.warn({ err: { message: err?.message, code } }, 'Request error');
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      requestId: req.id,
      ...(config.isProduction ? {} : { stack: err?.stack }),
    },
  });
};
