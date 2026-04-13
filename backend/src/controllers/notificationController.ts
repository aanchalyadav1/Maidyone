import { Request, Response, NextFunction } from 'express';
import Notification, { INotification } from '../models/Notification';
import { sendResponse } from '../utils/responseHandler';
// Placeholder for FCM Integration Service
// import { sendPushNotification } from '../services/firebaseService';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, isRead, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (userId) query.recipient = userId;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const notifications = await Notification.find(query)
      .skip(startIndex)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    sendResponse(res, 200, true, 'Notifications fetched', {
      notifications,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Service function to trigger notifications programmatically
 * (Used internally by other controllers, not a route handler)
 */
export const triggerNotification = async (data: Partial<INotification>) => {
  try {
    const notification = await Notification.create(data);
    
    // Abstract FCM call
    // await sendPushNotification(notification.recipient, notification.title, notification.message);
    
    return notification;
  } catch (error) {
    console.error('Notification trigger failed:', error);
    // Non-blocking error logging
  }
};
