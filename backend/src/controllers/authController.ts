import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendResponse } from '../utils/responseHandler';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return sendResponse(res, 400, false, 'Please provide phone and password');
    }

    // Find user by phoneNumber
    const user = await User.findOne({ phoneNumber: phone });

    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Compare password (plain for now)
    if (user.password !== password) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: '1d' }
    );

    sendResponse(res, 200, true, 'Logged in successfully', {
      user: {
        id: user._id,
        uid: user.firebaseUid,
        role: user.role,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
      },
      token
    });
  } catch (error) {
    next(error);
  }
};
