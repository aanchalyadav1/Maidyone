import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/common/StatCard';
import { BookingTrendChart } from '../components/charts/BookingTrendChart';
import { ServiceDistributionChart } from '../components/charts/ServiceDistributionChart';
import {
  FileText, Clock, Component, CheckCircle, XCircle,
  Users, Briefcase, ShieldAlert, BadgeDollarSign, Wallet,
  Plus, Bell, Lock,
} from 'lucide-react';
import api from '../services/api';

// ─── Safe defaults — prevent undefined crashes ────────────────────────────────
const INITIAL_DATA = {
  stats: {
    totalBookings: 0, pendingBookings: 0, ongoingBookings: 0,
    completedBookings: 0, cancelledBookings: 0,
    totalUsers: 0, totalWorkers: 0, pendingVerification: 0,
    todayRevenue: 0, totalRevenue: 0,
  },
  bookingTrend:        [] as any[],
  revenueTrend:        [] as any[],
  serviceDistribution: [] as any[],
  cityStats: [
    { city: 'Indore', bookings: 0, percent: 0, trend: '0%' },
    { city: 'Bhopal', bookings: 0, percent: 0, trend: '0%' },
  ] as any[],
  recentBookings:  [] as any[],
  workerRequests:  [] as any[],
  complains:       [] as any[],
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="w-full flex gap-4 h-[calc(100vh-140px)] animate-pulse">
    <div className="w-[30%] flex flex-col gap-4">
      <div className="flex-1 bg-[#D9D9D9] rounded-[24px]" />
      <div className="h-[30%] bg-[#D9D9D9] rounded-[24px]" />
    </div>
    <div className="w-[45%] flex flex-col gap-4">
      <div className="flex gap-4 h-10 w-full mb-2">
        <div className="w-24 bg-[#D9D9D9] rounded-lg" />
        <div className="w-48 bg-[#D9D9D9] rounded-lg" />
        <div className="w-16 bg-[#D9D9D9] rounded-lg ml-auto" />
      </div>
      <div className="flex-1 bg-[#D9D9D9] rounded-[24px]" />
    </div>
    <div className="w-[25%] flex flex-col gap-4 pt-14">
      <div className="h-[30%] bg-[#D9D9D9] rounded-[24px]" />
      <div className="flex-1 bg-[#D9D9D9] rounded-[24px]" />
      <div className="h-[10%] flex gap-2">
        <div className="flex-1 bg-[#D9D9D9] rounded-lg" />
        <div className="flex-1 bg-[#D9D9D9] rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Safe number formatter ────────────────────────────────────────────────────
const safeNum = (v: unknown): number => {
  const n = Number(v);
  return isFinite(n) ? n : 0;
};
const safeFmt = (v: unknown): string => safeNum(v).toLocaleString();

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const Dashboard = () => {
  const [data, setData]     = useState<typeof INITIAL_DATA>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/dashboard');

        // Safe extraction with fallbacks at every level
        const resData = res?.data ?? {};
        const rawStats = resData?.stats ?? {};
        const rawTrend: any[] = Array.isArray(resData?.bookingTrend) ? resData.bookingTrend : [];
        const rawRevenue: any[] = Array.isArray(resData?.revenueTrend) ? resData.revenueTrend : [];
        const rawDist: any[] = Array.isArray(resData?.serviceDistribution) ? resData.serviceDistribution : [];
        const rawCity: any[] = Array.isArray(resData?.cityStats) ? resData.cityStats : [];
        const rawBookings: any[] = Array.isArray(resData?.recentBookings) ? resData.recentBookings : [];
        const rawWorkers: any[] = Array.isArray(resData?.workerRequests) ? resData.workerRequests : [];
        const rawComplaints: any[] = Array.isArray(resData?.complaints) ? resData.complaints : [];

        const totalBookings = safeNum(rawStats?.totalBookings);

        setData({
          stats: {
            totalBookings,
            pendingBookings:    safeNum(rawStats?.pendingBookings),
            ongoingBookings:    safeNum(rawStats?.ongoingBookings),
            completedBookings:  safeNum(rawStats?.completedBookings),
            cancelledBookings:  safeNum(rawStats?.cancelledBookings),
            totalUsers:         safeNum(rawStats?.totalUsers),
            totalWorkers:       safeNum(rawStats?.totalWorkers),
            pendingVerification: safeNum(rawStats?.pendingVerification),
            todayRevenue:       safeNum(rawStats?.todayRevenue),
            totalRevenue:       safeNum(rawStats?.totalRevenue),
          },
          bookingTrend: rawTrend.map((d: any) => ({
            name:      d?.date      ?? '',
            Booking:   safeNum(d?.bookings),
            Completed: safeNum(d?.completed),
          })),
          revenueTrend: rawRevenue,
          serviceDistribution: rawDist,
          cityStats: rawCity.length
            ? rawCity.map((c: any) => ({
                city:     c?.city     ?? 'Unknown',
                bookings: safeNum(c?.bookings),
                percent:  Math.min(
                  totalBookings > 0 ? (safeNum(c?.bookings) / totalBookings) * 100 : 0,
                  100
                ),
                trend: 'Live',
              }))
            : INITIAL_DATA.cityStats,
          recentBookings: rawBookings,
          workerRequests: rawWorkers,
          complains:      rawComplaints,
        });
      } catch {
        // Keep safe empty state — do not crash
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data.stats;

  return (
    <div className="space-y-5">
      {/* Row 1 — Booking stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[14px]">
        <StatCard title="Total Booking"     value={safeFmt(stats.totalBookings)}     trend="12.5%" trendUp={true}  icon={FileText}   iconColor="bg-blue-50 text-blue-500" />
        <StatCard title="Panding Booking"   value={safeFmt(stats.pendingBookings)}   trend="12.5%" trendUp={true}  icon={Clock}      iconColor="bg-teal-50 text-teal-500" />
        <StatCard title="Ongoing Booking"   value={safeFmt(stats.ongoingBookings)}   trend="5.9%"  trendUp={true}  icon={Component}  iconColor="bg-yellow-50 text-yellow-500" />
        <StatCard title="Completed Booking" value={safeFmt(stats.completedBookings)} trend="7.26%" trendUp={true}  icon={CheckCircle} iconColor="bg-green-50 text-green-500" />
        <StatCard title="Cancelled Booking" value={safeFmt(stats.cancelledBookings)} trend="2.5%"  trendUp={false} icon={XCircle}    iconColor="bg-red-50 text-red-500" />
      </div>

      {/* Row 2 — Business stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[14px]">
        <StatCard title="Total Users"          value={safeFmt(stats.totalUsers)}          trend="12.5%" trendUp={true}  icon={Users}       iconColor="bg-[#E0F2F1] text-[#00897B]" />
        <StatCard title="Total Workers"        value={safeFmt(stats.totalWorkers)}        trend="12.5%" trendUp={true}  icon={Briefcase}   iconColor="bg-[#FCE4EC] text-[#D81B60]" />
        <StatCard title="Panding Verification" value={safeFmt(stats.pendingVerification)} trend="5.9%"  trendUp={true}  icon={ShieldAlert} iconColor="bg-[#E8EAF6] text-[#3F51B5]" />
        <StatCard title="Today's Revenue"      value={safeFmt(stats.todayRevenue)}        trend="7.26%" trendUp={true}  icon={BadgeDollarSign} iconColor="bg-[#E0F7FA] text-[#00BCD4]" />
        <StatCard title="Total Revenue"        value={safeFmt(stats.totalRevenue)}        trend="2.5%"  trendUp={false} icon={Wallet}      iconColor="bg-[#E8F5E9] text-[#4CAF50]" />
      </div>

      {/* Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Booking Trend */}
        <div className="col-span-1 border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft min-h-[320px]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-extrabold text-[14px] text-text-primary">Booking Trend</h3>
            <select className="text-[11px] border border-border rounded-lg px-2.5 py-1.5 outline-none text-text-secondary bg-white"><option>Last 7 days</option></select>
          </div>
          <BookingTrendChart data={data.bookingTrend} />
        </div>

        {/* Revenue Overview */}
        <div className="col-span-1 border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft min-h-[320px] flex items-end justify-between relative overflow-hidden">
          <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
            <div>
              <h3 className="font-extrabold text-[14px] text-text-primary mb-1">Revenue Overview</h3>
              <div className="flex items-center gap-2">
                <span className="text-[18px] leading-[20px] font-extrabold text-primary">
                  ₹{safeFmt(stats.totalRevenue)}
                </span>
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
              const amounts = data.revenueTrend.map((d: any) => safeNum(d?.amount));
              const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
              const heightPercent = maxAmount > 0 ? (safeNum(r?.amount) / maxAmount) * 100 : 0;
              return (
                <div
                  key={i}
                  className="w-full bg-[#1A73E8] rounded-t-sm transition-all hover:bg-blue-600 cursor-pointer group relative"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 transition-opacity">
                    ₹{safeNum(r?.amount).toLocaleString()}<br />{r?.date ?? ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-1 border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft min-h-[320px]">
          <h3 className="font-extrabold text-[14px] text-text-primary mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { icon: Plus,       color: 'bg-[#1A73E8]', text: 'Create Booking',    sub: 'Add new Booking manually' },
              { icon: Briefcase,  color: 'bg-primary',   text: 'Add Worker',        sub: 'Register a new worker' },
              { icon: ShieldAlert,color: 'bg-[#8E24AA]', text: 'Add Services',      sub: 'Create new services or category' },
              { icon: Bell,       color: 'bg-[#F26B4D]', text: 'Send Notification', sub: 'Send message to user or worker' },
            ].map((action, i) => (
              <button key={i} className="flex items-center justify-between group rounded-2xl px-2 py-2 hover:bg-gray-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`${action.color} p-[10px] rounded-[12px] text-white shadow-sm`}>
                    <action.icon className="w-[18px] h-[18px]" />
                  </div>
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

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Service wise booking */}
        <div className="border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft col-span-1">
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
            {(data.cityStats ?? []).map((c: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <p className="font-bold text-[13px]">{c?.city ?? 'Unknown'}</p>
                    <p className="text-[11px] text-text-secondary">{safeNum(c?.bookings)} Booking</p>
                  </div>
                  <span className="text-[10px] bg-[#E1F7E3] text-[#1E7145] px-[6px] py-[2px] rounded font-bold flex items-center gap-1">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    {c?.trend ?? '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#1A73E8] h-1.5 rounded-full" style={{ width: `${Math.min(safeNum(c?.percent), 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft col-span-1">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-extrabold text-[14px] text-text-primary">Recent Bookings</h3>
            <button className="text-primary text-[12px] font-bold hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {(data.recentBookings ?? []).length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">No recent bookings found.</div>
            ) : (data.recentBookings ?? []).map((b: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img
                    src={b?.user?.avatar || `https://i.pravatar.cc/150?img=${i + 20}`}
                    className="w-9 h-9 rounded-full border border-gray-200"
                    alt="user"
                    onError={e => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?img=${i + 20}`; }}
                  />
                  <div className="leading-tight">
                    <p className="font-bold text-[13px] flex items-center gap-2">
                      {b?.bookingId ?? `#BK-00${i}`}
                      <span className="text-text-primary/70 font-semibold">{b?.user?.name ?? 'Unknown'}</span>
                    </p>
                    <p className="text-[11px] text-text-secondary">{b?.service?.name ?? ''}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] px-2 py-[2px] rounded uppercase font-bold tracking-wide ${b?.status === 'Completed' ? 'bg-[#C8E6C9] text-[#388E3C]' : 'bg-[#E1F5FE] text-[#0288D1]'}`}>
                    {b?.status ?? 'Pending'}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {b?.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worker requests + Complaints */}
        <div className="col-span-1 flex flex-col gap-5">
          <div className="border border-border bg-white rounded-[22px] px-5 py-5 shadow-soft flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-[14px] text-text-primary">New worker requests</h3>
              <button className="text-primary text-[12px] font-bold hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-3">
              {(data.workerRequests ?? []).length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-4">No pending worker requests.</div>
              ) : (data.workerRequests ?? []).map((w: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={w?.user?.avatar || `https://i.pravatar.cc/150?img=${i + 40}`}
                      className="w-9 h-9 rounded-full border border-gray-200"
                      alt="worker"
                      onError={e => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?img=${i + 40}`; }}
                    />
                    <div className="leading-tight">
                      <p className="font-bold text-[13px]">{w?.user?.name ?? 'Worker'}</p>
                      <p className="text-[11px] text-text-primary/80">{w?.location?.city ?? 'Location N/A'}</p>
                      <p className="text-[10px] text-text-secondary">
                        Applied {w?.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                      </p>
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
              {(data.complains ?? []).length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-4">No open complaints found.</div>
              ) : (data.complains ?? []).map((c: any, i: number) => (
                <div key={i} className="flex items-start gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="mt-1"><Lock className="w-[18px] h-[18px] text-gray-500" /></div>
                  <div className="leading-tight">
                    <p className="font-bold text-[13px] mb-0.5">{c?.ticketId ?? `#TKT-00${i}`}</p>
                    <p className="text-[11px] text-text-secondary">{c?.subject ?? ''}</p>
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
