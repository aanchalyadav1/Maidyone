import { Request, Response, NextFunction } from 'express';
import Banner from '../models/Banner';
import { sendResponse } from '../utils/responseHandler';

const ALLOWED_PLACEMENTS = ['Home', 'Bookings', 'Offers', 'Dashboard'] as const;
const ALLOWED_STATUSES   = ['active', 'inactive', 'expired'] as const;

export const getBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, placement, status, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) {
      if (!ALLOWED_STATUSES.includes(status as any)) {
        return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
      }
      query.status = status;
    }
    if (placement) {
      if (!ALLOWED_PLACEMENTS.includes(placement as any)) {
        return sendResponse(res, 400, false, `Invalid placement. Allowed: ${ALLOWED_PLACEMENTS.join(', ')}`);
      }
      query.placement = placement;
    }
    if (search) query.title = { $regex: String(search).trim(), $options: 'i' };

    const pageNum  = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));

    const banners = await Banner.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Banner.countDocuments(query);
    sendResponse(res, 200, true, 'Banners fetched successfully', {
      banners,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

export const getBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return sendResponse(res, 404, false, 'Banner not found');
    sendResponse(res, 200, true, 'Banner fetched successfully', banner);
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, placement, imageUrl, ctaLabel, ctaTarget, status, validFrom, validTo } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return sendResponse(res, 400, false, 'title is required');
    }
    if (!placement || !ALLOWED_PLACEMENTS.includes(placement)) {
      return sendResponse(res, 400, false, `placement is required. Allowed: ${ALLOWED_PLACEMENTS.join(', ')}`);
    }
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const banner = await Banner.create({
      title: title.trim(),
      placement,
      imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
      ctaLabel: ctaLabel ? String(ctaLabel).trim() : undefined,
      ctaTarget: ctaTarget ? String(ctaTarget).trim() : undefined,
      validFrom: validFrom || undefined,
      validTo: validTo || undefined,
      status: status ?? 'active',
    });

    sendResponse(res, 201, true, 'Banner created successfully', banner);
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, placement, imageUrl, ctaLabel, ctaTarget, status, validFrom, validTo } = req.body;

    if (placement && !ALLOWED_PLACEMENTS.includes(placement)) {
      return sendResponse(res, 400, false, `Invalid placement. Allowed: ${ALLOWED_PLACEMENTS.join(', ')}`);
    }
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const updateData: any = {};
    if (title     !== undefined) updateData.title     = String(title).trim();
    if (placement !== undefined) updateData.placement = placement;
    if (imageUrl  !== undefined) updateData.imageUrl  = String(imageUrl).trim();
    if (ctaLabel  !== undefined) updateData.ctaLabel  = String(ctaLabel).trim();
    if (ctaTarget !== undefined) updateData.ctaTarget = String(ctaTarget).trim();
    if (status    !== undefined) updateData.status    = status;
    if (validFrom !== undefined) updateData.validFrom = validFrom;
    if (validTo   !== undefined) updateData.validTo   = validTo;

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });

    if (!banner) return sendResponse(res, 404, false, 'Banner not found');
    sendResponse(res, 200, true, 'Banner updated successfully', banner);
  } catch (error) {
    next(error);
  }
};

export const deactivateBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true, runValidators: true }
    );
    if (!banner) return sendResponse(res, 404, false, 'Banner not found');
    sendResponse(res, 200, true, 'Banner deactivated successfully', banner);
  } catch (error) {
    next(error);
  }
};
