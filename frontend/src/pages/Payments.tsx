import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/Skeleton';

interface PaymentData {
  _id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId?: string;
  createdAt: string;
  user: { name: string; email: string };
  booking: { bookingId: string };
}

export const Payments = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res: any = await api.get('/payments', { params });
      setPayments(res.data.payments);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Payment History</h2>
          <select 
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {loading ? (
          <div className="py-2"><TableSkeleton columns={7} rows={6} /></div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
        ) : payments.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 font-medium px-4">Trx ID</th>
                  <th className="pb-3 font-medium px-4">Date</th>
                  <th className="pb-3 font-medium px-4">Client</th>
                  <th className="pb-3 font-medium px-4">Booking Ref</th>
                  <th className="pb-3 font-medium px-4">Amount</th>
                  <th className="pb-3 font-medium px-4">Method</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{p.transactionId || p.paymentId}</td>
                    <td className="py-4 px-4 text-gray-500">{format(new Date(p.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                    <td className="py-4 px-4">{p.user?.name || 'Unknown'}</td>
                    <td className="py-4 px-4 text-primary">#{p.booking?.bookingId}</td>
                    <td className="py-4 px-4 font-bold">₹{p.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-500 font-medium">{p.method}</td>
                    <td className="py-4 px-4"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-end items-center mt-6 gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 text-sm">Prev</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 text-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
