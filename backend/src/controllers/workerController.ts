import { Request, Response, NextFunction } from 'express';
import Worker from '../models/Worker';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import { sendResponse } from '../utils/responseHandler';
import { isValidEmail } from '../middlewares/validate';
import User from '../models/User';

const ALLOWED_VERIFICATION = ['pending', 'verified', 'rejected'] as const;

// Helper: enrich a worker object with totalEarnings from DB
const enrichWorker = async (worker: any) => {
  const obj = worker.toObject ? worker.toObject() : { ...worker };
  const bookingIds = await Booking.find({ worker: obj._id }).select('_id');
  const earningsAgg = await Payment.aggregate([
    { $match: { booking: { $in: bookingIds.map((b: any) => b._id) }, status: 'Completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  obj.totalEarnings = earningsAgg[0]?.total || 0;
  return obj;
};

export const getWorkers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, skill, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) {
      if (!ALLOWED_VERIFICATION.includes(status as any)) {
        return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_VERIFICATION.join(', ')}`);
      }
      query.verificationStatus = status;
    }
    if (skill) query.skills = { $in: [skill] };

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: String(search).trim(), $options: 'i' } },
          { phoneNumber: { $regex: String(search).trim(), $options: 'i' } }
        ]
      }).select('_id');
      query.user = { $in: users.map(u => u._id) };
    }

    const pageNum  = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));

    const workers = await Worker.find(query)
      .populate('user', 'name email phoneNumber avatar status address')
      .populate('skills', 'name category')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Worker.countDocuments(query);

    // Batch-enrich totalEarnings
    const workerIds = workers.map(w => w._id);
    const bookings  = await Booking.find({ worker: { $in: workerIds } }).select('_id worker');
    const allBookingIds = bookings.map(b => b._id);

    const earningsAgg = await Payment.aggregate([
      { $match: { booking: { $in: allBookingIds }, status: 'Completed' } },
      { $lookup: { from: 'bookings', localField: 'booking', foreignField: '_id', as: 'bookingObj' } },
      { $unwind: '$bookingObj' },
      { $group: { _id: '$bookingObj.worker', totalEarnings: { $sum: '$amount' } } }
    ]);

    const earningsMap: Record<string, number> = {};
    earningsAgg.forEach((e: any) => { earningsMap[e._id?.toString()] = e.totalEarnings; });

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

export const createWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, skills } = req.body;

    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return sendResponse(res, 400, false, 'userId is required');
    }

    const existingWorker = await Worker.findOne({ user: userId });
    if (existingWorker) {
      return sendResponse(res, 409, false, 'Worker profile already exists for this user');
    }

    const worker = await Worker.create({ user: userId, skills: Array.isArray(skills) ? skills : [] });
    sendResponse(res, 201, true, 'Worker profile created', worker);
  } catch (error) {
    next(error);
  }
};

export const updateWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { verificationStatus, skills, isOnline, rating, name, email, phoneNumber, address, avatar, status } = req.body;

    if (verificationStatus && !ALLOWED_VERIFICATION.includes(verificationStatus)) {
      return sendResponse(res, 400, false, `Invalid verificationStatus. Allowed: ${ALLOWED_VERIFICATION.join(', ')}`);
    }
    if (email && !isValidEmail(email)) {
      return sendResponse(res, 400, false, 'Invalid email format');
    }
    if (rating !== undefined) {
      const r = Number(rating);
      if (isNaN(r) || r < 0 || r > 5) {
        return sendResponse(res, 400, false, 'rating must be between 0 and 5');
      }
    }

    const workerUpdate: any = {};
    if (verificationStatus !== undefined) workerUpdate.verificationStatus = verificationStatus;
    if (skills !== undefined)             workerUpdate.skills = Array.isArray(skills) ? skills : [];
    if (isOnline !== undefined)           workerUpdate.isOnline = Boolean(isOnline);
    if (rating !== undefined)             workerUpdate.rating = Number(rating);

    const worker = await Worker.findByIdAndUpdate(req.params.id, workerUpdate, {
      new: true, runValidators: true,
    })
      .populate('user', 'name email phoneNumber avatar status address')
      .populate('skills', 'name category');

    if (!worker) return sendResponse(res, 404, false, 'Worker not found');

    // Update linked User document
    const userUpdate: any = {};
    if (name        !== undefined) userUpdate.name        = String(name).trim();
    if (email       !== undefined) userUpdate.email       = String(email).trim().toLowerCase();
    if (phoneNumber !== undefined) userUpdate.phoneNumber = String(phoneNumber).trim();
    if (address     !== undefined) userUpdate.address     = String(address).trim();
    if (avatar      !== undefined) userUpdate.avatar      = String(avatar).trim();
    if (status      !== undefined) userUpdate.status      = status;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(worker.user, userUpdate, { runValidators: true });
    }

    sendResponse(res, 200, true, 'Worker updated successfully', worker);
  } catch (error) {
    next(error);
  }
};

export const deleteWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return sendResponse(res, 404, false, 'Worker not found');
    sendResponse(res, 200, true, 'Worker deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
