import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseHandler';
import admin from '../config/firebaseAdmin';
import User from '../models/User';

/**
 * protect — verifies the Firebase ID token on every protected request.
 *
 * Attaches req.user with the MongoDB _id so controllers can reference it.
 * If the MongoDB user doesn't exist yet (first API call before /auth/login),
 * it is created automatically so the request is never blocked.
 *
 * Role-based access control is handled by the frontend ADMIN_EMAILS whitelist.
 * The backend authorize() middleware is kept for defence-in-depth on
 * write operations (it checks the MongoDB role field).
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized, no token');
    }

    // Verify Firebase ID token — this is the only auth check
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch {
      return sendResponse(res, 401, false, 'Not authorized, token failed');
    }

    // Find or auto-create the MongoDB user
    let dbUser = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!dbUser) {
      // Auto-create on first API call (e.g. if /auth/login was skipped)
      dbUser = await User.create({
        firebaseUid: decodedToken.uid,
        email:       decodedToken.email ?? undefined,
        name:        decodedToken.name  || decodedToken.email?.split('@')[0] || 'Admin',
        role:        'admin',
        status:      'active',
      });
    }

    (req as any).user = {
      _id:         dbUser._id,
      firebaseUid: decodedToken.uid,
      email:       decodedToken.email ?? dbUser.email,
      role:        dbUser.role,
    };

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed');
  }
};

/**
 * authorize — defence-in-depth role check on write operations.
 * Since all users synced via this backend are role:'admin',
 * this will pass for all legitimate admin panel users.
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return sendResponse(res, 403, false, 'Forbidden: Insufficient privileges');
    }
    next();
  };
};
