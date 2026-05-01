import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { ChevronLeft, ChevronRight, Filter, Edit } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

export const Workers = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/workers?page=${page}&limit=${limit}&search=${search}`);
      const data = res.data || res;
      setWorkers(data.workers || (Array.isArray(data) ? data : []));
      setTotalPages(res.pagination?.totalPages || data.pagination?.totalPages || data.totalPages || 1);
    } catch (err) {
      console.warn('Failed to fetch workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchWorkers(), 300);
    return () => clearTimeout(timer);
  }, [fetchWorkers]);

  return (
    <div className="space-y-5">
      <div className="bg-white px-5 py-5 sm:px-6 sm:py-6 rounded-[22px] shadow-soft border border-border min-h-[520px]">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-center mb-5 gap-3">
          <div className="relative w-full md:w-[320px]">
            <input 
              type="text" 
              placeholder="Search worker..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-4 pr-10 py-3 min-h-[44px] w-full border border-border rounded-xl text-[13px] outline-none focus:border-primary transition-colors bg-[#FAFAFA]"
            />
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3 min-h-[44px] bg-[#FAFAFA] w-full md:w-[200px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <select className="bg-transparent outline-none text-[13px] text-[#6B7280] w-full indent-1">
              <option>All Ratings</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-2"><TableSkeleton columns={8} rows={6} /></div>
        ) : (
          <div className="overflow-x-auto w-full border border-border rounded-[14px]">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="border-b border-border bg-[#F3F4F6]/70 text-[#6B7280] text-[12px] font-medium tracking-wide">
                  <th className="py-4 font-bold px-5">Name</th>
                  <th className="py-4 font-bold px-5">Email</th>
                  <th className="py-4 font-bold px-5 hidden sm:table-cell">Phone</th>
                  <th className="py-4 font-bold px-5">Rating</th>
                  <th className="py-4 font-bold px-5">Earnings</th>
                  <th className="py-4 font-bold px-5 hidden md:table-cell">Address</th>
                  <th className="py-4 font-bold px-5">Status</th>
                  <th className="py-4 font-bold px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {workers && workers.length > 0 ? workers.map((item, index) => {
                  return (
                    <tr key={item._id || index} className="border-b border-border/60 hover:bg-gray-50/50 transition border-opacity-50">
                      <td className="py-4 px-5 flex items-center gap-3">
                        <img src={item.user?.avatar || `https://i.pravatar.cc/150?img=${(index % 70) + 1}`} className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-100" />
                        <div className="flex flex-col">
                          <span className="font-bold text-[#111827] text-[14px]">{item.user?.name || "Unknown"}</span>
                          <span className="text-[#6B7280] text-[11px] capitalize">{item.user?.role || "Worker"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-[12px] text-[#6B7280]">{item.user?.email || "-"}</td>
                      <td className="py-4 px-5 text-[12px] text-[#6B7280] hidden sm:table-cell truncate max-w-[120px]">{item.user?.phoneNumber || "-"}</td>
                      <td className="py-4 px-5 text-[13px] text-[#6B7280] flex items-center gap-1 mt-1 font-bold"><span className="text-yellow-400">★</span> {item.rating || "New"}</td>
                      <td className="py-4 px-5 font-extrabold text-[13px] text-[#111827]">₹{item.totalEarnings || 0}</td>
                      <td className="py-4 px-5 text-[12px] text-[#6B7280] hidden md:table-cell truncate max-w-[180px]">{item.user?.address || "-"}</td>
                      <td className="py-4 px-5">
                        <span className={`px-3 py-1 rounded text-[11px] font-bold ${
                          item.verificationStatus === 'verified' ? 'bg-[#E1F7E3] text-[#1E7145]' : 
                          item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.verificationStatus ? item.verificationStatus.charAt(0).toUpperCase() + item.verificationStatus.slice(1) : "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button className="flex items-center justify-center gap-2 text-[#111827] bg-white border border-border px-4 py-2 min-h-[44px] rounded-xl text-[12px] font-extrabold hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)] mx-auto">
                          <Edit className="w-4 h-4 text-primary" /> Edit
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-500 text-sm">No workers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-5">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#111827] px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4"/> Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs transition ${
                  page === i + 1 
                    ? 'border border-[#E5E7EB] text-[#111827] font-bold bg-gray-50 shadow-sm' 
                    : 'text-[#6B7280] hover:bg-gray-50 border border-transparent hover:border-[#E5E7EB]'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#111827] px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
