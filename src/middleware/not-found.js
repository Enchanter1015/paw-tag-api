import { NotFoundError } from '../lib/errors.js';

export const notFoundHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};
