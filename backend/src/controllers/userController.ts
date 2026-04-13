import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { sendResponse } from '../utils/responseHandler';

// @desc    Get all users
// @route   GET /api/v1/users
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { phoneNumber: { $regex: search as string, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-firebaseUid') // Protect internal firebase ID
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    sendResponse(res, 200, true, 'Users fetched successfully', {
      users,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/v1/users/:id
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-firebaseUid');

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    sendResponse(res, 200, true, 'User details fetched', user);
  } catch (error) {
    next(error);
  }
};
