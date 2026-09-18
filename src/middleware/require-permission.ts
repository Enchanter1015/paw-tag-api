import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../lib/errors.js';

/**
 * Must run after `authenticate`. Rejects with 403 unless the actor's token carries `permission`.
 */
export const requirePermission = (permission: string) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.actorPermissions?.includes(permission)) {
    return next(new ForbiddenError(`Missing required permission: ${permission}`));
  }
  next();
};
