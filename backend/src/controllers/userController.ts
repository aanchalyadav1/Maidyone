import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import { sendResponse } from '../utils/responseHandler';

// @desc    Get all users (with bookingsCount + totalSpend aggregation)
// @route   GET /api/v1/users
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, status, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
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
      .select('-firebaseUid')
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Aggregate bookingsCount and totalSpend per user
    const userIds = users.map(u => u._id);

    const bookingAgg = await Booking.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', bookingsCount: { $sum: 1 } } }
    ]);

    const paymentAgg = await Payment.aggregate([
      { $match: { user: { $in: userIds }, status: 'Completed' } },
      { $group: { _id: '$user', totalSpend: { $sum: '$amount' } } }
    ]);

    const bookingMap: Record<string, number> = {};
    bookingAgg.forEach(b => { bookingMap[b._id.toString()] = b.bookingsCount; });

    const spendMap: Record<string, number> = {};
    paymentAgg.forEach(p => { spendMap[p._id.toString()] = p.totalSpend; });

    const enrichedUsers = users.map(u => {
      const obj = u.toObject() as any;
      obj.bookingsCount = bookingMap[u._id.toString()] || 0;
      obj.totalSpend = spendMap[u._id.toString()] || 0;
      return obj;
    });

    sendResponse(res, 200, true, 'Users fetched successfully', {
      users: enrichedUsers,
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
    const user = await User.findById(req.params.id).select('-firebaseUid');
    if (!user) return sendResponse(res, 404, false, 'User not found');

    const bookingsCount = await Booking.countDocuments({ user: user._id });
    const spendAgg = await Payment.aggregate([
      { $match: { user: user._id, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSpend = spendAgg[0]?.total || 0;

    const obj = user.toObject() as any;
    obj.bookingsCount = bookingsCount;
    obj.totalSpend = totalSpend;

    sendResponse(res, 200, true, 'User details fetched', obj);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user (admin)
// @route   POST /api/v1/users
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phoneNumber, role, status, address, avatar } = req.body;

    if (!name) return sendResponse(res, 400, false, 'Name is required');

    // Generate a placeholder firebaseUid for admin-created users
    const firebaseUid = `admin-created-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const existing = email ? await User.findOne({ email }) : null;
    if (existing) return sendResponse(res, 400, false, 'Email already in use');

    const user = await User.create({
      firebaseUid,
      name,
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      role: role || 'user',
      status: status || 'active',
      address: address || undefined,
      avatar: avatar || undefined,
    });

    const obj = user.toObject() as any;
    delete obj.firebaseUid;

    sendResponse(res, 201, true, 'User created successfully', obj);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (name, email, phone, status, role, address, avatar)
// @route   PATCH /api/v1/users/:id
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phoneNumber, status, role, address, avatar } = req.body;

    const allowedStatuses = ['active', 'inactive', 'suspended'];
    if (status && !allowedStatuses.includes(status)) {
      return sendResponse(res, 400, false, 'Invalid status value');
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-firebaseUid');

    if (!user) return sendResponse(res, 404, false, 'User not found');

    sendResponse(res, 200, true, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'User not found');
    sendResponse(res, 200, true, 'User deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
