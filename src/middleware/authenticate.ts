import type { NextFunction, Request, Response } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { UnauthorizedError } from '../lib/errors.js';
import { tokenService } from '../lib/tokens.js';

const BEARER_PREFIX = 'Bearer ';

/**
 * Verifies the Authorization: Bearer <JWT> header and populates the actor fields on req.
 * Replaces the temporary x-user-id stand-in (see middleware/actor.ts, now removed).
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.header('authorization');
    if (!header?.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = header.slice(BEARER_PREFIX.length).trim();

    try {
      const payload = tokenService.verifyAccessToken(token);
      req.actorId = payload.sub;
      req.actorRole = payload.role;
      req.actorPermissions = payload.permissions;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }

    next();
  },
);
