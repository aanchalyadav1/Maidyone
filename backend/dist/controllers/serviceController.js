"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.getServiceById = exports.createService = exports.getServices = void 0;
const Service_1 = __importDefault(require("../models/Service"));
const responseHandler_1 = require("../utils/responseHandler");
// @desc    Get all services
// @route   GET /api/v1/services
const getServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, category, isActive, page = '1', limit = '10' } = req.query;
        const query = {};
        if (category)
            query.category = category;
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const services = yield Service_1.default.find(query)
            .skip(startIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = yield Service_1.default.countDocuments(query);
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Services fetched successfully', {
            services,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getServices = getServices;
// @desc    Create a new service
// @route   POST /api/v1/services
const createService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, category, description, basePrice } = req.body;
        if (!name || !category || !basePrice) {
            return (0, responseHandler_1.sendResponse)(res, 400, false, 'Name, category, and basePrice are required');
        }
        const service = yield Service_1.default.create(req.body);
        (0, responseHandler_1.sendResponse)(res, 201, true, 'Service created successfully', service);
    }
    catch (error) {
        next(error);
    }
});
exports.createService = createService;
// @desc    Get single service
// @route   GET /api/v1/services/:id
const getServiceById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = yield Service_1.default.findById(req.params.id);
        if (!service) {
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Service not found');
        }
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Service fetched', service);
    }
    catch (error) {
        next(error);
    }
});
exports.getServiceById = getServiceById;
// @desc    Update service
// @route   PUT /api/v1/services/:id
const updateService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = yield Service_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!service) {
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Service not found');
        }
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Service updated successfully', service);
    }
    catch (error) {
        next(error);
    }
});
exports.updateService = updateService;
// @desc    Delete (or deactivate) service
// @route   DELETE /api/v1/services/:id
const deleteService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Soft delete mapping it to inactive
        const service = yield Service_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!service) {
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Service not found');
        }
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Service deactivated successfully', null);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteService = deleteService;
