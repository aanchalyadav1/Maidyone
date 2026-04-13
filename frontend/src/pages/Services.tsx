import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

interface ServiceData {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  isActive: boolean;
}

export const Services = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryFilter) params.category = categoryFilter;

      const res: any = await api.get('/services', { params });
      setServices(res.data.services);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices(); // Refresh list immediately
    } catch (err) {
      alert('Failed to deactivate service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Services Management</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search services..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm outline-none focus:border-primary transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
            </select>
            <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-2"><TableSkeleton columns={5} rows={5} /></div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
        ) : services.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">No services found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 font-medium px-4">Service Name</th>
                  <th className="pb-3 font-medium px-4">Category</th>
                  <th className="pb-3 font-medium px-4">Base Price</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id} className={`border-b border-gray-50 text-sm transition-colors ${!s.isActive ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50/50'}`}>
                    <td className="py-4 px-4 font-medium text-gray-800">{s.name}</td>
                    <td className="py-4 px-4 text-gray-500 font-medium">{s.category}</td>
                    <td className="py-4 px-4">₹{s.basePrice}</td>
                    <td className="py-4 px-4">
                       <span className={`px-2 py-1 rounded-full text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {s.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="py-4 px-4 text-center flex justify-center gap-2">
                       <button className="text-blue-500 hover:text-blue-700 p-1"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
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
