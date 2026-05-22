import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { sendResponse } from '../utils/responseHandler';
import admin from '../config/firebaseAdmin';

/**
 * POST /api/v1/auth/login
 *
 * Verifies the Firebase ID token sent in the Authorization header.
 * Syncs the Firebase user into MongoDB for profile/business data storage.
 * Does NOT check MongoDB role — admin access is enforced on the frontend
 * via the ADMIN_EMAILS whitelist.
 *
 * Returns the MongoDB user profile + the original Firebase token so the
 * frontend can use it for subsequent API calls.
 */
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

    const { uid: firebaseUid, email, name: displayName } = decodedToken;

    // ── Sync Firebase user into MongoDB (profile storage only) ──────────────
    // upsert: create if not exists, update name/email if changed
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email:  email ?? undefined,
        name:   displayName || email?.split('@')[0] || 'Admin',
        role:   'admin',   // all users synced via this endpoint are admins
        status: 'active',
      });
    } else {
      // Keep name/email in sync with Firebase profile
      const updates: Record<string, string> = {};
      if (email && user.email !== email)           updates.email = email;
      if (displayName && user.name !== displayName) updates.name  = displayName;
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
        Object.assign(user, updates);
      }
    }

    sendResponse(res, 200, true, 'Logged in successfully', {
      user: {
        id:          user._id,
        uid:         user.firebaseUid,
        email:       user.email,
        name:        user.name,
        phoneNumber: user.phoneNumber,
        avatar:      user.avatar,
      },
      token, // return the original Firebase ID token
    });
  } catch (error) {
    next(error);
  }
};
