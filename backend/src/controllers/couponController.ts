import { Request, Response, NextFunction } from 'express';
import Coupon from '../models/Coupon';
import { sendResponse } from '../utils/responseHandler';

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, discountType, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (discountType) query.discountType = discountType;
    if (search) {
      query.code = { $regex: search as string, $options: 'i' };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    const total = await Coupon.countDocuments(query);

    sendResponse(res, 200, true, 'Coupons fetched successfully', {
      coupons,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return sendResponse(res, 404, false, 'Coupon not found');
    sendResponse(res, 200, true, 'Coupon fetched successfully', coupon);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, discountType, discountValue, usageLimit, validFrom, validTo, status } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return sendResponse(res, 400, false, 'code, discountType and discountValue are required');
    }
    const normalizedCode = String(code).trim().toUpperCase();

    if (typeof discountValue !== 'number' || discountValue < 0) {
      return sendResponse(res, 400, false, 'discountValue must be a non-negative number');
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType,
      discountValue,
      usageLimit,
      validFrom,
      validTo,
      status: status ?? 'active',
      usageCount: 0,
      appliesTo: 'all'
    });

    sendResponse(res, 201, true, 'Coupon created successfully', coupon);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, discountType, discountValue, usageLimit, validFrom, validTo, status } = req.body;

    const updateData: any = {};
    if (code) updateData.code = String(code).trim().toUpperCase();
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (validFrom !== undefined) updateData.validFrom = validFrom;
    if (validTo !== undefined) updateData.validTo = validTo;
    if (status) updateData.status = status;

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!coupon) return sendResponse(res, 404, false, 'Coupon not found');

    sendResponse(res, 200, true, 'Coupon updated successfully', coupon);
  } catch (error) {
    next(error);
  }
};

export const deactivateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true, runValidators: true }
    );
    if (!coupon) return sendResponse(res, 404, false, 'Coupon not found');
    sendResponse(res, 200, true, 'Coupon deactivated successfully', coupon);
  } catch (error) {
    next(error);
  }
};

