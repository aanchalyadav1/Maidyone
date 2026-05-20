import React, { useState, useEffect, useCallback } from 'react';
import api, { extractApiData, extractApiPagination } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Calendar, XCircle, CheckCircle2, RefreshCcw, Wallet } from 'lucide-react';

export const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Dynamic stats
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayout: 0,
    totalRefunded: 0,
    totalFailed: 0,
    thisMonthEarnings: 0,
  });
  const [earningsTrend, setEarningsTrend] = useState<any[]>([]);

  // Fetch payment stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const envelope: any = await api.get('/payments/stats');
      const data = extractApiData<any>(envelope, {});
      setStats({
        totalEarnings: data.totalEarnings || 0,
        pendingPayout: data.pendingPayout || 0,
        totalRefunded: data.totalRefunded || 0,
        totalFailed: data.totalFailed || 0,
        thisMonthEarnings: data.thisMonthEarnings || 0,
      });
      setEarningsTrend(data.earningsTrend || []);
    } catch (err) {
      console.warn('Failed to fetch payment stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const envelope: any = await api.get(`/payments?page=${page}&limit=5&search=${search}`);
      const data = extractApiData<{ payments: any[] }>(envelope, { payments: [] } as any);
      setPayments(data.payments ?? []);
      const pagination = extractApiPagination(envelope);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (err) {
      console.warn('Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPayments(), 300);
    return () => clearTimeout(timer);
  }, [fetchPayments]);

  const fmt = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : n >= 1000
      ? `₹${(n / 1000).toFixed(1)}K`
      : `₹${n.toLocaleString()}`;

  return (
    <div className="space-y-6">

      {/* 5 Top Stat Cards — fully dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Earnings"
          value={statsLoading ? '…' : fmt(stats.totalEarnings)}
          trend="Live"
          trendUp={true}
          icon={Wallet}
          iconColor="bg-blue-50 text-blue-500"
        />
        <StatCard
          title="Pending Payout"
          value={statsLoading ? '…' : fmt(stats.pendingPayout)}
          trend="Live"
          trendUp={true}
          icon={RefreshCcw}
          iconColor="bg-teal-50 text-teal-500"
        />
        <StatCard
          title="This Month"
          value={statsLoading ? '…' : fmt(stats.thisMonthEarnings)}
          trend="Live"
          trendUp={true}
          icon={RefreshCcw}
          iconColor="bg-yellow-50 text-yellow-500"
        />
        <StatCard
          title="Refunded"
          value={statsLoading ? '…' : fmt(stats.totalRefunded)}
          trend="Live"
          trendUp={false}
          icon={CheckCircle2}
          iconColor="bg-green-50 text-green-500"
        />
        <StatCard
          title="Failed"
          value={statsLoading ? '…' : fmt(stats.totalFailed)}
          trend="Live"
          trendUp={false}
          icon={XCircle}
          iconColor="bg-red-50 text-red-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 w-full md:w-auto">
          <select className="border border-border rounded-lg px-4 py-2 text-[13px] text-gray-600 outline-none w-full md:w-[140px]">
            <option>This Week</option>
          </select>
          <div className="relative w-full md:w-[160px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="15 Mar, 2024" className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-[13px] outline-none" readOnly />
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select className="border border-border rounded-lg px-4 py-2 text-[13px] text-gray-600 outline-none w-full md:w-[160px]">
            <option>Filter by Type</option>
          </select>
          <div className="relative w-full md:w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search here"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-4 pr-9 py-2 border border-border rounded-lg text-[13px] outline-none"
            />
          </div>
          <button className="bg-[#1496A3] text-white font-bold text-[13px] px-6 py-2 min-h-[44px] rounded-lg hover:bg-teal-700 transition shrink-0">
            Apply Filter
          </button>
        </div>
      </div>

      {/* Chart and Payout Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Overview Chart — dynamic */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-[24px] border border-border p-6 shadow-sm min-h-[340px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[15px] text-[#111827]">Earnings Overview</h3>
            <select className="text-[11px] border border-border rounded px-3 py-1 outline-none text-[#6B7280]">
              <option>Last 30 days</option>
            </select>
          </div>

          <div className="w-full h-[240px]">
            {earningsTrend.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                No earnings data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, '']}
                  />
                  <Line type="monotone" dataKey="Earnings" stroke="#0EA5A4" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Payout" stroke="#1A73E8" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Payouts Cards */}
        <div className="col-span-1 bg-white rounded-[24px] border border-border p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-[15px] text-[#111827]">Recent Payouts</h3>

          <div className="flex flex-col gap-4 mt-6">
            <div className="bg-[#3D4ED9] text-white rounded-[16px] p-5 relative overflow-hidden h-[120px]">
              <div className="flex justify-between items-start">
                <span className="opacity-80">•••</span>
                <span className="font-extrabold italic text-sm">VISA</span>
              </div>
              <div className="mt-4">
                <p className="text-[9px] opacity-70 mb-0.5">Card Number</p>
                <p className="font-bold text-[13px] tracking-[4px]">•••• •••• 4321</p>
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                <div>
                  <p className="text-[9px] opacity-70">Card Holder</p>
                  <p className="font-bold text-[11px]">Mr. Raj</p>
                </div>
                <span className="text-[9px] font-bold opacity-70">08/24</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[16px] p-5 h-[120px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="font-extrabold italic text-blue-900 flex items-center gap-1 text-[13px]">
                  <span className="text-[#0EA5A4] italic font-extrabold text-[15px]">P</span> PayPal
                </span>
              </div>
              <div className="mt-1">
                <p className="text-[9px] text-[#6B7280]">Balance</p>
                <p className="font-extrabold text-[16px] text-[#111827]">
                  {fmt(stats.totalEarnings)} <span className="text-[11px] text-gray-400 font-normal">•••• 4921</span>
                </p>
              </div>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-[9px] text-[#6B7280]">Account</p>
                  <p className="font-bold text-[11px] text-[#111827]">Mr. Raj</p>
                </div>
                <span className="text-[10px] text-blue-600 font-bold cursor-pointer">Share</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 bg-[#6CC8C6] text-white font-bold text-[14px] py-3.5 min-h-[44px] rounded-[12px] hover:bg-teal-500 transition shadow-sm">
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Bottom Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-[24px] border border-border p-6 shadow-sm overflow-hidden flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[15px] text-[#111827]">Recent Transactions</h3>
            <button className="text-[11px] bg-gray-50 border border-border px-3 py-1.5 rounded text-[#6B7280]">This Week</button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[11px] text-[#6B7280] font-medium border-b border-gray-50 uppercase tracking-wide">
                  <th className="py-4 px-2">Payment ID</th>
                  <th className="py-4 px-2">User</th>
                  <th className="py-4 px-2 hidden sm:table-cell">Method</th>
                  <th className="py-4 px-2">Amount</th>
                  <th className="py-4 px-2 hidden md:table-cell">Date</th>
                  <th className="py-4 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {loading ? (
                  <tr><td colSpan={6} className="py-4 text-center text-gray-400">Loading…</td></tr>
                ) : payments && payments.length > 0 ? payments.map((item, index) => (
                  <tr key={item._id || index} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 px-2 font-bold text-[#0EA5A4]">{item.paymentId || 'PAY-NA'}</td>
                    <td className="py-4 px-2 flex items-center gap-2">
                      <img
                        src={item.user?.avatar || `https://i.pravatar.cc/150?img=${(index % 70) + 1}`}
                        className="w-6 h-6 rounded-full object-cover"
                        alt="user"
                      />
                      <span className="text-[#111827] font-medium truncate max-w-[100px]">{item.user?.name || 'Unknown'}</span>
                    </td>
                    <td className="py-4 px-2 text-[#6B7280] hidden sm:table-cell">{item.method || '—'}</td>
                    <td className="py-4 px-2 font-extrabold text-[#111827]">₹{item.amount || 0}</td>
                    <td className="py-4 px-2 text-[#6B7280] hidden md:table-cell">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        item.status === 'Completed' ? 'bg-[#E1F7E3] text-[#1E7145]' :
                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'Refunded' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-4 text-center text-gray-500">No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payouts Table */}
        <div className="bg-white rounded-[24px] border border-border p-6 shadow-sm overflow-hidden flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[15px] text-[#111827]">Recent Payouts</h3>
          </div>

          <div className="overflow-x-auto flex-1 w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[11px] text-[#6B7280] font-medium border-b border-gray-50 uppercase tracking-wide">
                  <th className="py-4 px-2">Worker</th>
                  <th className="py-4 px-2">Total Amount</th>
                  <th className="py-4 px-2 hidden sm:table-cell">Payout To</th>
                  <th className="py-4 px-2 hidden md:table-cell">Method</th>
                  <th className="py-4 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {loading ? (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-400">Loading…</td></tr>
                ) : payments && payments.length > 0 ? payments.map((item, index) => (
                  <tr key={item._id || index} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <img
                        src={item.user?.avatar || `https://i.pravatar.cc/150?img=${(index % 70) + 10}`}
                        className="w-6 h-6 rounded-full object-cover"
                        alt="user"
                      />
                      <span className="text-[#111827] font-medium text-[11px] max-w-[100px] truncate">{item.user?.name || 'Unknown'}</span>
                    </td>
                    <td className="py-3 px-2 font-extrabold text-[#0EA5A4] text-[11px]">₹{item.amount || 0}</td>
                    <td className="py-3 px-2 hidden sm:table-cell">
                      <div className="flex items-center gap-1 font-bold text-blue-900 text-[10px]">
                        {item.method === 'Card'
                          ? <span className="bg-blue-900 text-white px-1 text-[8px] rounded">VISA</span>
                          : <span className="text-blue-500 italic">P</span>}
                        {item.method === 'Card' ? '4321' : item.method || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-2 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="font-bold text-[9px] text-[#1A73E8]">{item.method || 'Card'}</span>
                        <span className="text-[8px] text-gray-400">Paid Method</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 w-max ${
                        item.status === 'Completed' ? 'text-[#1E7145] bg-[#E1F7E3]' : 'text-yellow-700 bg-yellow-100'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-500">No payouts found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-6 h-6 rounded border border-border flex items-center justify-center text-gray-400 text-xs hover:bg-gray-50 disabled:opacity-50"
              >‹</button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-6 h-6 rounded border border-border flex items-center justify-center text-xs transition ${
                    page === i + 1 ? 'bg-gray-50 font-bold text-[#111827]' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="w-6 h-6 rounded border border-border flex items-center justify-center text-[#111827] text-xs hover:bg-gray-50 drop-shadow-sm disabled:opacity-50"
              >›</button>
            </div>
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
