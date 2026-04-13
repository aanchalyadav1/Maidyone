import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Search, Loader2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '../components/common/StatusBadge';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  status: string;
  createdAt: string;
}

export const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Debouncing Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;

      const res: any = await api.get('/users', { params });
      setUsers(res.data.users);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[500px]">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Users list</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name, email, phone..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm outline-none focus:border-primary transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
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
        ) : users.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">
            No users found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 font-medium px-4">Name</th>
                  <th className="pb-3 font-medium px-4">Email</th>
                  <th className="pb-3 font-medium px-4">Role</th>
                  <th className="pb-3 font-medium px-4">Joined Date</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="py-4 px-4 font-medium text-gray-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="py-4 px-4 text-gray-500">{u.email || '-'}</td>
                    <td className="py-4 px-4 capitalize">{u.role}</td>
                    <td className="py-4 px-4 text-gray-500">
                      {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                       <button className="text-gray-400 hover:text-gray-600 transition-colors">
                         <MoreVertical className="w-5 h-5 inline" />
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
