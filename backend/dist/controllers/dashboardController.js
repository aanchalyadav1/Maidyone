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
exports.getDashboardAnalytics = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const Payment_1 = __importDefault(require("../models/Payment"));
const User_1 = __importDefault(require("../models/User"));
const Worker_1 = __importDefault(require("../models/Worker"));
const responseHandler_1 = require("../utils/responseHandler");
// @desc    Get dashboard aggregated analytics
// @route   GET /api/v1/dashboard
const getDashboardAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Total Bookings and status breakdown
        const bookingsByStatus = yield Booking_1.default.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        let totalBookings = 0;
        let pendingBookings = 0;
        let completedBookings = 0;
        let cancelledBookings = 0;
        bookingsByStatus.forEach(b => {
            totalBookings += b.count;
            if (b._id === 'Pending')
                pendingBookings = b.count;
            if (b._id === 'Completed')
                completedBookings = b.count;
            if (b._id === 'Cancelled')
                cancelledBookings = b.count;
        });
        // 2. Total Revenue (Completed Payments)
        const revenueAgg = yield Payment_1.default.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
        // 3. User & Worker counts
        const totalUsers = yield User_1.default.countDocuments({ role: 'user' });
        const totalWorkers = yield Worker_1.default.countDocuments({ verificationStatus: 'verified' });
        // 4. Recent Bookings (Last 5)
        const recentBookings = yield Booking_1.default.find()
            .populate('user', 'name avatar')
            .populate('worker', 'user')
            .populate('service', 'name category')
            .sort({ createdAt: -1 })
            .limit(5);
        // 5. Booking Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const trendAgg = yield Booking_1.default.aggregate([
            { $match: { date: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%d %b", date: "$date" } },
                    bookings: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        // Format trend data for Recharts
        const trendData = trendAgg.map(t => ({
            name: t._id,
            Booking: t.bookings,
            Completed: t.completed
        }));
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Dashboard data fetched', {
            stats: {
                totalBookings,
                pendingBookings,
                completedBookings,
                cancelledBookings,
                totalRevenue,
                totalUsers,
                totalWorkers
            },
            recentBookings,
            trendData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getDashboardAnalytics = getDashboardAnalytics;
