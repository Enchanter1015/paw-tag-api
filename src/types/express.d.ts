import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      id: string;
      log: Logger;
      actorId?: string;
      actorRole?: string;
      actorPermissions?: string[];
    }
  }
}

export {};
