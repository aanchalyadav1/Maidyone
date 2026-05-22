import { Request, Response, NextFunction } from 'express';
import Coupon from '../models/Coupon';
import { sendResponse } from '../utils/responseHandler';
import { isValidPositiveNumber } from '../middlewares/validate';

const ALLOWED_DISCOUNT_TYPES = ['percent', 'flat'] as const;
const ALLOWED_STATUSES       = ['active', 'inactive', 'expired'] as const;

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, discountType, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) {
      if (!ALLOWED_STATUSES.includes(status as any)) {
        return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
      }
      query.status = status;
    }
    if (discountType) {
      if (!ALLOWED_DISCOUNT_TYPES.includes(discountType as any)) {
        return sendResponse(res, 400, false, `Invalid discountType. Allowed: ${ALLOWED_DISCOUNT_TYPES.join(', ')}`);
      }
      query.discountType = discountType;
    }
    if (search) query.code = { $regex: String(search).trim(), $options: 'i' };

    const pageNum  = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
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

    if (!code || typeof code !== 'string' || !code.trim()) {
      return sendResponse(res, 400, false, 'code is required');
    }
    if (!discountType || !ALLOWED_DISCOUNT_TYPES.includes(discountType)) {
      return sendResponse(res, 400, false, `discountType is required. Allowed: ${ALLOWED_DISCOUNT_TYPES.join(', ')}`);
    }
    if (discountValue === undefined || discountValue === null) {
      return sendResponse(res, 400, false, 'discountValue is required');
    }
    if (!isValidPositiveNumber(discountValue)) {
      return sendResponse(res, 400, false, 'discountValue must be a non-negative number');
    }
    if (discountType === 'percent' && Number(discountValue) > 100) {
      return sendResponse(res, 400, false, 'Percent discount cannot exceed 100');
    }
    if (usageLimit !== undefined && (!isValidPositiveNumber(usageLimit) || Number(usageLimit) < 1)) {
      return sendResponse(res, 400, false, 'usageLimit must be a positive integer');
    }
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const normalizedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) return sendResponse(res, 409, false, 'Coupon code already exists');

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType,
      discountValue: Number(discountValue),
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      validFrom: validFrom || undefined,
      validTo: validTo || undefined,
      status: status ?? 'active',
      usageCount: 0,
      appliesTo: 'all',
    });

    sendResponse(res, 201, true, 'Coupon created successfully', coupon);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, discountType, discountValue, usageLimit, validFrom, validTo, status } = req.body;

    if (discountType && !ALLOWED_DISCOUNT_TYPES.includes(discountType)) {
      return sendResponse(res, 400, false, `Invalid discountType. Allowed: ${ALLOWED_DISCOUNT_TYPES.join(', ')}`);
    }
    if (discountValue !== undefined && !isValidPositiveNumber(discountValue)) {
      return sendResponse(res, 400, false, 'discountValue must be a non-negative number');
    }
    if (discountType === 'percent' && discountValue !== undefined && Number(discountValue) > 100) {
      return sendResponse(res, 400, false, 'Percent discount cannot exceed 100');
    }
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const updateData: any = {};
    if (code         !== undefined) updateData.code         = String(code).trim().toUpperCase();
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (usageLimit   !== undefined) updateData.usageLimit   = Number(usageLimit);
    if (validFrom    !== undefined) updateData.validFrom    = validFrom;
    if (validTo      !== undefined) updateData.validTo      = validTo;
    if (status       !== undefined) updateData.status       = status;

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
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
