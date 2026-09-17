import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../db/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { UnauthorizedError } from '../lib/errors.js';

const actorIdSchema = z.string().uuid();

/**
 * Temporary stand-in for real auth: trusts an `x-user-id` header that must
 * reference an existing user. Replace once Google/Apple auth lands.
 */
export const requireActor = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const parsed = actorIdSchema.safeParse(req.header('x-user-id'));
    if (!parsed.success) {
      throw new UnauthorizedError('Missing or invalid x-user-id header');
    }

    const user = await prisma.user.findUnique({ where: { id: parsed.data } });
    if (!user) {
      throw new UnauthorizedError('x-user-id does not reference a known user');
    }

    req.actorId = parsed.data;
    next();
  },
);
