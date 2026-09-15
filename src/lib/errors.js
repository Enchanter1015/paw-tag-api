import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, options = {}) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.details = options.details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', options = {}) {
    super(message, StatusCodes.BAD_REQUEST, { code: 'BAD_REQUEST', ...options });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', options = {}) {
    super(message, StatusCodes.UNAUTHORIZED, { code: 'UNAUTHORIZED', ...options });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', options = {}) {
    super(message, StatusCodes.FORBIDDEN, { code: 'FORBIDDEN', ...options });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', options = {}) {
    super(message, StatusCodes.NOT_FOUND, { code: 'NOT_FOUND', ...options });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', options = {}) {
    super(message, StatusCodes.CONFLICT, { code: 'CONFLICT', ...options });
  }
}
