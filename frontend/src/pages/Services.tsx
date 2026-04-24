import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { ChevronLeft, ChevronRight, Filter, Edit, Plus, Trash2 } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

export const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/services?page=${page}&limit=${limit}&search=${search}`);
      const data = res.data || res;
      setServices(data.services || (Array.isArray(data) ? data : []));
      setTotalPages(res.pagination?.totalPages || data.totalPages || 1);
    } catch (err) {
      console.warn('Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  return (
    <div className="space-y-6">
      <div className="mb-4 text-left flex justify-between items-end">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827]">Services list</h2>
          <span className="text-[#6B7280] text-[12px]">Manage and view your services!</span>
        </div>
        <button className="flex items-center gap-2 bg-[#1496A3] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-teal-700 transition shadow-sm">
          <Plus className="w-[18px] h-[18px]" /> Add Service
        </button>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E5E7EB] min-h-[500px]">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-center mb-6 gap-4">
          <div className="relative w-full md:w-[320px]">
            <input 
              type="text" 
              placeholder="Search service..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-4 pr-10 py-2.5 w-full border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4] transition-colors bg-[#FAFAFA]"
            />
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-4 py-2.5 bg-[#FAFAFA] w-full md:w-[200px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <select className="bg-transparent outline-none text-[13px] text-[#6B7280] w-full indent-1">
              <option>All Services</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-2"><TableSkeleton columns={5} rows={6} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[#6B7280] text-[12px] font-medium tracking-wide">
                  <th className="pb-4 font-bold px-4">Service Name</th>
                  <th className="pb-4 font-bold px-4">Category</th>
                  <th className="pb-4 font-bold px-4">Base Price</th>
                  <th className="pb-4 font-bold px-4">Status</th>
                  <th className="pb-4 font-bold px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {services && services.length > 0 ? services.map((service, index) => {
                  return (
                    <tr key={service._id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition border-opacity-50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#0EA5A4] font-bold text-sm border border-gray-200">
                          {(service.name || 'S').charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#111827] text-[14px]">{service.name || "Unknown"}</span>
                          <span className="text-[#6B7280] text-[11px]">ID: #{service._id ? service._id.slice(-6).toUpperCase() : `SRV2${index}4`}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[13px] font-medium text-[#111827]">{service.category || "General"}</td>
                      <td className="py-3 px-4 font-extrabold text-[13px] text-[#111827]">₹{service.basePrice || service.price || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-[11px] font-bold ${service.isActive !== false ? 'bg-[#E1F7E3] text-[#1E7145]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                          {service.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <button className="flex items-center justify-center gap-1 text-[#111827] bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-white shadow-sm">
                             <Edit className="w-3.5 h-3.5 text-[#0EA5A4]" /> Edit
                           </button>
                           <button className="flex items-center justify-center bg-[#FAFAFA] border border-red-100 px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition shadow-sm">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500 text-sm">No services found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
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
