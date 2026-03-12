import { NextFunction, Response } from 'express';
import { AuthRequest, verifyAccessToken, requireAdminAccess } from './authMiddleware';

const truthy = (v?: string) => (v || '').toLowerCase() === 'true' || (v || '') === '1' || (v || '').toLowerCase() === 'yes';

/**
 * Allows admin mutations via either:
 * - Bearer JWT (preferred), or
 * - Admin panel key header (for local/dev panel usage).
 *
 * Header: x-admin-panel-key: <ADMIN_PANEL_KEY>
 * If ADMIN_PANEL_KEY is not set and NODE_ENV !== 'production', then passing x-admin-panel: true is accepted.
 */
export const requireAdminPanel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return verifyAccessToken(req, res, (err?: any) => {
      if (err) return next(err);
      return requireAdminAccess(req, res, next);
    });
  }

  const configuredKey = process.env.ADMIN_PANEL_KEY || '';
  const providedKey = (req.headers['x-admin-panel-key'] as string) || '';
  const allowDevBypass = !configuredKey && process.env.NODE_ENV !== 'production' && truthy(req.headers['x-admin-panel'] as string);

  if (configuredKey && providedKey && providedKey === configuredKey) {
    (req as any).user = { role: 'super_admin', name: 'Admin Panel' };
    return next();
  }

  if (allowDevBypass) {
    (req as any).user = { role: 'super_admin', name: 'Admin Panel (dev)' };
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized' });
};

