import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import { sendResponse } from '../utils/responseHandler';
import { isValidPositiveNumber } from '../middlewares/validate';

const ALLOWED_STATUSES = ['Pending', 'Completed', 'Failed', 'Refunded'] as const;
const ALLOWED_METHODS  = ['Card', 'Cash', 'Wallet'] as const;

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, method, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) {
      if (!ALLOWED_STATUSES.includes(status as any)) {
        return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
      }
      query.status = status;
    }
    if (method) {
      if (!ALLOWED_METHODS.includes(method as any)) {
        return sendResponse(res, 400, false, `Invalid method. Allowed: ${ALLOWED_METHODS.join(', ')}`);
      }
      query.method = method;
    }
    if (search) {
      query.$or = [{ paymentId: { $regex: String(search).trim(), $options: 'i' } }];
    }

    const pageNum  = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
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

export const getPaymentStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalAgg, pendingAgg, refundedAgg, failedAgg, thisMonthAgg, earningsTrend] =
      await Promise.all([
        Payment.aggregate([{ $match: { status: 'Completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Payment.aggregate([{ $match: { status: 'Pending'   } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Payment.aggregate([{ $match: { status: 'Refunded'  } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Payment.aggregate([{ $match: { status: 'Failed'    } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Payment.aggregate([
          { $match: { status: 'Completed', createdAt: { $gte: (() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; })() } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
          { $match: { status: 'Completed', createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, Earnings: { $sum: '$amount' } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, name: '$_id', Earnings: 1, Payout: { $multiply: ['$Earnings', 0.7] } } }
        ]),
      ]);

    sendResponse(res, 200, true, 'Payment stats fetched', {
      totalEarnings:    totalAgg[0]?.total    || 0,
      pendingPayout:    pendingAgg[0]?.total  || 0,
      totalRefunded:    refundedAgg[0]?.total || 0,
      totalFailed:      failedAgg[0]?.total   || 0,
      thisMonthEarnings: thisMonthAgg[0]?.total || 0,
      earningsTrend,
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, method, status, userId, bookingId } = req.body;

    if (!amount || !method || !userId) {
      return sendResponse(res, 400, false, 'amount, method and userId are required');
    }
    if (!isValidPositiveNumber(amount)) {
      return sendResponse(res, 400, false, 'amount must be a positive number');
    }
    if (!ALLOWED_METHODS.includes(method)) {
      return sendResponse(res, 400, false, `Invalid method. Allowed: ${ALLOWED_METHODS.join(', ')}`);
    }
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const pId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const payment = await Payment.create({
      paymentId: pId,
      user: userId,
      booking: bookingId || undefined,
      amount: Number(amount),
      method,
      status: status || 'Pending',
    });

    sendResponse(res, 201, true, 'Payment recorded', payment);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!payment) return sendResponse(res, 404, false, 'Payment not found');
    sendResponse(res, 200, true, 'Payment status updated', payment);
  } catch (error) {
    next(error);
  }
};
