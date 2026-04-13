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
exports.recordPayment = exports.getPayments = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Booking_1 = __importDefault(require("../models/Booking"));
const responseHandler_1 = require("../utils/responseHandler");
// @desc    Fetch transactions
// @route   GET /api/v1/payments
const getPayments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, method, page = '1', limit = '10' } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (method)
            query.method = method;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        // Use lean() for read-heavy operations where methods aren't needed
        const payments = yield Payment_1.default.find(query)
            .populate('user', 'name email phoneNumber')
            .populate('booking', 'bookingId status')
            .skip(startIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .lean();
        const total = yield Payment_1.default.countDocuments(query);
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Payments fetched successfully', {
            payments,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPayments = getPayments;
// @desc    Record new payment (and update booking status)
// @route   POST /api/v1/payments
const recordPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Start a transaction session for atomicity
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { bookingId, amount, method, status, transactionId } = req.body;
        if (!bookingId || !amount) {
            throw { statusCode: 400, message: 'Booking ID and amount are required' };
        }
        // Verify booking exists
        const booking = yield Booking_1.default.findById(bookingId).session(session);
        if (!booking) {
            throw { statusCode: 404, message: 'Booking not found' };
        }
        const uniquePayId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
        const newPayment = new Payment_1.default({
            paymentId: uniquePayId,
            booking: bookingId,
            user: booking.user,
            amount,
            method: method || 'Card',
            status: status || 'Completed',
            transactionId
        });
        const savedPayment = yield newPayment.save({ session });
        // Optional business logic: if payment completed, possibly update booking
        if (status === 'Completed' && booking.status === 'Pending') {
            booking.status = 'Confirmed';
            yield booking.save({ session });
        }
        yield session.commitTransaction();
        session.endSession();
        (0, responseHandler_1.sendResponse)(res, 201, true, 'Payment recorded successfully', savedPayment);
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        // Pass to global error handler
        next(error);
    }
});
exports.recordPayment = recordPayment;
