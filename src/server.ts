import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectWithRetry } from './db/connect.js';
import { prisma } from './db/prisma.js';
import { logger } from './lib/logger.js';

await connectWithRetry();

const app = createApp();
const server = app.listen(config.server.port, config.server.host, () => {
  logger.info(
    { port: config.server.port, host: config.server.host, env: config.env },
    'Server listening',
  );
});

let shuttingDown = false;

const shutdown = (signal: string): void => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutting down');

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, config.server.shutdownTimeoutMs).unref();

  server.close((err) => {
    clearTimeout(forceExit);
    void prisma.$disconnect().finally(() => {
      if (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
      logger.info('Shutdown complete');
      process.exit(0);
    });
  });
};

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => shutdown(signal));
}

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  shutdown('uncaughtException');
});
