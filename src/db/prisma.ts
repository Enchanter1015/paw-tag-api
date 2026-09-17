import { PrismaClient } from '@prisma/client';

import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';

// Cache on globalThis so tsx watch reloads reuse the same client instead of leaking connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: config.db.url,
    log: [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: config.isProduction ? 'error' : 'query' },
    ],
  });

prisma.$on('warn' as never, (event: unknown) => logger.warn({ event }, 'Prisma warning'));
prisma.$on('error' as never, (event: unknown) => logger.error({ event }, 'Prisma error'));
prisma.$on('query' as never, (event: unknown) => logger.debug({ event }, 'Prisma query'));

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}
