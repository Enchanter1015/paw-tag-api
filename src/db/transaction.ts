import type { Prisma } from '@prisma/client';

import { prisma } from './prisma.js';

export const withTransaction = <T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: { maxWait?: number; timeout?: number },
): Promise<T> => prisma.$transaction(fn, options);
