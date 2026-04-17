import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { ChevronLeft, ChevronRight, Filter, Edit } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

export const Workers = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/workers?limit=10');
      setWorkers(res.data.workers || []);
    } catch (err) {
      console.warn('Failed to fetch workers, using dummy UI');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return (
    <div className="space-y-6">
      <div className="mb-4 text-left">
        <h2 className="text-[20px] font-bold text-[#111827]">Worker list</h2>
        <span className="text-[#6B7280] text-[12px]">Manage and view your workers!</span>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E5E7EB] min-h-[500px]">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-center mb-6 gap-4">
          <div className="relative w-full md:w-[320px]">
            <input 
              type="text" 
              placeholder="Search worker..." 
              className="pl-4 pr-10 py-2.5 w-full border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4] transition-colors bg-[#FAFAFA]"
            />
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-4 py-2.5 bg-[#FAFAFA] w-full md:w-[200px]">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[#6B7280] text-[12px] font-medium tracking-wide">
                  <th className="pb-4 font-bold px-4">Name</th>
                  <th className="pb-4 font-bold px-4">Email</th>
                  <th className="pb-4 font-bold px-4">Phone</th>
                  <th className="pb-4 font-bold px-4">Rating</th>
                  <th className="pb-4 font-bold px-4">Earnings</th>
                  <th className="pb-4 font-bold px-4">Address</th>
                  <th className="pb-4 font-bold px-4">Status</th>
                  <th className="pb-4 font-bold px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5,6,7,8,9,10].map((item, index) => {
                  return (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition border-opacity-50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/150?img=${item + 40}`} className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-100" />
                        <div className="flex flex-col">
                          <span className="font-bold text-[#111827] text-[14px]">jhon smith</span>
                          <span className="text-[#6B7280] text-[11px]">Worker</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[#6B7280]">jhonsmith@gmail.com</td>
                      <td className="py-3 px-4 text-[12px] text-[#6B7280]">+1 8254 8520 25</td>
                      <td className="py-3 px-4 text-[13px] text-[#6B7280] flex items-center gap-1 mt-1 font-bold"><span className="text-yellow-400">★</span> 4.5</td>
                      <td className="py-3 px-4 font-extrabold text-[13px] text-[#111827]">₹42,500</td>
                      <td className="py-3 px-4 text-[12px] text-[#6B7280] truncate max-w-[150px]">xyz vijay nagar indore...</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded bg-[#E1F7E3] text-[#1E7145] text-[11px] font-bold">
                          Verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="flex items-center justify-center gap-1.5 text-[#111827] bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] mx-auto">
                          <Edit className="w-3.5 h-3.5 text-[#0EA5A4]" /> Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-1.5">
            <button className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#111827] px-2 py-1"><ChevronLeft className="w-4 h-4"/> Previous</button>
            <button className="w-7 h-7 rounded border border-[#E5E7EB] flex items-center justify-center text-[#111827] text-xs font-bold bg-gray-50 shadow-sm">1</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-[#6B7280] text-xs hover:bg-gray-50 border border-transparent hover:border-[#E5E7EB] transition">2</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-[#6B7280] text-xs hover:bg-gray-50 border border-transparent hover:border-[#E5E7EB] transition">3</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-[#6B7280] text-xs hover:bg-gray-50 border border-transparent hover:border-[#E5E7EB] transition">4</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-[#6B7280] text-xs hover:bg-gray-50 border border-transparent hover:border-[#E5E7EB] transition">5</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-[#6B7280] text-xs hover:bg-gray-50 border border-transparent hover:border-[#E5E7EB] transition">6</button>
            <button className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#111827] px-2 py-1">Next <ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </div>
  );
};
