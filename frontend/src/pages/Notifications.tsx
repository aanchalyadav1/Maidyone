import React, { useEffect, useState, useCallback } from 'react';
import api, { extractApiData, normalizeApiError } from '../services/api';
import { Loader2, Bell, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationData {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await api.get('/notifications?limit=50');
      const data = extractApiData<{ notifications: NotificationData[]; unreadCount: number }>(res, {
        notifications: [],
        unreadCount: 0,
      } as any);
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err: any) {
      setError(normalizeApiError(err, 'Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e: any) {
      console.warn('Failed to mark as read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e: any) {
      console.warn('Failed to mark all as read', e);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => {
        const removed = prev.find(n => n._id === id);
        if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n._id !== id);
      });
    } catch (e: any) {
      console.warn('Failed to delete notification', e);
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'Booking': return 'bg-blue-100 text-blue-700';
      case 'Payment': return 'bg-green-100 text-green-700';
      case 'Ticket': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[500px] max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-800" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 bg-[#0EA5A4] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-sm text-primary font-medium hover:underline disabled:opacity-60"
            >
              {markingAll ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-400 text-center py-12 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 mb-3 text-gray-200" />
            You're all caught up!
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`p-4 rounded-xl border transition-colors ${
                  n.isRead ? 'border-gray-100 bg-white' : 'border-primary/20 bg-primary/5'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className={`font-semibold text-[14px] ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {n.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor(n.type)}`}>
                        {n.type}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#0EA5A4] inline-block" title="Unread" />
                      )}
                    </div>
                    <p className={`text-sm ${n.isRead ? 'text-gray-500' : 'text-gray-700'}`}>{n.message}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {format(new Date(n.createdAt), 'MMM dd, yyyy · HH:mm')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg text-[#0EA5A4] hover:bg-teal-50 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n._id)}
                      title="Delete notification"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
