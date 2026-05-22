import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Notification from '../models/Notification';
import { sendResponse } from '../utils/responseHandler';

const ALLOWED_STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'] as const;

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, service, date, search, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) {
      if (!ALLOWED_STATUSES.includes(status as any)) {
        return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
      }
      query.status = status;
    }
    if (service) {
      if (!mongoose.Types.ObjectId.isValid(service as string)) {
        return sendResponse(res, 400, false, 'Invalid service ID');
      }
      query.service = service;
    }
    if (search) query.bookingId = { $regex: String(search).trim(), $options: 'i' };
    if (date) {
      const startDate = new Date(date as string);
      if (isNaN(startDate.getTime())) {
        return sendResponse(res, 400, false, 'Invalid date format');
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const pageNum  = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));

    const bookings = await Booking.find(query)
      .populate('user', 'name email phoneNumber avatar')
      .populate({ path: 'worker', select: 'user rating isOnline', populate: { path: 'user', select: 'name email' } })
      .populate('service', 'name category basePrice')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);
    sendResponse(res, 200, true, 'Bookings fetched successfully', {
      bookings,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phoneNumber address avatar')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email phoneNumber avatar' } })
      .populate('service', 'name category basePrice description');

    if (!booking) return sendResponse(res, 404, false, 'Booking not found');
    sendResponse(res, 200, true, 'Booking details fetched', booking);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).user?._id;
    if (!authUserId) return sendResponse(res, 401, false, 'Not authorized');

    const { service, address, totalAmount, notes } = req.body;

    if (!service || !mongoose.Types.ObjectId.isValid(service)) {
      return sendResponse(res, 400, false, 'Valid service ID is required');
    }
    if (!address || typeof address !== 'string' || !address.trim()) {
      return sendResponse(res, 400, false, 'address is required');
    }
    if (totalAmount === undefined || isNaN(Number(totalAmount)) || Number(totalAmount) < 0) {
      return sendResponse(res, 400, false, 'totalAmount must be a non-negative number');
    }

    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = new Booking({
      bookingId,
      service,
      address: address.trim(),
      totalAmount: Number(totalAmount),
      notes: notes ? String(notes).trim() : undefined,
      date: new Date(),
      status: 'Pending',
      user: authUserId,
    });

    const savedBooking = await newBooking.save();

    await Notification.create({
      recipient: savedBooking.user,
      title: 'Booking Created',
      message: `Your booking ${savedBooking.bookingId} has been created and is pending confirmation.`,
      type: 'Booking',
      relatedId: savedBooking.bookingId,
    });

    sendResponse(res, 201, true, 'Booking created successfully', savedBooking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, { status }, { new: true, runValidators: true }
    );
    if (!booking) return sendResponse(res, 404, false, 'Booking not found');

    await Notification.create({
      recipient: booking.user,
      title: `Booking ${status}`,
      message: `Your booking ${booking.bookingId} status has been updated to ${status}.`,
      type: 'Booking',
      relatedId: booking.bookingId,
    });

    sendResponse(res, 200, true, 'Booking status updated', booking);
  } catch (error) {
    next(error);
  }
};

export const assignWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workerId } = req.body;
    if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
      return sendResponse(res, 400, false, 'Valid worker ID is required');
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { worker: workerId, status: 'Confirmed' },
      { new: true }
    );
    if (!booking) return sendResponse(res, 404, false, 'Booking not found');

    await Notification.create({
      recipient: booking.user,
      title: 'Worker Assigned',
      message: `A worker has been assigned to your booking ${booking.bookingId}. Status is now Confirmed.`,
      type: 'Booking',
      relatedId: booking.bookingId,
    });

    sendResponse(res, 200, true, 'Worker assigned successfully', booking);
  } catch (error) {
    next(error);
  }
};
