import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/common/StatCard';
import { BookingTrendChart } from '../components/charts/BookingTrendChart';
import { FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res: any = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!data) {
    return <div className="p-8 text-red-500">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Booking" 
          value={data.stats.totalBookings.toLocaleString()} 
          trend="0%" 
          trendUp={true} 
          icon={FileText} 
          iconColor="bg-blue-100" 
        />
        <StatCard 
          title="Pending Booking" 
          value={data.stats.pendingBookings.toLocaleString()} 
          trend="0%" 
          trendUp={true} 
          icon={Clock} 
          iconColor="bg-yellow-100" 
        />
        <StatCard 
          title="Completed Booking" 
          value={data.stats.completedBookings.toLocaleString()} 
          trend="0%" 
          trendUp={true} 
          icon={CheckCircle} 
          iconColor="bg-green-100" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${data.stats.totalRevenue.toLocaleString()}`} 
          trend="0%" 
          trendUp={true} 
          icon={FileText} 
          iconColor="bg-primary/20 text-primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <BookingTrendChart data={data.trendData?.length ? data.trendData : []} />
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 h-80">
           <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
           {/* Action Buttons Mockup */}
           <div className="flex flex-col gap-3">
             <button className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><FileText className="w-5 h-5"/></div>
                 <div className="text-left text-sm"><p className="font-medium">Create Booking</p><p className="text-gray-400 text-xs">Add new booking manually</p></div>
               </div>
               <span className="text-gray-400">&rsaquo;</span>
             </button>
             {/* Repeat for other quick actions */}
           </div>
        </div>
      </div>
    </div>
  );
};
