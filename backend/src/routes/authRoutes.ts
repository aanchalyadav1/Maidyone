import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

// @route   POST /api/v1/auth/register
// @desc    Register new user
router.post('/register', (req, res) => res.json({ msg: 'Register endpoint' }));

// @route   POST /api/v1/auth/login
// @desc    Login user / Verify Firebase Token
router.post('/login', login);

export default router;


