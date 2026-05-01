import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { sendResponse } from '../utils/responseHandler';
import admin from '../config/firebaseAdmin';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized, no token');
    }

    // Verify token using firebase-admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    // Check MongoDB: if user not exists -> create
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        name: decodedToken.name || email?.split('@')[0] || 'New User',
        role: 'user',
        status: 'active'
      });
    }

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
