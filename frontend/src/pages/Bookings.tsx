import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { format } from 'date-fns';
import { Search, Loader2 } from 'lucide-react';

interface Booking {
  _id: string;
  bookingId: string;
  user: { name: string; email: string };
  worker?: { user: { name: string } };
  service: { name: string };
  date: string;
  status: string;
  address: string;
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
      setBookings(res.data.bookings);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[500px]">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Booking Management</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Booking ID..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm outline-none focus:border-primary transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-white">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">
            No bookings found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 font-medium px-4">Booking ID</th>
                  <th className="pb-3 font-medium px-4">Client Name</th>
                  <th className="pb-3 font-medium px-4">Details</th>
                  <th className="pb-3 font-medium px-4">Date & Time</th>
                  <th className="pb-3 font-medium px-4">Worker</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="py-4 px-4 font-medium text-primary">#{booking.bookingId}</td>
                    <td className="py-4 px-4">
                      {booking.user?.name || 'Unknown'}
                    </td>
                    <td className="py-4 px-4">{booking.service?.name}</td>
                    <td className="py-4 px-4 text-gray-500">
                      {format(new Date(booking.date), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="py-4 px-4">
                      {booking.worker ? booking.worker.user.name : <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-4 px-4 text-center">
                       <button className="text-sm border border-gray-200 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                         View
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Dummy implementation */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-end items-center mt-6 gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 text-sm"
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
