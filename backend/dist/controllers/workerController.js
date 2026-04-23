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
exports.updateWorker = exports.createWorker = exports.getWorkers = void 0;
const Worker_1 = __importDefault(require("../models/Worker"));
const responseHandler_1 = require("../utils/responseHandler");
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all workers
// @route   GET /api/v1/workers
const getWorkers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, status, skill, page = '1', limit = '10' } = req.query;
        const query = {};
        if (status)
            query.verificationStatus = status;
        if (skill)
            query.skills = { $in: [skill] };
        if (search) {
            const users = yield User_1.default.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phoneNumber: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            query.user = { $in: users.map(u => u._id) };
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const workers = yield Worker_1.default.find(query)
            .populate('user', 'name email phoneNumber avatar status')
            .populate('skills', 'name category')
            .skip(startIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = yield Worker_1.default.countDocuments(query);
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Workers fetched successfully', {
            workers,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getWorkers = getWorkers;
// @desc    Create new worker link (Internal User mapped to Worker persona)
// @route   POST /api/v1/workers
const createWorker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, skills } = req.body;
        // Check if worker profile already exists
        const existingWorker = yield Worker_1.default.findOne({ user: userId });
        if (existingWorker) {
            return (0, responseHandler_1.sendResponse)(res, 400, false, 'Worker profile already exists for this user');
        }
        const worker = yield Worker_1.default.create({
            user: userId,
            skills: skills || []
        });
        (0, responseHandler_1.sendResponse)(res, 201, true, 'Worker profile created', worker);
    }
    catch (error) {
        next(error);
    }
});
exports.createWorker = createWorker;
// @desc    Update worker details/status
// @route   PATCH /api/v1/workers/:id
const updateWorker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const worker = yield Worker_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('user', 'name')
            .populate('skills', 'name category');
        if (!worker) {
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Worker not found');
        }
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Worker updated successfully', worker);
    }
    catch (error) {
        next(error);
    }
});
exports.updateWorker = updateWorker;
