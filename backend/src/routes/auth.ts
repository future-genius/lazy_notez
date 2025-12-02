import express from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController';
import { verifyAccessToken } from '../middleware/authMiddleware';
import { validateRegister, validateLogin, handleValidationErrors } from '../utils/validators';
import { authLimiter } from '../middleware/rateLimiting';

const router = express.Router();

router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', verifyAccessToken, me);

export default router;
