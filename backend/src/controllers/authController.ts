import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { blacklistToken, isTokenBlacklisted } from '../utils/redis';
import { AppError } from '../utils/errors';

const signAccessToken = (userId: string) => {
  const secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES || '15m';
  return jwt.sign({ sub: userId }, secret, { expiresIn });
};

const signRefreshToken = (userId: string) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES || '7d';
  return jwt.sign({ sub: userId }, secret, { expiresIn });
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const name = sanitizeHtml(req.body.name);
    const username = sanitizeHtml(req.body.username);
    const email = sanitizeHtml(req.body.email || '');
    const password = req.body.password;
    const role = req.body.role === 'administrator' ? 'admin' : (req.body.role || 'student');

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ name, username, email, password: hashed, role, status: 'active' });
    await user.save();

    await ActivityLog.create({ user: user._id, action: 'register', ip: req.ip });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/'
    });

    res.status(201).json({ 
      accessToken, 
      user: { id: user._id, username: user.username, role: user.role, name: user.name } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || user.status === 'inactive') return res.status(401).json({ message: 'Invalid credentials' });
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({ user: user._id, action: 'login', ip: req.ip });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/'
    });

    res.json({ 
      accessToken, 
      user: { id: user._id, username: user.username, role: user.role, name: user.name } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) return res.status(401).json({ message: 'Refresh token revoked' });
    
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
    const payload: any = jwt.verify(token, secret);
    const user = await User.findById(payload.sub);
    if (!user || user.status === 'inactive') return res.status(401).json({ message: 'Unauthorized' });
    if (!user.refreshTokens.includes(token)) return res.status(401).json({ message: 'Invalid refresh token' });

    // Rotation: remove old, add new
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    const newRefresh = signRefreshToken(user._id.toString());
    user.refreshTokens.push(newRefresh);
    await user.save();

    // Blacklist old token
    const decoded: any = jwt.decode(token);
    const expiresIn = decoded.exp ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000)) : 604800;
    await blacklistToken(token, expiresIn);

    const accessToken = signAccessToken(user._id.toString());
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/'
    });

    res.json({ accessToken });
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const payload: any = jwt.decode(token) as any;
      if (payload?.sub) {
        const user = await User.findById(payload.sub);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(t => t !== token);
          await user.save();
          await ActivityLog.create({ user: user._id, action: 'logout', ip: req.ip });

          // Blacklist refresh token
          const decoded: any = jwt.decode(token);
          const expiresIn = decoded.exp ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000)) : 604800;
          await blacklistToken(token, expiresIn);
        }
      }
    }

    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Unauthorized' });
    
    const token = auth.split(' ')[1];
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) return res.status(401).json({ message: 'Token revoked' });

    const secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
    const payload: any = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).select('-password -refreshTokens');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};
