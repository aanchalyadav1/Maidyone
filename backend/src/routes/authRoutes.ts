import { Router } from 'express';
import { login } from '../controllers/authController';
import { sendResponse } from '../utils/responseHandler';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// @route   POST /api/v1/auth/register
router.post('/register', (_req, res) => {
  return sendResponse(res, 501, false, 'Register endpoint not implemented');
});

// @route   POST /api/v1/auth/login
// Rate-limited: 10 attempts per 15 minutes per IP
router.post('/login', authLimiter, login);

export default router;
