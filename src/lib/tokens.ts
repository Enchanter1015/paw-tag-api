import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';
import ms, { type StringValue } from 'ms';

import { config } from '../config/index.js';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  permissions: string[];
}

// Exported as an object (not standalone functions) so tests can mock individual methods,
// matching the repository/service pattern used elsewhere.
export const tokenService = {
  signAccessToken: (payload: AccessTokenPayload) =>
    jwt.sign(payload, config.auth.accessSecret, {
      expiresIn: Math.floor(ms(config.auth.accessTtl as StringValue) / 1000),
    }),

  verifyAccessToken: (token: string): AccessTokenPayload =>
    jwt.verify(token, config.auth.accessSecret) as AccessTokenPayload,

  // Refresh tokens are opaque (not JWTs); only their hash is ever persisted.
  generateRefreshToken: () => crypto.randomBytes(64).toString('hex'),

  hashRefreshToken: (token: string) => crypto.createHash('sha256').update(token).digest('hex'),

  refreshTokenExpiresAt: () => new Date(Date.now() + ms(config.auth.refreshTtl as StringValue)),
};
