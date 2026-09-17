import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { prisma } from './prisma.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Layerbase's free tier sleeps when idle and wakes on connection, so first connect can be slow/flaky.
export async function connectWithRetry(): Promise<void> {
  const { connectRetries, connectBackoffMs } = config.db;

  for (let attempt = 1; attempt <= connectRetries; attempt += 1) {
    try {
      await prisma.$connect();
      logger.info({ attempt }, 'Database connected');
      return;
    } catch (err) {
      if (attempt === connectRetries) {
        logger.error({ err, attempt }, 'Database connection failed, no attempts left');
        throw err;
      }
      const backoffMs = connectBackoffMs * 2 ** (attempt - 1);
      logger.warn({ err, attempt, backoffMs }, 'Database connection attempt failed, retrying');
      await sleep(backoffMs);
    }
  }
}
