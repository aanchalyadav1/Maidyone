import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { sendResponse } from '../utils/responseHandler';

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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;

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
