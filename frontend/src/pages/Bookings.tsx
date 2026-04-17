import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { format } from 'date-fns';
import { Search, Loader2 } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

interface Booking {
  _id: string;
  bookingId: string;
  user: { name: string; email: string, avatar?: string };
  worker?: { user: { name: string } };
  service: { name: string };
  date: string;
  status: string;
  address: string;
  paymentStatus?: string;
}



export const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Example of debouncing search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Calls standard GET /bookings built in phase 6
      const res: any = await api.get('/bookings', {
        params: { page, limit: 10, search: debouncedSearch }
      });
      setBookings(res.data?.bookings || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err: any) {
      setError("Failed to fetch bookings.");
      setBookings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const renderStatus = (status: string) => {
    let lower = status.toLowerCase();
    let bg = 'bg-[#E1F7E3] text-[#1E7145]'; // Complete/Confirmed
    if (lower === 'pending') bg = 'bg-[#FFF4D2] text-[#B88700]';
    if (lower === 'cancelled') bg = 'bg-[#FEE2E2] text-[#DC2626]';
    if (lower === 'complete') bg = 'bg-[#3730A3] text-white'; // Indigo/Deep blue match

    return (
      <span className={`px-4 py-[6px] rounded-md text-xs font-bold ${bg}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border min-h-[500px]">
        {/* Header Controls (Filters) */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select className="border border-border rounded-lg px-4 py-[10px] text-[13px] text-text-secondary outline-none bg-white w-40">
            <option>Filter by Status</option>
          </select>
          <select className="border border-border rounded-lg px-4 py-[10px] text-[13px] text-text-secondary outline-none bg-white w-40">
            <option>Filter by Services</option>
          </select>
          <select className="border border-border rounded-lg px-4 py-[10px] text-[13px] text-text-secondary outline-none bg-white w-40">
            <option>Filter by Date</option>
          </select>
          <select className="border border-border rounded-lg px-4 py-[10px] text-[13px] text-text-secondary outline-none bg-white w-40">
            <option>Filter by Time</option>
          </select>
          <select className="border border-border rounded-lg px-4 py-[10px] text-[13px] text-text-secondary outline-none bg-white w-40">
            <option>All Services</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search here" 
              className="pl-4 pr-10 py-[10px] w-full border border-border rounded-lg text-[13px] outline-none focus:border-primary transition-colors text-text-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bg-primary text-white text-[13px] font-bold px-6 py-[10px] rounded-lg hover:bg-primary-dark transition-colors">
            Apply Filter
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-2">
             <TableSkeleton columns={7} rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[12px] border border-border">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#E5E7EB]/50">
                <tr className="text-text-primary text-[13px]">
                  <th className="py-4 px-6 font-bold">Booking ID</th>
                  <th className="py-4 px-6 font-bold">Guest Name</th>
                  <th className="py-4 px-6 font-bold">Service</th>
                  <th className="py-4 px-6 font-bold">Date & Time</th>
                  <th className="py-4 px-6 font-bold">Payment</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      {error ? <span className="text-red-500">{error}</span> : "No bookings found."}
                    </td>
                  </tr>
                ) : bookings.map((booking, idx) => (
                  <tr key={booking._id || idx} className="border-b border-border/60 hover:bg-gray-50/50 transition-colors text-[14px]">
                    <td className="py-4 px-6 font-bold text-primary">#{booking.bookingId}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={booking.user?.avatar || `https://i.pravatar.cc/150?img=${idx % 70}`} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200" />
                        <span className="font-bold text-text-primary">{booking.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-text-primary">{booking.service?.name}</td>
                    <td className="py-4 px-6 font-bold text-text-primary">
                      {format(new Date(booking.date), 'MMM, dd, yyyy | h:mm a')}
                    </td>
                    <td className="py-4 px-6 font-bold text-text-primary">
                      {booking.paymentStatus || 'Paid'}
                    </td>
                    <td className="py-4 px-6">
                      {renderStatus(booking.status)}
                    </td>
                    <td className="py-4 px-6">
                       <button className="flex items-center gap-2 text-[13px] border border-border text-text-primary font-bold px-4 py-[6px] rounded-lg hover:bg-gray-50 transition-colors shadow-sm bg-white">
                         Edit 
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Matches Figma exact style */}
        {!loading && (
          <div className="flex items-center mt-6 gap-2">
            <button disabled className="flex items-center text-text-secondary text-[13px] font-bold gap-1 mr-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map(p => (
                <button key={p} className={`w-8 h-8 rounded border text-[13px] font-bold flex items-center justify-center ${page === p ? 'border-primary text-primary' : 'border-border text-text-secondary hover:border-gray-300'}`}>
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center text-text-primary text-[13px] font-bold gap-1 ml-2 border border-border px-3 py-1 rounded">
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
