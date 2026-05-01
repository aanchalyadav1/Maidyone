import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/common/StatCard';
import { BookingTrendChart } from '../components/charts/BookingTrendChart';
import { ServiceDistributionChart } from '../components/charts/ServiceDistributionChart';
import { FileText, Clock, Component, CheckCircle, XCircle, Users, Briefcase, ShieldAlert, BadgeDollarSign, Wallet, Plus, Bell, AlignLeft, Lock } from 'lucide-react';
import api from '../services/api';

const INITIAL_DATA = {
  stats: {
    totalBookings: 0, pendingBookings: 0, ongoingBookings: 0, completedBookings: 0, cancelledBookings: 0,
    totalUsers: 0, totalWorkers: 0, pendingVerification: 0, todayRevenue: 0, totalRevenue: 0
  },
  bookingTrend: [],
  revenueTrend: [],
  serviceDistribution: [],
  cityStats: [
    { city: 'Indore', bookings: 0, percent: 0, trend: '0%' },
    { city: 'Bhopal', bookings: 0, percent: 0, trend: '0%' }
  ],
  recentBookings: [],
  workerRequests: [],
  complains: []
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
  const [data, setData] = useState<any>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/dashboard');
        
        setData({
          ...INITIAL_DATA,
          stats: { ...INITIAL_DATA.stats, ...res.data?.stats },
          bookingTrend: res.data?.bookingTrend || [],
          revenueTrend: res.data?.revenueTrend || [],
          serviceDistribution: res.data?.serviceDistribution || [],
          cityStats: res.data?.cityStats?.length ? 
            res.data.cityStats.map((c: any) => ({
              city: c.city,
              bookings: c.bookings,
              percent: Math.min((c.bookings / (res.data?.stats?.totalBookings || 1)) * 100, 100),
              trend: 'Live'
            })) : INITIAL_DATA.cityStats,
          recentBookings: res.data?.recentBookings || [],
          workerRequests: res.data?.workerRequests || [],
          complains: res.data?.complaints || []
        });
      } catch (err) {
        console.warn("Failed to fetch dashboard, keeping empty state");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5">
      {/* 2 Rows of 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[14px]">
        <StatCard title="Total Booking" value={(data.stats.totalBookings || 0).toLocaleString()} trend="12.5%" trendUp={true} icon={FileText} iconColor="bg-blue-50 text-blue-500" />
        <StatCard title="Panding Booking" value={(data.stats.pendingBookings || 0).toLocaleString()} trend="12.5%" trendUp={true} icon={Clock} iconColor="bg-teal-50 text-teal-500" />
        <StatCard title="Ongoing Booking" value={(data.stats.ongoingBookings || 0).toLocaleString()} trend="5.9%" trendUp={true} icon={Component} iconColor="bg-yellow-50 text-yellow-500" />
        <StatCard title="Completed Booking" value={(data.stats.completedBookings || 0).toLocaleString()} trend="7.26%" trendUp={true} icon={CheckCircle} iconColor="bg-green-50 text-green-500" />
        <StatCard title="Cancelled Booking" value={(data.stats.cancelledBookings || 0).toLocaleString()} trend="2.5%" trendUp={false} icon={XCircle} iconColor="bg-red-50 text-red-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[14px]">
        <StatCard title="Total Users" value={(data.stats.totalUsers || 0).toLocaleString()} trend="12.5%" trendUp={true} icon={Users} iconColor="bg-[#E0F2F1] text-[#00897B]" />
        <StatCard title="Total Workers" value={(data.stats.totalWorkers || 0).toLocaleString()} trend="12.5%" trendUp={true} icon={Briefcase} iconColor="bg-[#FCE4EC] text-[#D81B60]" />
        <StatCard title="Panding Verification" value={(data.stats.pendingVerification || 0).toLocaleString()} trend="5.9%" trendUp={true} icon={ShieldAlert} iconColor="bg-[#E8EAF6] text-[#3F51B5]" />
        <StatCard title="Today's Revenue" value={(data.stats.todayRevenue || 0).toLocaleString()} trend="7.26%" trendUp={true} icon={BadgeDollarSign} iconColor="bg-[#E0F7FA] text-[#00BCD4]" />
        <StatCard title="Total Revenue" value={(data.stats.totalRevenue || 0).toLocaleString()} trend="2.5%" trendUp={false} icon={Wallet} iconColor="bg-[#E8F5E9] text-[#4CAF50]" />
      </div>

      {/* Charts & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="col-span-1 lg:col-span-1 border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft min-h-[320px]">
           <div className="flex justify-between items-center mb-5">
             <h3 className="font-extrabold text-[14px] text-text-primary">Booking Trend</h3>
             <select className="text-[11px] border border-border rounded-lg px-2.5 py-1.5 outline-none text-text-secondary bg-white"><option>Last 7 days</option></select>
           </div>
           <BookingTrendChart data={data.bookingTrend} />
        </div>
        
        <div className="col-span-1 lg:col-span-1 border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft min-h-[320px] flex items-end justify-between relative overflow-hidden">
           {/* Mock Bar Chart Area */}
           <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
             <div>
               <h3 className="font-extrabold text-[14px] text-text-primary mb-1">Revenue Overview</h3>
               <div className="flex items-center gap-2">
                 <span className="text-[18px] leading-[20px] font-extrabold text-primary">₹{(data.stats.totalRevenue || 0).toLocaleString()}</span>
                 <span className="text-[10px] bg-[#E1F7E3] text-[#1E7145] px-2 py-[3px] rounded-md font-bold">+ Live</span>
                 <span className="text-[10px] text-gray-400">vs last period</span>
               </div>
             </div>
             <select className="text-[11px] border border-border rounded-lg px-2.5 py-1.5 outline-none text-text-secondary bg-white"><option>Last 30 days</option></select>
           </div>
           <div className="w-full h-32 flex items-end justify-between gap-2 px-2 mt-20">
             {data.revenueTrend.length === 0 ? (
               <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No revenue data</div>
             ) : data.revenueTrend.map((r: any, i: number) => {
               const maxAmount = Math.max(...data.revenueTrend.map((d: any) => d.amount));
               const heightPercent = maxAmount > 0 ? (r.amount / maxAmount) * 100 : 0;
               return (
                 <div key={i} className="w-full bg-[#1A73E8] rounded-t-sm transition-all hover:bg-blue-600 cursor-pointer group relative" style={{ height: `${heightPercent}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 transition-opacity">
                      ₹{r.amount.toLocaleString()}<br/>{r.date}
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

        <div className="col-span-1 border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft min-h-[320px]">
           <h3 className="font-extrabold text-[14px] text-text-primary mb-4">Quick Actions</h3>
           <div className="flex flex-col gap-3">
             {[
               {icon: Plus, color: 'bg-[#1A73E8]', text: 'Create Booking', sub: 'Add new Booking manually'},
               {icon: Briefcase, color: 'bg-primary', text: 'Add Worker', sub: 'Register a new worker'},
               {icon: ShieldAlert, color: 'bg-[#8E24AA]', text: 'Add Services', sub: 'Create new services or category'},
               {icon: Bell, color: 'bg-[#F26B4D]', text: 'Send Notification', sub: 'Send message to user or worker'}
             ].map((action, i) => (
               <button key={i} className="flex items-center justify-between group rounded-2xl px-2 py-2 hover:bg-gray-50/70 transition-colors">
                 <div className="flex items-center gap-3">
                   <div className={`${action.color} p-[10px] rounded-[12px] text-white shadow-sm`}><action.icon className="w-[18px] h-[18px]"/></div>
                   <div className="text-left leading-tight">
                     <p className="font-extrabold text-[13px] text-text-primary group-hover:text-primary transition-colors">{action.text}</p>
                     <p className="text-[11px] leading-[14px] text-text-secondary">{action.sub}</p>
                   </div>
                 </div>
                 <span className="text-gray-300 text-lg group-hover:text-primary transition-colors">›</span>
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Bottom Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Service wise booking */}
        <div className="border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft col-span-1 lg:col-span-1">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-extrabold text-[14px] text-text-primary">Service wise booking</h3>
             <select className="text-[11px] border border-border rounded-lg px-2.5 py-1.5 outline-none bg-white"><option>Last 7 days</option></select>
           </div>
           <ServiceDistributionChart data={data.serviceDistribution} />
        </div>

        {/* City Wise Performance */}
        <div className="border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft">
           <div className="flex justify-between items-center mb-5">
             <h3 className="font-extrabold text-[14px] text-text-primary">City - wise performance</h3>
             <select className="text-[11px] border border-border rounded-lg px-2.5 py-1.5 outline-none bg-white"><option>This month</option></select>
           </div>
           <div className="space-y-4">
             {data.cityStats.map((c: any, i: number) => (
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
        <div className="border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft col-span-1 lg:col-span-1">
           <div className="flex justify-between items-center mb-5">
             <h3 className="font-extrabold text-[14px] text-text-primary">Recent Bookings</h3>
             <button className="text-primary text-[12px] font-bold hover:underline">View All</button>
           </div>
           <div className="flex flex-col gap-4">
             {data.recentBookings.length === 0 ? (
               <div className="text-center text-sm text-gray-500 py-4">No recent bookings found.</div>
             ) : data.recentBookings.map((b: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={b.user?.avatar || `https://i.pravatar.cc/150?img=${i+20}`} className="w-9 h-9 rounded-full border border-gray-200" alt="user" />
                    <div className="leading-tight">
                      <p className="font-bold text-[13px] flex items-center gap-2">{b.bookingId || `#BK-00${i}`} <span className="text-text-primary/70 font-semibold">{b.user?.name || 'Unknown'}</span></p>
                      <p className="text-[11px] text-text-secondary">{b.service?.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] px-2 py-[2px] rounded uppercase font-bold tracking-wide ${b.status === 'Completed' ? 'bg-[#C8E6C9] text-[#388E3C]' : 'bg-[#E1F5FE] text-[#0288D1]'}`}>{b.status || 'Pending'}</span>
                    <span className="text-[10px] text-text-secondary">{new Date(b.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
             ))}
           </div>
        </div>

        {/* New worker requests & Latest complains */}
        <div className="col-span-1 lg:col-span-1 flex flex-col gap-5">
           <div className="border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-[14px] text-text-primary">New worker requests</h3>
                <button className="text-primary text-[12px] font-bold hover:underline">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                {data.workerRequests.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-4">No pending worker requests.</div>
                ) : data.workerRequests.map((w: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={w.user?.avatar || `https://i.pravatar.cc/150?img=${i+40}`} className="w-9 h-9 rounded-full border border-gray-200" alt="worker" />
                      <div className="leading-tight">
                        <p className="font-bold text-[13px]">{w.user?.name}</p>
                        <p className="text-[11px] text-text-primary/80">{w.location?.city || 'Location N/A'}</p>
                        <p className="text-[10px] text-text-secondary">Applied {new Date(w.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="bg-[#1A73E8] text-white text-[10px] font-bold px-3 py-1.5 rounded-md hover:bg-blue-700 transition">Review</button>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-[14px] text-text-primary">Latest complains</h3>
                <button className="text-primary text-[12px] font-bold hover:underline">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                {data.complains.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-4">No open complaints found.</div>
                ) : data.complains.map((c: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="mt-1"><Lock className="w-[18px] h-[18px] text-gray-500"/></div>
                    <div className="leading-tight">
                      <p className="font-bold text-[13px] mb-0.5">{c.ticketId || `#TKT-00${i}`}</p>
                      <p className="text-[11px] text-text-secondary">{c.subject}</p>
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
