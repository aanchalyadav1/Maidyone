import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseHandler';
import admin from '../config/firebaseAdmin';

// Verify Firebase ID Token
export const protect = async (req: Request, res: Response, next: NextFunction) => {
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
    
    // Attach uid and email to req.user without DB logic
    (req as any).user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
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
