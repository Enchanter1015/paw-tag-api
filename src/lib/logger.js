import pino from 'pino';

import { config } from '../config/index.js';

export const logger = pino({
  level: config.isTest ? 'silent' : config.logging.level,
  base: { service: 'paw-tag-api', env: config.env },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    remove: true,
  },
  transport: config.isProduction
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } },
});
