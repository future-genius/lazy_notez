import crypto from 'crypto';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { getIO } from '../utils/socket';
import { blacklistToken, isTokenBlacklisted } from '../utils/redis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const SUPER_ADMIN_EMAIL = 'projectlazynotez@gmail.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

const generateUserId = () => `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const sanitizeEmail = (email?: string) => sanitizeHtml(email || '').trim().toLowerCase();

const sanitizeRole = (role?: string) => {
  if (role === 'administrator') return 'admin';
  if (['admin', 'faculty', 'student', 'user'].includes(role || '')) return role as any;
  return 'student';
};

const issueAuthTokens = async (user: any, res: Response) => {
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

  return accessToken;
};

const emitRealtimeLogin = (user: any) => {
  try {
    const io = getIO();
    if (io) {
      io.emit('user.login', {
        userId: user.userId,
        username: user.username,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        timestamp: new Date()
      });
    }
  } catch (err) {
    console.warn('Failed to emit user.login event', err);
  }
};

const buildUserResponse = (user: any) => ({
  id: user._id,
  user_id: user.userId,
  username: user.username,
  name: user.name,
  email: user.email,
  role: user.role,
  login_method: user.loginMethod,
  last_login: user.lastLogin,
  registration_date: user.registrationDate
});

const ensureSuperAdmin = async (user: any) => {
  if (user?.email === SUPER_ADMIN_EMAIL && user.role !== 'super_admin') {
    user.role = 'super_admin';
    await user.save();
  }
};

const generateUniqueUsername = async (seed: string) => {
  const base = seed
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .slice(0, 16) || 'user';

  let candidate = base;
  let counter = 0;
  while (await User.findOne({ username: candidate })) {
    counter += 1;
    candidate = `${base}${counter}`;
  }
  return candidate;
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const name = sanitizeHtml(req.body.name);
    const username = sanitizeHtml(req.body.username);
    const email = sanitizeEmail(req.body.email);
    const password = req.body.password;
    const universityRegisterNumber = sanitizeHtml(req.body.universityRegisterNumber || '');
    const department = sanitizeHtml(req.body.department || '');

    let role = sanitizeRole(req.body.role);
    if (email === SUPER_ADMIN_EMAIL) role = 'super_admin';

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ message: 'Username or email already exists' });

    const now = new Date();
    const hashed = await bcrypt.hash(password, 12);
    const user = new User({
      userId: generateUserId(),
      name,
      username,
      email,
      password: hashed,
      role,
      status: 'active',
      loginMethod: 'manual',
      lastLogin: now,
      registrationDate: now,
      universityRegisterNumber,
      department
    });
    await user.save();

    await ActivityLog.create({ user: user._id, action: 'register.manual', ip: req.ip, meta: { loginMethod: 'manual' } });
    emitRealtimeLogin(user);

    const accessToken = await issueAuthTokens(user, res);
    res.status(201).json({ accessToken, user: buildUserResponse(user) });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const identifierRaw = sanitizeHtml(req.body.identifier || req.body.username || req.body.email || '');
    const identifier = identifierRaw.trim();
    const password = req.body.password;
    const identifierEmail = identifier.toLowerCase();

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifierEmail }]
    });
    if (!user || user.status === 'inactive') return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    await ensureSuperAdmin(user);
    user.loginMethod = user.loginMethod || 'manual';
    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({ user: user._id, action: 'login.manual', ip: req.ip, meta: { loginMethod: 'manual' } });
    emitRealtimeLogin(user);

    const accessToken = await issueAuthTokens(user, res);
    res.json({ accessToken, user: buildUserResponse(user) });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google login is not configured' });
    }

    const token = req.body?.token;
    if (!token) return res.status(400).json({ message: 'Google token is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Invalid Google account' });
    }

    const email = sanitizeEmail(payload.email);
    const name = sanitizeHtml(payload.name || payload.email.split('@')[0]);
    let user = await User.findOne({ email });

    if (!user) {
      const username = await generateUniqueUsername(payload.email.split('@')[0]);
      const generatedPassword = await bcrypt.hash(crypto.randomUUID(), 12);
      const role = email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'user';
      const now = new Date();

      user = await User.create({
        userId: generateUserId(),
        name,
        username,
        email,
        password: generatedPassword,
        role,
        status: 'active',
        loginMethod: 'google',
        lastLogin: now,
        registrationDate: now
      });

      await ActivityLog.create({ user: user._id, action: 'register.google', ip: req.ip, meta: { loginMethod: 'google' } });
    } else {
      await ensureSuperAdmin(user);
      user.loginMethod = 'google';
      user.lastLogin = new Date();
      await user.save();
    }

    await ActivityLog.create({ user: user._id, action: 'login.google', ip: req.ip, meta: { loginMethod: 'google' } });
    emitRealtimeLogin(user);

    const accessToken = await issueAuthTokens(user, res);
    res.json({ accessToken, user: buildUserResponse(user) });
  } catch (err) {
    res.status(401).json({ message: 'Google authentication failed' });
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

    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== token);
    const newRefresh = signRefreshToken(user._id.toString());
    user.refreshTokens.push(newRefresh);
    await user.save();

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
          user.refreshTokens = user.refreshTokens.filter((t: string) => t !== token);
          await user.save();
          await ActivityLog.create({ user: user._id, action: 'logout', ip: req.ip });

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
