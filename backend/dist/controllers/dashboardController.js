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
const Ticket_1 = __importDefault(require("../models/Ticket"));
const responseHandler_1 = require("../utils/responseHandler");
const getDashboardAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Bookings stats (total, pending, ongoing, completed, cancelled)
        const bookingsByStatus = yield Booking_1.default.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        let totalBookings = 0;
        let pendingBookings = 0;
        let ongoingBookings = 0;
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
            if (b._id === 'In Progress' || b._id === 'Confirmed')
                ongoingBookings += b.count;
        });
        // 2. Revenue stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const revenueAgg = yield Payment_1.default.aggregate([
            { $match: { status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    todayRevenue: {
                        $sum: {
                            $cond: [{ $gte: ['$createdAt', today] }, '$amount', 0]
                        }
                    }
                }
            }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? (revenueAgg[0].totalRevenue || 0) : 0;
        const todayRevenue = revenueAgg.length > 0 ? (revenueAgg[0].todayRevenue || 0) : 0;
        // 3. Entity stats
        const totalUsers = (yield User_1.default.countDocuments({ role: 'user' })) || 0;
        const totalWorkers = (yield Worker_1.default.countDocuments({ verificationStatus: 'verified' })) || 0;
        const pendingVerification = (yield Worker_1.default.countDocuments({ verificationStatus: 'pending' })) || 0;
        // 4. bookingTrend (Group by date)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const bookingTrendAgg = yield Booking_1.default.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    bookings: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", bookings: 1, completed: 1 } }
        ]);
        const bookingTrend = bookingTrendAgg;
        // 5. revenueTrend (Group payments by date)
        const revenueTrendAgg = yield Payment_1.default.aggregate([
            { $match: { status: 'Completed', createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    amount: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", amount: 1 } }
        ]);
        const revenueTrend = revenueTrendAgg;
        // 6. serviceDistribution (Donut chart data)
        const serviceDistributionAgg = yield Booking_1.default.aggregate([
            {
                $lookup: {
                    from: 'services',
                    localField: 'service',
                    foreignField: '_id',
                    as: 'serviceObj'
                }
            },
            { $unwind: { path: '$serviceObj', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$serviceObj.name', 'Other'] },
                    value: { $sum: 1 }
                }
            },
            { $project: { _id: 0, name: '$_id', value: 1 } }
        ]);
        const serviceDistribution = serviceDistributionAgg;
        // 7. cityStats (Group by city)
        const cityStatsAgg = yield Booking_1.default.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userObj'
                }
            },
            { $unwind: { path: '$userObj', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$userObj.address', 'Unknown'] },
                    bookings: { $sum: 1 }
                }
            },
            { $project: { _id: 0, city: '$_id', bookings: 1 } }
        ]);
        // Simplify naive address to city mock for demo if string addresses, otherwise use as-is
        const cityStats = cityStatsAgg;
        // 8. Lists
        const recentBookings = yield Booking_1.default.find()
            .populate('user', 'name avatar email')
            .populate({
            path: 'worker',
            populate: { path: 'user', select: 'name email' }
        })
            .populate('service', 'name category basePrice')
            .sort({ createdAt: -1 })
            .limit(5);
        const workerRequests = yield Worker_1.default.find({ verificationStatus: 'pending' })
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(5);
        const complaints = yield Ticket_1.default.find({ status: 'Open' })
            .populate('user', 'name avatar email')
            .sort({ createdAt: -1 })
            .limit(5);
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Dashboard data fetched', {
            stats: {
                totalBookings,
                pendingBookings,
                ongoingBookings,
                completedBookings,
                cancelledBookings,
                totalUsers,
                totalWorkers,
                pendingVerification,
                todayRevenue,
                totalRevenue
            },
            bookingTrend,
            revenueTrend,
            serviceDistribution,
            cityStats,
            recentBookings,
            workerRequests,
            complaints
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getDashboardAnalytics = getDashboardAnalytics;
