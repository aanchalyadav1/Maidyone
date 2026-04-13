import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Loader2, Bell, CheckCircle } from 'lucide-react';
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

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err: any) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[500px] max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-800" /> Notifications
          </h2>
          <button className="text-sm text-primary font-medium hover:underline">Mark all as read</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">{error}</div>
        ) : notifications.length === 0 ? (
           <div className="text-gray-400 text-center py-12 flex flex-col items-center">
             <CheckCircle className="w-12 h-12 mb-3 text-gray-200" />
             You're all caught up!
           </div>
        ) : (
          <div className="space-y-4">
             {notifications.map(n => (
               <div key={n._id} className={`p-4 rounded-xl border ${n.isRead ? 'border-gray-100 bg-white' : 'border-primary/20 bg-primary/5'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h4>
                    <span className="text-xs text-gray-400">{format(new Date(n.createdAt), 'MMM dd, HH:mm')}</span>
                  </div>
                  <p className={`text-sm ${n.isRead ? 'text-gray-500' : 'text-gray-700'}`}>{n.message}</p>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
