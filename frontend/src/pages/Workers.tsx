import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Search, Loader2, Star, CheckCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface WorkerData {
  _id: string;
  user: {
    name: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    status: string;
  };
  skills: { name: string; category: string }[];
  isOnline: boolean;
  rating: number;
  totalJobs: number;
  verificationStatus: string;
  createdAt: string;
}

export const Workers = () => {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Debouncing Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const res: any = await api.get('/workers', { params });
      setWorkers(res.data.workers);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[500px]">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Worker list</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm outline-none focus:border-primary transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Content Area - Using Cards based on UI Request vs Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            {error}
          </div>
        ) : workers.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">
            No workers found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {workers.map((w) => (
              <div key={w._id} className="border border-gray-100 p-4 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    <img src={w.user?.avatar || `https://ui-avatars.com/api/?name=${w.user?.name}&background=random`} alt={w.user?.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                       {w.user?.name} 
                       {w.isOnline && <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>}
                       {w.isOnline && <span className="text-xs text-green-500 font-normal">Online</span>}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Joined {format(new Date(w.createdAt), 'MMM dd, yyyy')} • {w.user?.phoneNumber || 'No phone'}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                   {w.verificationStatus === 'verified' ? (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3"/> Verified
                      </span>
                   ) : (
                      <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded font-medium">Pending</span>
                   )}
                   <div className="flex gap-2 mt-2">
                      <button className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Message
                      </button>
                      <button className="bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                        Assign
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Implementation */}
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
