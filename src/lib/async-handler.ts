import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown;

/**
 * Wraps an async route handler so rejected promises reach the error middleware.
 */
export const asyncHandler =
  (handler: AsyncRouteHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
