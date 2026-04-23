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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignWorker = exports.updateBookingStatus = exports.createBooking = exports.getBookingById = exports.getBookings = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const Notification_1 = __importDefault(require("../models/Notification"));
const responseHandler_1 = require("../utils/responseHandler");
// @desc    Get all bookings (with filters, search, pagination)
// @route   GET /api/v1/bookings
const getBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, service, date, search, page = '1', limit = '10' } = req.query;
        // Build query
        const query = {};
        if (status)
            query.status = status;
        if (service)
            query.service = service;
        if (search) {
            query.bookingId = { $regex: search, $options: 'i' };
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }
        // Pagination setup
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        // Execute query with populate
        const bookings = yield Booking_1.default.find(query)
            .populate('user', 'name email phoneNumber avatar')
            .populate('worker', 'user rating isOnline')
            .populate('service', 'name category basePrice')
            .skip(startIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = yield Booking_1.default.countDocuments(query);
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Bookings fetched successfully', {
            bookings,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getBookings = getBookings;
// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
const getBookingById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield Booking_1.default.findById(req.params.id)
            .populate('user', 'name email phoneNumber address avatar')
            .populate({
            path: 'worker',
            populate: { path: 'user', select: 'name email phoneNumber avatar' }
        })
            .populate('service', 'name category basePrice description');
        if (!booking) {
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Booking not found');
        }
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Booking details fetched', booking);
    }
    catch (error) {
        next(error);
    }
});
exports.getBookingById = getBookingById;
// @desc    Create new booking
// @route   POST /api/v1/bookings
const createBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate unique booking ID
        const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
        // Ensure frontend doesn't override critical defaults:
        const _a = req.body, { status, date, user } = _a, allowedPayload = __rest(_a, ["status", "date", "user"]);
        const newBooking = new Booking_1.default(Object.assign(Object.assign({}, allowedPayload), { bookingId, date: new Date(), status: 'Pending', user: req.user._id // Automatically extracted from token/middleware
         }));
        const savedBooking = yield newBooking.save();
        // Auto-trigger notification
        yield Notification_1.default.create({
            recipient: savedBooking.user,
            title: 'Booking Created',
            message: `Your booking ${savedBooking.bookingId} has been created and is pending confirmation.`,
            type: 'Booking',
            relatedId: savedBooking.bookingId
        });
        (0, responseHandler_1.sendResponse)(res, 201, true, 'Booking created successfully', savedBooking);
    }
    catch (error) {
        next(error);
    }
});
exports.createBooking = createBooking;
// @desc    Update booking status
// @route   PATCH /api/v1/bookings/:id/status
const updateBookingStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const allowedStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
        if (!allowedStatuses.includes(status)) {
            return (0, responseHandler_1.sendResponse)(res, 400, false, 'Invalid status provided');
        }
        const booking = yield Booking_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        if (!booking) {
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Booking not found');
        }
        // Auto-trigger notification
        yield Notification_1.default.create({
            recipient: booking.user,
            title: `Booking ${status}`,
            message: `Your booking ${booking.bookingId} status has been updated to ${status}.`,
            type: 'Booking',
            relatedId: booking.bookingId
        });
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Booking status updated', booking);
    }
    catch (error) {
        next(error);
    }
});
exports.updateBookingStatus = updateBookingStatus;
// @desc    Assign worker to booking
// @route   PATCH /api/v1/bookings/:id/assign-worker
const assignWorker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId } = req.body;
        if (!workerId) {
            return (0, responseHandler_1.sendResponse)(res, 400, false, 'Worker ID is required');
        }
        const booking = yield Booking_1.default.findByIdAndUpdate(req.params.id, { worker: workerId, status: 'Confirmed' }, { new: true });
        if (!booking) {
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Booking not found');
        }
        // Auto-trigger notification
        yield Notification_1.default.create({
            recipient: booking.user,
            title: `Worker Assigned`,
            message: `A worker has been assigned to your booking ${booking.bookingId}. Status is now Confirmed.`,
            type: 'Booking',
            relatedId: booking.bookingId
        });
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Worker assigned successfully', booking);
    }
    catch (error) {
        next(error);
    }
});
exports.assignWorker = assignWorker;
