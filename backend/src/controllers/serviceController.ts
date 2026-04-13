import { Request, Response, NextFunction } from 'express';
import Service from '../models/Service';
import { sendResponse } from '../utils/responseHandler';

// @desc    Get all services
// @route   GET /api/v1/services
export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, isActive, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.name = { $regex: search as string, $options: 'i' };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
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
    const { name, category, description, basePrice } = req.body;
    
    if (!name || !category || !basePrice) {
      return sendResponse(res, 400, false, 'Name, category, and basePrice are required');
    }

    const service = await Service.create(req.body);
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
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return sendResponse(res, 404, false, 'Service not found');
    }
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
