import { Request, Response, NextFunction } from 'express';
import Worker from '../models/Worker';
import { sendResponse } from '../utils/responseHandler';

import User from '../models/User';

// @desc    Get all workers
// @route   GET /api/v1/workers
export const getWorkers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, skill, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) query.verificationStatus = status;
    if (skill) query.skills = { $in: [skill] };

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search as string, $options: 'i' } },
          { phoneNumber: { $regex: search as string, $options: 'i' } }
        ]
      }).select('_id');
      query.user = { $in: users.map(u => u._id) };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const workers = await Worker.find(query)
      .populate('user', 'name email phoneNumber avatar status')
      .populate('skills', 'name category')
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Worker.countDocuments(query);

    sendResponse(res, 200, true, 'Workers fetched successfully', {
      workers,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new worker link (Internal User mapped to Worker persona)
// @route   POST /api/v1/workers
export const createWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, skills } = req.body;
    
    // Check if worker profile already exists
    const existingWorker = await Worker.findOne({ user: userId });
    if (existingWorker) {
      return sendResponse(res, 400, false, 'Worker profile already exists for this user');
    }

    const worker = await Worker.create({
      user: userId,
      skills: skills || []
    });

    sendResponse(res, 201, true, 'Worker profile created', worker);
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker details/status
// @route   PATCH /api/v1/workers/:id
export const updateWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name')
     .populate('skills', 'name category');

    if (!worker) {
      return sendResponse(res, 404, false, 'Worker not found');
    }

    sendResponse(res, 200, true, 'Worker updated successfully', worker);
  } catch (error) {
    next(error);
  }
};
