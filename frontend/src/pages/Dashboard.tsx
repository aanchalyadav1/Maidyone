import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/common/StatCard';
import { BookingTrendChart } from '../components/charts/BookingTrendChart';
import { FileText, Clock, Component, CheckCircle, XCircle, Users, Briefcase, ShieldAlert, BadgeDollarSign, Wallet, Plus, Bell, AlignLeft, Lock } from 'lucide-react';
import api from '../services/api';

const FALLBACK_DATA = {
  stats: {
    totalBookings: 2547, pendingBookings: 1250, ongoingBookings: 570, completedBookings: 34590, cancelledBookings: 2547,
    totalUsers: 25272, totalWorkers: 3250, pendingVerification: 340, todayRevenue: 34590, totalRevenue: 1532315
  },
  trendData: [
    { date: '17 Apr', Booking: 80, Completed: 50 }, { date: '18 Apr', Booking: 150, Completed: 100 },
    { date: '19 Apr', Booking: 100, Completed: 70 }, { date: '20 Apr', Booking: 220, Completed: 120 },
    { date: '21 Apr', Booking: 110, Completed: 90 }, { date: '22 Apr', Booking: 250, Completed: 160 },
    { date: '23 Apr', Booking: 180, Completed: 110 }, { date: '24 Apr', Booking: 300, Completed: 150 }
  ],
  cityWise: [
    { city: 'Indore', bookings: 662, percent: 80, trend: '+35.7%' },
    { city: 'Bhopal', bookings: 530, percent: 65, trend: '+13.5%' },
    { city: 'New Delhi', bookings: 375, percent: 50, trend: '+15.7%' },
    { city: 'Noida', bookings: 250, percent: 35, trend: '+12.5%' },
    { city: 'Gurugram', bookings: 460, percent: 60, trend: '+12.2%' },
  ],
  recentBookings: [
    { id: '#BK-7845', name: 'Priya sharma', service: 'Room cleaning - Vijay nagar', time: '10:00 AM', status: 'Assign', color: 'bg-[#B2DFDB] text-[#00796B]' },
    { id: '#BK-7844', name: 'Priya sharma', service: 'Room cleaning - Vijay nagar', time: '10:00 AM', status: 'Ongoing', color: 'bg-[#FFF9C4] text-[#FBC02D]' },
    { id: '#BK-7843', name: 'Priya sharma', service: 'Room cleaning - Vijay nagar', time: '10:00 AM', status: 'Completed', color: 'bg-[#C8E6C9] text-[#388E3C]' },
    { id: '#BK-7842', name: 'Priya sharma', service: 'Room cleaning - Vijay nagar', time: '10:00 AM', status: 'Pending', color: 'bg-[#E1F5FE] text-[#0288D1]' },
    { id: '#BK-7841', name: 'Priya sharma', service: 'Room cleaning - Vijay nagar', time: '10:00 AM', status: 'Cancelled', color: 'bg-[#FFCCBC] text-[#D32F2F]' }
  ],
  workerRequests: [
    { name: 'Anita dodve', city: 'Indore', time: 'Applied 34 min ago' },
    { name: 'Anita dodve', city: 'Indore', time: 'Applied 34 min ago' }
  ],
  complains: [
    { id: '#C - 1562', desc: 'Service Quality - Room cleaning' },
    { id: '#C - 1561', desc: 'Payment Issues - Home cleaning' },
    { id: '#C - 1560', desc: 'Application problem - cleaning' }
  ]
};

const DashboardSkeleton = () => (
  <div className="w-full flex gap-4 h-[calc(100vh-140px)] animate-pulse">
    <div className="w-[30%] flex flex-col gap-4">
      <div className="flex-1 bg-[#D9D9D9] rounded-[24px]"></div>
      <div className="h-[30%] bg-[#D9D9D9] rounded-[24px]"></div>
    </div>
    <div className="w-[45%] flex flex-col gap-4">
       <div className="flex gap-4 h-10 w-full mb-2">
         <div className="w-24 bg-[#D9D9D9] rounded-lg"></div>
         <div className="w-48 bg-[#D9D9D9] rounded-lg"></div>
         <div className="w-16 bg-[#D9D9D9] rounded-lg ml-auto"></div>
       </div>
       <div className="flex-1 bg-[#D9D9D9] rounded-[24px]"></div>
    </div>
    <div className="w-[25%] flex flex-col gap-4 pt-14">
      <div className="h-[30%] bg-[#D9D9D9] rounded-[24px]"></div>
      <div className="flex-1 bg-[#D9D9D9] rounded-[24px]"></div>
      <div className="h-[10%] flex gap-2">
         <div className="flex-1 bg-[#D9D9D9] rounded-lg"></div>
         <div className="flex-1 bg-[#D9D9D9] rounded-lg"></div>
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [data, setData] = useState<any>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/dashboard');
        setData({
          ...FALLBACK_DATA,
          stats: { ...FALLBACK_DATA.stats, ...res.data?.stats },
          trendData: res.data?.trendData?.length ? res.data.trendData : FALLBACK_DATA.trendData 
        });
      } catch (err) {
        console.warn("Failed to fetch dashboard, using fallbacks");
      } finally {
        setTimeout(() => setLoading(false), 800); // Demo the layout loading exactly as user requested
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* 2 Rows of 5 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Booking" value={data.stats.totalBookings.toLocaleString()} trend="12.5%" trendUp={true} icon={FileText} iconColor="bg-blue-50 text-blue-500" />
        <StatCard title="Panding Booking" value={data.stats.pendingBookings.toLocaleString()} trend="12.5%" trendUp={true} icon={Clock} iconColor="bg-teal-50 text-teal-500" />
        <StatCard title="Ongoing Booking" value={data.stats.ongoingBookings.toLocaleString()} trend="5.9%" trendUp={true} icon={Component} iconColor="bg-yellow-50 text-yellow-500" />
        <StatCard title="Completed Booking" value={data.stats.completedBookings.toLocaleString()} trend="7.26%" trendUp={true} icon={CheckCircle} iconColor="bg-green-50 text-green-500" />
        <StatCard title="Cancelled Booking" value={data.stats.cancelledBookings.toLocaleString()} trend="2.5%" trendUp={false} icon={XCircle} iconColor="bg-red-50 text-red-500" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={data.stats.totalUsers.toLocaleString()} trend="12.5%" trendUp={true} icon={Users} iconColor="bg-[#E0F2F1] text-[#00897B]" />
        <StatCard title="Total Workers" value={data.stats.totalWorkers.toLocaleString()} trend="12.5%" trendUp={true} icon={Briefcase} iconColor="bg-[#FCE4EC] text-[#D81B60]" />
        <StatCard title="Panding Verification" value={data.stats.pendingVerification.toLocaleString()} trend="5.9%" trendUp={true} icon={ShieldAlert} iconColor="bg-[#E8EAF6] text-[#3F51B5]" />
        <StatCard title="Today's Revenue" value={data.stats.todayRevenue.toLocaleString()} trend="7.26%" trendUp={true} icon={BadgeDollarSign} iconColor="bg-[#E0F7FA] text-[#00BCD4]" />
        <StatCard title="Total Revenue" value={data.stats.totalRevenue.toLocaleString()} trend="2.5%" trendUp={false} icon={Wallet} iconColor="bg-[#E8F5E9] text-[#4CAF50]" />
      </div>

      {/* Charts & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-1 border border-border bg-white rounded-[24px] p-6 shadow-sm min-h-[320px]">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-[15px]">Booking Trend</h3>
             <select className="text-[11px] border border-border rounded px-2 py-1 outline-none text-text-secondary"><option>Last 7 days</option></select>
           </div>
           <BookingTrendChart data={data.trendData} />
        </div>
        
        <div className="col-span-1 lg:col-span-1 border border-border bg-white rounded-[24px] p-6 shadow-sm min-h-[320px] flex items-end justify-between relative overflow-hidden">
           {/* Mock Bar Chart Area */}
           <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
             <div>
               <h3 className="font-bold text-[15px] mb-1">Revenue Overview</h3>
               <div className="flex items-center gap-2"><span className="text-xl font-bold text-primary">₹1,24,580</span><span className="text-[10px] bg-[#E1F7E3] text-[#1E7145] px-2 py-[2px] rounded font-bold">+ 35.7%</span><span className="text-[10px] text-gray-400">vs last 7 days</span></div>
             </div>
             <select className="text-[11px] border border-border rounded px-2 py-1 outline-none text-text-secondary"><option>Last 7 days</option></select>
           </div>
           <div className="w-full h-32 flex items-end justify-between gap-2 px-2 mt-20">
             {[30, 45, 60, 90, 75, 100, 110, 115].map((h, i) => (
               <div key={i} className="w-full bg-[#1A73E8] rounded-t-sm" style={{ height: `${h}%` }}></div>
             ))}
           </div>
        </div>

        <div className="col-span-1 border border-border bg-white rounded-[24px] p-6 shadow-sm min-h-[320px]">
           <h3 className="font-bold text-[15px] mb-4">Quick Actions</h3>
           <div className="flex flex-col gap-[14px]">
             {[
               {icon: Plus, color: 'bg-[#1A73E8]', text: 'Create Booking', sub: 'Add new Booking manually'},
               {icon: Briefcase, color: 'bg-primary', text: 'Add Worker', sub: 'Register a new worker'},
               {icon: ShieldAlert, color: 'bg-[#8E24AA]', text: 'Add Services', sub: 'Create new services or category'},
               {icon: Bell, color: 'bg-[#F26B4D]', text: 'Send Notification', sub: 'Send message to user or worker'}
             ].map((action, i) => (
               <button key={i} className="flex items-center justify-between group">
                 <div className="flex items-center gap-3">
                   <div className={`${action.color} p-[10px] rounded-[10px] text-white`}><action.icon className="w-[18px] h-[18px]"/></div>
                   <div className="text-left leading-tight">
                     <p className="font-bold text-[13px] text-text-primary group-hover:text-primary transition-colors">{action.text}</p>
                     <p className="text-[11px] text-text-secondary">{action.sub}</p>
                   </div>
                 </div>
                 <span className="text-gray-300 text-lg group-hover:text-primary transition-colors">›</span>
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Bottom Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* City Wise Performance */}
        <div className="border border-border bg-white rounded-[24px] p-5 shadow-sm">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-[15px]">City - wise performance</h3>
             <select className="text-[11px] border border-border rounded px-2 py-1 outline-none"><option>This month</option></select>
           </div>
           <div className="space-y-4">
             {data.cityWise.map((c: any, i: number) => (
               <div key={i}>
                 <div className="flex justify-between items-end mb-1">
                   <div>
                     <p className="font-bold text-[13px]">{c.city}</p>
                     <p className="text-[11px] text-text-secondary">{c.bookings} Booking</p>
                   </div>
                   <span className="text-[10px] bg-[#E1F7E3] text-[#1E7145] px-[6px] py-[2px] rounded font-bold flex items-center gap-1">
                     <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                     {c.trend}
                   </span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-[#1A73E8] h-1.5 rounded-full" style={{width: `${c.percent}%`}}></div></div>
               </div>
             ))}
           </div>
        </div>

        {/* Recent Bookings */}
        <div className="border border-border bg-white rounded-[24px] p-5 shadow-sm col-span-1 lg:col-span-1">
           <div className="flex justify-between items-center mb-5">
             <h3 className="font-bold text-[15px]">Recent Bookings</h3>
             <button className="text-primary text-[12px] font-bold hover:underline">View All</button>
           </div>
           <div className="flex flex-col gap-4">
             {data.recentBookings.map((b: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/150?img=${i+20}`} className="w-9 h-9 rounded-full border border-gray-200" alt="user" />
                    <div className="leading-tight">
                      <p className="font-bold text-[13px] flex items-center gap-2">{b.id} <span className="text-text-primary/70 font-semibold">{b.name}</span></p>
                      <p className="text-[11px] text-text-secondary">{b.service}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] px-2 py-[2px] rounded uppercase font-bold tracking-wide ${b.color}`}>{b.status}</span>
                    <span className="text-[10px] text-text-secondary">{b.time}</span>
                  </div>
                </div>
             ))}
           </div>
        </div>

        {/* New worker requests & Latest complains */}
        <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
           <div className="border border-border bg-white rounded-[24px] p-5 shadow-sm flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[15px]">New worker requests</h3>
                <button className="text-primary text-[12px] font-bold hover:underline">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                {data.workerRequests.map((w: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/150?img=${i+40}`} className="w-9 h-9 rounded-full border border-gray-200" alt="worker" />
                      <div className="leading-tight">
                        <p className="font-bold text-[13px]">{w.name}</p>
                        <p className="text-[11px] text-text-primary/80">{w.city}</p>
                        <p className="text-[10px] text-text-secondary">{w.time}</p>
                      </div>
                    </div>
                    <button className="bg-[#1A73E8] text-white text-[10px] font-bold px-3 py-1.5 rounded-md hover:bg-blue-700 transition">Review</button>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="border border-border bg-white rounded-[24px] p-5 shadow-sm flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[15px]">Latest complains</h3>
                <button className="text-primary text-[12px] font-bold hover:underline">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                {data.complains.map((c: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="mt-1"><Lock className="w-[18px] h-[18px] text-gray-500"/></div>
                    <div className="leading-tight">
                      <p className="font-bold text-[13px] mb-0.5">{c.id}</p>
                      <p className="text-[11px] text-text-secondary">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
