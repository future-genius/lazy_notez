import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { isTokenBlacklisted } from '../utils/redis';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyAccessToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) return res.status(401).json({ message: 'Token revoked' });

    const secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
    const payload: any = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).select('-password -refreshTokens');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role === 'super_admin') return next();
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

export const requireAnyRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role === 'super_admin') return next();
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
};

export const requireAdminAccess = requireAnyRole(['admin']);
