import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // Log errors in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', {
      message: err.message,
      status: err.status || 500,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code
    });
  }

  // Handle validation errors
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.details || err.errors
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.code === 11000) {
    return res.status(409).json({
      message: 'Resource already exists'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
