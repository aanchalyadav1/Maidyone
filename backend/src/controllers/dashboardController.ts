import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import User from '../models/User';
import Worker from '../models/Worker';
import Ticket from '../models/Ticket';
import { sendResponse } from '../utils/responseHandler';

export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Bookings stats (total, pending, ongoing, completed, cancelled)
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    let totalBookings = 0;
    let pendingBookings = 0;
    let ongoingBookings = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;

    bookingsByStatus.forEach(b => {
      totalBookings += b.count;
      if (b._id === 'Pending') pendingBookings = b.count;
      if (b._id === 'Completed') completedBookings = b.count;
      if (b._id === 'Cancelled') cancelledBookings = b.count;
      if (b._id === 'In Progress' || b._id === 'Confirmed') ongoingBookings += b.count;
    });

    // 2. Revenue stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revenueAgg = await Payment.aggregate([
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
    const totalUsers = (await User.countDocuments({ role: 'user' })) || 0;
    const totalWorkers = (await Worker.countDocuments({ verificationStatus: 'verified' })) || 0;
    const pendingVerification = (await Worker.countDocuments({ verificationStatus: 'pending' })) || 0;

    // 4. bookingTrend (Group by date)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const bookingTrendAgg = await Booking.aggregate([
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
    const revenueTrendAgg = await Payment.aggregate([
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
    const serviceDistributionAgg = await Booking.aggregate([
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
    const cityStatsAgg = await Booking.aggregate([
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
    const recentBookings = await Booking.find()
      .populate('user', 'name avatar email')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('service', 'name category basePrice')
      .sort({ createdAt: -1 })
      .limit(5);

    const workerRequests = await Worker.find({ verificationStatus: 'pending' })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    const complaints = await Ticket.find({ status: 'Open' })
      .populate('user', 'name avatar email')
      .sort({ createdAt: -1 })
      .limit(5);

    sendResponse(res, 200, true, 'Dashboard data fetched', {
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
  } catch (error) {
    next(error);
  }
};
