import { Request, Response, NextFunction } from 'express';
import Service from '../models/Service';
import { sendResponse } from '../utils/responseHandler';
import { isValidPositiveNumber } from '../middlewares/validate';

// @desc    Get all services
// @route   GET /api/v1/services
export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, isActive, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (category) query.category = String(category).trim();
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.name = { $regex: String(search).trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const startIndex = (pageNum - 1) * limitNum;

    const services = await Service.find(query)
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(query);

    sendResponse(res, 200, true, 'Services fetched successfully', {
      services,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service
// @route   POST /api/v1/services
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, description, basePrice, icon, isActive } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendResponse(res, 400, false, 'Name is required');
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return sendResponse(res, 400, false, 'Category is required');
    }
    if (basePrice === undefined || basePrice === null) {
      return sendResponse(res, 400, false, 'basePrice is required');
    }
    if (!isValidPositiveNumber(basePrice)) {
      return sendResponse(res, 400, false, 'basePrice must be a non-negative number');
    }

    const service = await Service.create({
      name: name.trim(),
      category: category.trim(),
      description: description ? String(description).trim() : '',
      basePrice: Number(basePrice),
      icon: icon ? String(icon).trim() : undefined,
      isActive: isActive !== false,
    });
    sendResponse(res, 201, true, 'Service created successfully', service);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/v1/services/:id
export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return sendResponse(res, 404, false, 'Service not found');
    }
    sendResponse(res, 200, true, 'Service fetched', service);
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/v1/services/:id
export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, description, basePrice, icon, isActive } = req.body;

    if (basePrice !== undefined && !isValidPositiveNumber(basePrice)) {
      return sendResponse(res, 400, false, 'basePrice must be a non-negative number');
    }

    const updateData: any = {};
    if (name !== undefined)        updateData.name        = String(name).trim();
    if (category !== undefined)    updateData.category    = String(category).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (basePrice !== undefined)   updateData.basePrice   = Number(basePrice);
    if (icon !== undefined)        updateData.icon        = String(icon).trim();
    if (isActive !== undefined)    updateData.isActive    = Boolean(isActive);

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) return sendResponse(res, 404, false, 'Service not found');
    sendResponse(res, 200, true, 'Service updated successfully', service);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (or deactivate) service
// @route   DELETE /api/v1/services/:id
export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Soft delete mapping it to inactive
    const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!service) {
      return sendResponse(res, 404, false, 'Service not found');
    }
    sendResponse(res, 200, true, 'Service deactivated successfully', null);
  } catch (error) {
    next(error);
  }
};
