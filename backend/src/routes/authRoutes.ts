import { Router } from 'express';
import { login } from '../controllers/authController';
import { sendResponse } from '../utils/responseHandler';

const router = Router();

// @route   POST /api/v1/auth/register
// @desc    Register new user
router.post('/register', (req, res) => {
  return sendResponse(res, 501, false, 'Register endpoint not implemented');
});

// @route   POST /api/v1/auth/login
// @desc    Login user / Verify Firebase Token
router.post('/login', login);

export default router;


