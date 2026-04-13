import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import { sendResponse } from '../utils/responseHandler';

// @desc    Fetch transactions
// @route   GET /api/v1/payments
export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, method, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (method) query.method = method;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    // Use lean() for read-heavy operations where methods aren't needed
    const payments = await Payment.find(query)
      .populate('user', 'name email phoneNumber')
      .populate('booking', 'bookingId status')
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Payment.countDocuments(query);

    sendResponse(res, 200, true, 'Payments fetched successfully', {
      payments,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record new payment (and update booking status)
// @route   POST /api/v1/payments
export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  // Start a transaction session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, amount, method, status, transactionId } = req.body;

    if (!bookingId || !amount) {
      throw { statusCode: 400, message: 'Booking ID and amount are required' };
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      throw { statusCode: 404, message: 'Booking not found' };
    }

    const uniquePayId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment = new Payment({
      paymentId: uniquePayId,
      booking: bookingId,
      user: booking.user,
      amount,
      method: method || 'Card',
      status: status || 'Completed',
      transactionId
    });

    const savedPayment = await newPayment.save({ session });

    // Optional business logic: if payment completed, possibly update booking
    if (status === 'Completed' && booking.status === 'Pending') {
      booking.status = 'Confirmed';
      await booking.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    sendResponse(res, 201, true, 'Payment recorded successfully', savedPayment);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    // Pass to global error handler
    next(error);
  }
};
