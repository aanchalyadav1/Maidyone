import { Request, Response, NextFunction } from 'express';
import Banner from '../models/Banner';
import { sendResponse } from '../utils/responseHandler';

export const getBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, placement, status, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (placement) query.placement = placement;

    if (search) {
      query.title = { $regex: search as string, $options: 'i' };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const banners = await Banner.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
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

    if (!title || !placement) {
      return sendResponse(res, 400, false, 'title and placement are required');
    }

    const banner = await Banner.create({
      title,
      placement,
      imageUrl,
      ctaLabel,
      ctaTarget,
      validFrom,
      validTo,
      status: status ?? 'active'
    });

    sendResponse(res, 201, true, 'Banner created successfully', banner);
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, placement, imageUrl, ctaLabel, ctaTarget, status, validFrom, validTo } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (placement !== undefined) updateData.placement = placement;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (ctaLabel !== undefined) updateData.ctaLabel = ctaLabel;
    if (ctaTarget !== undefined) updateData.ctaTarget = ctaTarget;
    if (status !== undefined) updateData.status = status;
    if (validFrom !== undefined) updateData.validFrom = validFrom;
    if (validTo !== undefined) updateData.validTo = validTo;

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
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


