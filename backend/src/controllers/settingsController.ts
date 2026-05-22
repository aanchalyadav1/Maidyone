import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { sendResponse } from '../utils/responseHandler';
import { isValidEmail } from '../middlewares/validate';

// @desc    Get current admin profile
// @route   GET /api/v1/settings/profile
export const getAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id;
    const user = await User.findById(userId).select('-firebaseUid -password');
    if (!user) return sendResponse(res, 404, false, 'Profile not found');
    sendResponse(res, 200, true, 'Profile fetched', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update current admin profile
// @route   PATCH /api/v1/settings/profile
export const updateAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id;
    const { name, email, phoneNumber, address, avatar } = req.body;

    // Validate email if provided
    if (email !== undefined && email !== '' && !isValidEmail(String(email))) {
      return sendResponse(res, 400, false, 'Invalid email format');
    }

    const updateData: any = {};
    if (name        !== undefined) updateData.name        = String(name).trim();
    if (email       !== undefined) updateData.email       = String(email).trim().toLowerCase();
    if (phoneNumber !== undefined) updateData.phoneNumber = String(phoneNumber).trim();
    if (address     !== undefined) updateData.address     = String(address).trim();
    if (avatar      !== undefined) updateData.avatar      = String(avatar).trim();

    // Don't update if nothing changed
    if (Object.keys(updateData).length === 0) {
      return sendResponse(res, 400, false, 'No fields to update');
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-firebaseUid -password');

    if (!user) return sendResponse(res, 404, false, 'Profile not found');
    sendResponse(res, 200, true, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};
