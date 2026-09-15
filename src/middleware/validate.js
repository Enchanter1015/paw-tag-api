import { BadRequestError } from '../lib/errors.js';

/**
 * Validates and replaces req.body / req.query / req.params using Zod schemas.
 */
export const validate = (schemas) => (req, _res, next) => {
  for (const key of ['body', 'query', 'params']) {
    const schema = schemas[key];
    if (!schema) continue;

    const result = schema.safeParse(req[key]);
    if (!result.success) {
      return next(
        new BadRequestError('Request validation failed', {
          code: 'VALIDATION_ERROR',
          details: result.error.issues.map((i) => ({
            path: [key, ...i.path].join('.'),
            message: i.message,
          })),
        }),
      );
    }
    Object.defineProperty(req, key, { value: result.data, writable: true, configurable: true });
  }
  return next();
};
