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
exports.getUserById = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const responseHandler_1 = require("../utils/responseHandler");
// @desc    Get all users
// @route   GET /api/v1/users
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, role, page = '1', limit = '10' } = req.query;
        const query = {};
        if (role)
            query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const users = yield User_1.default.find(query)
            .select('-firebaseUid') // Protect internal firebase ID
            .skip(startIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = yield User_1.default.countDocuments(query);
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Users fetched successfully', {
            users,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUsers = getUsers;
// @desc    Get single user details
// @route   GET /api/v1/users/:id
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id)
            .select('-firebaseUid');
        if (!user) {
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'User not found');
        }
        (0, responseHandler_1.sendResponse)(res, 200, true, 'User details fetched', user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserById = getUserById;
