import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation rules
export const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 chars'),
  body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username must be alphanumeric with _ or -'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['student', 'faculty', 'administrator']).withMessage('Invalid role')
];

export const validateLogin = [
  body('identifier').optional().trim().notEmpty().withMessage('Identifier required'),
  body('username').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required')
];

export const validateGoogleLogin = [
  body('token').trim().notEmpty().withMessage('Google token is required')
];

export const validateCreateNote = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title required (max 200 chars)'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content required'),
  body('tags').optional().isArray().withMessage('Tags must be array')
];

export const validateUpdateUser = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['super_admin', 'admin', 'faculty', 'student', 'user']),
  body('status').optional().isIn(['active', 'inactive'])
];

export const validateCreateResource = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title required'),
  body('department').trim().notEmpty().withMessage('Department required'),
  body('semester').trim().notEmpty().withMessage('Semester required'),
  body('subject').trim().notEmpty().withMessage('Subject required'),
  body('googleDriveUrl').isURL().withMessage('Invalid Google Drive URL'),
  body('uploadedByName').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('tags').optional().isArray()
];

export const validateAbout = [
  body('title').trim().isLength({ min: 1, max: 500 }).withMessage('Title required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content required')
];

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }
  next();
};
