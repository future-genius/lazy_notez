import { Request, Response, NextFunction } from 'express';
import { validateCsrfToken } from '../utils/csrf';
import { AppError } from '../utils/errors';

// CSRF validation middleware
export const validateCsrf = (req: Request, res: Response, next: NextFunction) => {
  // Only validate for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] as string || req.body._csrf;
    if (!validateCsrfToken(token)) {
      return res.status(403).json({ message: 'Invalid or missing CSRF token' });
    }
  }
  next();
};
