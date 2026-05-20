import { Request, Response, NextFunction } from 'express';
import Worker from '../models/Worker';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import { sendResponse } from '../utils/responseHandler';
import User from '../models/User';

// Helper: enrich a worker object with totalEarnings and totalJobs from DB
const enrichWorker = async (worker: any) => {
  const obj = worker.toObject ? worker.toObject() : { ...worker };

  // totalEarnings: sum of completed payments for bookings assigned to this worker
  const bookingIds = await Booking.find({ worker: obj._id }).select('_id');
  const earningsAgg = await Payment.aggregate([
    { $match: { booking: { $in: bookingIds.map((b: any) => b._id) }, status: 'Completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  obj.totalEarnings = earningsAgg[0]?.total || 0;

  return obj;
};

// @desc    Get all workers (with totalEarnings aggregation)
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
      .populate('user', 'name email phoneNumber avatar status address')
      .populate('skills', 'name category')
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Worker.countDocuments(query);

    // Batch-enrich all workers with totalEarnings via aggregation
    const workerIds = workers.map(w => w._id);

    // Get all bookings for these workers
    const bookings = await Booking.find({ worker: { $in: workerIds } }).select('_id worker');

    // Aggregate earnings per worker via $lookup on bookings
    const allBookingIds = bookings.map(b => b._id);
    const earningsAgg = await Payment.aggregate([
      { $match: { booking: { $in: allBookingIds }, status: 'Completed' } },
      {
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'bookingObj'
        }
      },
      { $unwind: '$bookingObj' },
      { $group: { _id: '$bookingObj.worker', totalEarnings: { $sum: '$amount' } } }
    ]);

    const earningsMap: Record<string, number> = {};
    earningsAgg.forEach((e: any) => {
      earningsMap[e._id?.toString()] = e.totalEarnings;
    });

    const enrichedWorkers = workers.map(w => {
      const obj = w.toObject() as any;
      obj.totalEarnings = earningsMap[w._id.toString()] || 0;
      return obj;
    });

    sendResponse(res, 200, true, 'Workers fetched successfully', {
      workers: enrichedWorkers,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single worker by ID
// @route   GET /api/v1/workers/:id
export const getWorkerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('user', 'name email phoneNumber avatar status address')
      .populate('skills', 'name category basePrice');

    if (!worker) return sendResponse(res, 404, false, 'Worker not found');

    const enriched = await enrichWorker(worker);
    sendResponse(res, 200, true, 'Worker fetched successfully', enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new worker profile
// @route   POST /api/v1/workers
export const createWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, skills } = req.body;

    if (!userId) return sendResponse(res, 400, false, 'userId is required');

    const existingWorker = await Worker.findOne({ user: userId });
    if (existingWorker) {
      return sendResponse(res, 400, false, 'Worker profile already exists for this user');
    }

    const worker = await Worker.create({ user: userId, skills: skills || [] });
    sendResponse(res, 201, true, 'Worker profile created', worker);
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker details / verification status / skills
// @route   PATCH /api/v1/workers/:id
export const updateWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      verificationStatus, skills, isOnline, rating,
      // User-level fields that can be updated via worker profile
      name, email, phoneNumber, address, avatar, status
    } = req.body;

    const workerUpdate: any = {};
    if (verificationStatus !== undefined) workerUpdate.verificationStatus = verificationStatus;
    if (skills !== undefined) workerUpdate.skills = skills;
    if (isOnline !== undefined) workerUpdate.isOnline = isOnline;
    if (rating !== undefined) workerUpdate.rating = rating;

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      workerUpdate,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phoneNumber avatar status address')
      .populate('skills', 'name category');

    if (!worker) return sendResponse(res, 404, false, 'Worker not found');

    // Optionally update the linked User document
    const userUpdate: any = {};
    if (name !== undefined) userUpdate.name = name;
    if (email !== undefined) userUpdate.email = email;
    if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
    if (address !== undefined) userUpdate.address = address;
    if (avatar !== undefined) userUpdate.avatar = avatar;
    if (status !== undefined) userUpdate.status = status;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(worker.user, userUpdate, { runValidators: true });
    }

    sendResponse(res, 200, true, 'Worker updated successfully', worker);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete worker profile
// @route   DELETE /api/v1/workers/:id
export const deleteWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return sendResponse(res, 404, false, 'Worker not found');
    sendResponse(res, 200, true, 'Worker deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
