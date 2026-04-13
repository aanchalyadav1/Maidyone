import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import User from '../models/User';
import Worker from '../models/Worker';
import { sendResponse } from '../utils/responseHandler';

// @desc    Get dashboard aggregated analytics
// @route   GET /api/v1/dashboard
export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Total Bookings and status breakdown
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    let totalBookings = 0;
    let pendingBookings = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;

    bookingsByStatus.forEach(b => {
      totalBookings += b.count;
      if (b._id === 'Pending') pendingBookings = b.count;
      if (b._id === 'Completed') completedBookings = b.count;
      if (b._id === 'Cancelled') cancelledBookings = b.count;
    });

    // 2. Total Revenue (Completed Payments)
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // 3. User & Worker counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalWorkers = await Worker.countDocuments({ verificationStatus: 'verified' });

    // 4. Recent Bookings (Last 5)
    const recentBookings = await Booking.find()
      .populate('user', 'name avatar')
      .populate('worker', 'user')
      .populate('service', 'name category')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Booking Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendAgg = await Booking.aggregate([
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

    sendResponse(res, 200, true, 'Dashboard data fetched', {
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
  } catch (error) {
    next(error);
  }
};
