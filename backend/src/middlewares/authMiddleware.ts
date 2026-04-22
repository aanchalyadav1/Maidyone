import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseHandler';
import User from '../models/User';

import jwt from 'jsonwebtoken';

// In a real implementation this would verify Firebase JWT/custom JWT
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized, no token');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123') as any;

    const dbUser = await User.findById(decoded.id);
    if (!dbUser) {
      return sendResponse(res, 401, false, 'The user belonging to this token no longer exists.');
    }
    
    // Bind actual Mongoose Document to Request
    (req as any).user = dbUser; 
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
