import { Request, Response, NextFunction } from 'express';
import Notification, { INotification } from '../models/Notification';
import { sendResponse } from '../utils/responseHandler';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, isRead, page = '1', limit = '20' } = req.query;

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
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    sendResponse(res, 200, true, 'Notifications fetched', {
      notifications,
      unreadCount,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/v1/notifications/:id/read
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return sendResponse(res, 404, false, 'Notification not found');
    sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read for the current user
// @route   PATCH /api/v1/notifications/read-all
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id;
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    sendResponse(res, 200, true, 'All notifications marked as read', null);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return sendResponse(res, 404, false, 'Notification not found');
    sendResponse(res, 200, true, 'Notification deleted', null);
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
    return notification;
  } catch (error) {
    console.error('Notification trigger failed:', error);
  }
};
