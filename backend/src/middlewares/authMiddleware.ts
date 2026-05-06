import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseHandler';
import admin from '../config/firebaseAdmin';
import User from '../models/User';

// Verify Firebase ID Token and attach Mongo user (required for routes using req.user._id)
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized, no token');
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    const dbUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!dbUser) {
      return sendResponse(res, 401, false, 'Not authorized, user not registered. Complete login first.');
    }

    (req as any).user = {
      _id: dbUser._id,
      firebaseUid: decodedToken.uid,
      email: decodedToken.email ?? dbUser.email,
      role: dbUser.role,
    };

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return sendResponse(res, 403, false, 'Forbidden: Insufficient privileges');
    }
    next();
  };
};
