import { StatusCodes } from 'http-status-codes';

import { config } from '../../config/index.js';

export const getHealth = (_req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'ok',
    service: 'paw-tag-api',
    env: config.env,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};
