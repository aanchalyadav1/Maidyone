import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseHandler';
import User from '../models/User';

// In a real implementation this would verify Firebase JWT/custom JWT
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      // Allow fallback to an active admin user for the UI matching demo
    }
    
    const dbUser = await User.findOne({ role: 'admin' });
    if (!dbUser) {
      return sendResponse(res, 401, false, 'No admin user existing in DB');
    }
    
    // Bind actual Mongoose Document to Request
    (req as any).user = dbUser; 
    next();
  } catch (error) {
    sendResponse(res, 401, false, 'Not authorized, token failed');
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
