import { Request, Response, NextFunction } from 'express';
import { validateCsrfToken } from '../utils/csrf';
import { AppError } from '../utils/errors';

// CSRF validation middleware
export const validateCsrf = (req: Request, res: Response, next: NextFunction) => {
  const authPathExemptions = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh', '/auth/logout'];
  if (authPathExemptions.some((path) => req.path.startsWith(path))) {
    return next();
  }

  // Bearer-token APIs are not cookie-authenticated CSRF targets.
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  // Only validate for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] as string || req.body._csrf;
    if (!validateCsrfToken(token)) {
      return res.status(403).json({ message: 'Invalid or missing CSRF token' });
    }
  }
  next();
};
