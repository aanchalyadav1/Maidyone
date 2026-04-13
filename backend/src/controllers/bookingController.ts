import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import { sendResponse } from '../utils/responseHandler';

// @desc    Get all bookings (with filters, search, pagination)
// @route   GET /api/v1/bookings
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, service, date, search, page = '1', limit = '10' } = req.query;
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (service) query.service = service;
    
    if (search) {
      query.bookingId = { $regex: search as string, $options: 'i' };
    }

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(date as string);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    // Pagination setup
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    // Execute query with populate
    const bookings = await Booking.find(query)
      .populate('user', 'name email phoneNumber avatar')
      .populate('worker', 'user rating isOnline')
      .populate('service', 'name category basePrice')
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    sendResponse(res, 200, true, 'Bookings fetched successfully', {
      bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phoneNumber address avatar')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name email phoneNumber avatar' }
      })
      .populate('service', 'name category basePrice description');

    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }

    sendResponse(res, 200, true, 'Booking details fetched', booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/v1/bookings
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Generate unique booking ID
    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Ensure frontend doesn't override critical defaults:
    const { status, date, user, ...allowedPayload } = req.body;
    
    const newBooking = new Booking({
      ...allowedPayload,
      bookingId,
      date: new Date(), // Enforce Server-time
      status: 'Pending', // Enforce default
      user: (req as any).user._id // Automatically extracted from token/middleware
    });

    const savedBooking = await newBooking.save();
    
    sendResponse(res, 201, true, 'Booking created successfully', savedBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/v1/bookings/:id/status
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    const allowedStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return sendResponse(res, 400, false, 'Invalid status provided');
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }

    sendResponse(res, 200, true, 'Booking status updated', booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign worker to booking
// @route   PATCH /api/v1/bookings/:id/assign-worker
export const assignWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workerId } = req.body;
    
    if (!workerId) {
      return sendResponse(res, 400, false, 'Worker ID is required');
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { worker: workerId, status: 'Confirmed' },
      { new: true }
    );

    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }

    sendResponse(res, 200, true, 'Worker assigned successfully', booking);
  } catch (error) {
    next(error);
  }
};
