import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import { sendResponse } from '../utils/responseHandler';

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { paymentId: { $regex: search as string, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const payments = await Payment.find(query)
      .populate('user', 'name email avatar')
      .populate('booking')
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    sendResponse(res, 200, true, 'Payments fetched', {
      payments,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, method, status, userId, bookingId } = req.body;

    if (!amount || !method || !userId) {
      return sendResponse(res, 400, false, 'Amount, method and userId are required');
    }

    const pId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;

    const payment = await Payment.create({
      paymentId: pId,
      user: userId,
      booking: bookingId,
      amount,
      method,
      status: status || 'Pending'
    });

    sendResponse(res, 201, true, 'Payment recorded', payment);
  } catch (error) {
    next(error);
  }
};
