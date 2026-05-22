import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { sendResponse } from '../utils/responseHandler';
import admin from '../config/firebaseAdmin';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized, no token');
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch {
      return sendResponse(res, 401, false, 'Invalid or expired token. Please log in again.');
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    // Find or create MongoDB user
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // New user — default role is 'user', not admin
      user = await User.create({
        firebaseUid,
        email,
        name: decodedToken.name || email?.split('@')[0] || 'New User',
        role: 'user',
        status: 'active',
      });
    }

    // Block suspended accounts
    if (user.status === 'suspended') {
      return sendResponse(res, 403, false, 'Account suspended. Contact support.');
    }

    // Block inactive accounts
    if (user.status === 'inactive') {
      return sendResponse(res, 403, false, 'Account is inactive.');
    }

    sendResponse(res, 200, true, 'Logged in successfully', {
      user: {
        id:          user._id,
        uid:         user.firebaseUid,
        role:        user.role,
        phoneNumber: user.phoneNumber,
        email:       user.email,
        name:        user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
