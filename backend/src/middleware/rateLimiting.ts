import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many auth attempts, try again later',
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV === 'development';
  }
});

// Standard rate limiter for API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// IP Blacklist middleware (optional enhancement)
const ipBlacklist = new Set<string>();

export const addToBlacklist = (ip: string) => {
  ipBlacklist.add(ip);
  setTimeout(() => ipBlacklist.delete(ip), 1000 * 60 * 60); // 1 hour
};

export const checkBlacklist = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || '';
  if (ipBlacklist.has(clientIp)) {
    return res.status(403).json({ message: 'Your IP is temporarily blocked' });
  }
  next();
};
