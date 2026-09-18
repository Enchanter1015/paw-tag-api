import bcrypt from 'bcryptjs';

import { config } from '../config/index.js';

// Exported as an object (not standalone functions) so tests can mock individual methods,
// matching the repository/service pattern used elsewhere.
export const passwordService = {
  hashPassword: (password: string) => bcrypt.hash(password, config.auth.bcryptCost),

  verifyPassword: (password: string, hash: string) => bcrypt.compare(password, hash),
};
