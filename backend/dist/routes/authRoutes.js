"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { protect, authorize } from '../middlewares/authMiddleware';
const router = (0, express_1.Router)();
// @route   POST /api/v1/auth/register
// @desc    Register new user
router.post('/register', (req, res) => res.json({ msg: 'Register endpoint' }));
// @route   POST /api/v1/auth/login
// @desc    Login user / Verify Firebase Token
router.post('/login', (req, res) => res.json({ msg: 'Login endpoint' }));
exports.default = router;
