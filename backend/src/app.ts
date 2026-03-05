import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import xssClean from 'xss-clean';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import noteRoutes from './routes/notes';
import resourceRoutes from './routes/resources';
import adminRoutes from './routes/admin';
import User from './models/User';
import { errorHandler } from './middleware/errorHandler';
import { checkBlacklist, apiLimiter } from './middleware/rateLimiting';
import { validateCsrf } from './middleware/csrfMiddleware';
import { initRedis } from './utils/redis';
import { generateCsrfToken } from './utils/csrf';

dotenv.config();

const app = express();

initRedis();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

app.use(xssClean());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

app.use(checkBlacklist);
app.use('/api/', apiLimiter);

const MONGO_URI = process.env.MONGO_URI || '';
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      await User.updateMany(
        { email: 'projectlazynotez@gmail.com' },
        { $set: { role: 'super_admin', loginMethod: 'google' } }
      );
    })
    .catch((err) => console.error('MongoDB connection error:', err.message));
} else {
  console.warn('MONGO_URI not set, database operations will fail');
}

app.get('/api/csrf-token', (_req, res) => {
  const token = generateCsrfToken();
  res.json({ csrfToken: token });
});

app.use('/api/', validateCsrf);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_req, res) => res.json({ ok: true, message: 'LazyNotez API v1.0', env: process.env.NODE_ENV }));

app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use(errorHandler);

export default app;
