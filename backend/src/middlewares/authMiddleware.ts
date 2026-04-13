import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseHandler';
// In a real implementation this would verify Firebase JWT/custom JWT
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized, no token provided');
    }
    // Mock user decoding
    (req as any).user = { uid: '123', role: 'admin' }; // Replace with real decode
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
