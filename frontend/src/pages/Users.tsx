import React, { useEffect, useState, useCallback } from 'react';
import api, { extractApiData, extractApiPagination, normalizeApiError } from '../services/api';
import { ChevronLeft, ChevronRight, Filter, Edit, Plus, Trash2, X } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

type UserForm = {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  address: string;
  avatar: string;
};

const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  phoneNumber: '',
  role: 'user',
  status: 'active',
  address: '',
  avatar: '',
};

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const envelope: any = await api.get(`/users?page=${page}&limit=${limit}&search=${search}`);
      const data = extractApiData<{ users: any[] }>(envelope, { users: [] } as any);
      setUsers(data.users ?? []);
      const pagination = extractApiPagination(envelope);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (err) {
      console.warn('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingId(user._id);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'user',
      status: user.status || 'active',
      address: user.address || '',
      avatar: user.avatar || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    try {
      setSaving(true);
      setFormError(null);
      const payload: any = {
        name: form.name,
        role: form.role,
        status: form.status,
      };
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.phoneNumber.trim()) payload.phoneNumber = form.phoneNumber.trim();
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.avatar.trim()) payload.avatar = form.avatar.trim();

      if (editingId) {
        await api.patch(`/users/${editingId}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (e: any) {
      setFormError(normalizeApiError(e, 'Failed to save user'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/users/${deleteId}`);
      setDeleteId(null);
      fetchUsers();
    } catch (e: any) {
      alert(normalizeApiError(e, 'Failed to delete user'));
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (user: any) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await api.patch(`/users/${user._id}`, { status: newStatus });
      fetchUsers();
    } catch (e: any) {
      alert(normalizeApiError(e, 'Failed to update status'));
    }
  };

  return (
    <div className="space-y-5">
      {/* User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-lg p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-[16px] font-bold text-[#111827] mb-1">
              {editingId ? 'Edit User' : 'Create User'}
            </h3>
            <p className="text-[12px] text-[#6B7280] mb-5">
              {editingId ? 'Update user details below.' : 'Fill in the details to create a new user.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="John Doe"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Phone</label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="+91 9876543210"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4] bg-white"
                >
                  <option value="user">User</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4] bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="City, State"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[12px] font-semibold text-[#374151]">Avatar URL (optional)</label>
                <input
                  type="text"
                  value={form.avatar}
                  onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                  placeholder="https://..."
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
            </div>

            {formError && (
              <p className="mt-3 text-[12px] text-red-600 font-semibold">{formError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] font-bold text-[#374151] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-[#0EA5A4] text-white rounded-xl text-[13px] font-bold hover:bg-teal-700 disabled:opacity-60 transition"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-[16px] font-bold text-[#111827] mb-2">Delete User</h3>
            <p className="text-[13px] text-[#6B7280] mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] font-bold text-[#374151] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-[13px] font-bold hover:bg-red-700 disabled:opacity-60 transition"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white px-5 py-5 sm:px-6 sm:py-6 rounded-[22px] shadow-soft border border-border min-h-[520px]">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-center mb-5 gap-3">
          <div className="relative w-full md:w-[320px]">
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-4 pr-10 py-3 min-h-[44px] w-full border border-border rounded-xl text-[13px] outline-none focus:border-primary transition-colors bg-[#FAFAFA]"
            />
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" />
          </div>

          <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3 min-h-[44px] bg-[#FAFAFA] w-full md:w-[200px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <select className="bg-transparent outline-none text-[13px] text-[#6B7280] w-full indent-1">
              <option>All Categories</option>
            </select>
          </div>

          <button
            onClick={openCreate}
            className="ml-auto flex items-center gap-2 bg-[#0EA5A4] text-white px-5 py-3 min-h-[44px] rounded-xl text-[13px] font-bold hover:bg-teal-700 transition shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
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
                  <th className="py-4 font-bold px-5">Bookings</th>
                  <th className="py-4 font-bold px-5">Spend</th>
                  <th className="py-4 font-bold px-5 hidden md:table-cell">Address</th>
                  <th className="py-4 font-bold px-5">Status</th>
                  <th className="py-4 font-bold px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? users.map((item, index) => (
                  <tr key={item._id || index} className="border-b border-border/60 hover:bg-gray-50/50 transition border-opacity-50">
                    <td className="py-4 px-5 flex items-center gap-3">
                      <img
                        src={item.avatar || `https://i.pravatar.cc/150?img=${(index % 70) + 1}`}
                        className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-100"
                        alt="avatar"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111827] text-[14px]">{item.name || 'Unknown'}</span>
                        <span className="text-[#6B7280] text-[11px] capitalize">{item.role || 'User'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[12px] text-[#6B7280]">{item.email || '-'}</td>
                    <td className="py-4 px-5 text-[12px] text-[#6B7280] hidden sm:table-cell truncate max-w-[120px]">{item.phoneNumber || '-'}</td>
                    <td className="py-4 px-5 text-[13px] text-[#6B7280]">{item.bookingsCount || 0}</td>
                    <td className="py-4 px-5 font-extrabold text-[13px] text-[#111827]">₹{item.totalSpend || 0}</td>
                    <td className="py-4 px-5 text-[12px] text-[#6B7280] hidden md:table-cell truncate max-w-[180px]">{item.address || '-'}</td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleStatusToggle(item)}
                        className={`px-3 py-1 rounded text-[11px] font-bold transition ${
                          item.status === 'active' ? 'bg-[#E1F7E3] text-[#1E7145] hover:bg-green-200' :
                          item.status === 'suspended' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                          'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={item.status === 'suspended' ? 'Click to activate' : 'Click to suspend'}
                      >
                        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active'}
                      </button>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="flex items-center justify-center gap-2 text-[#111827] bg-white border border-border px-3 py-2 min-h-[36px] rounded-xl text-[12px] font-extrabold hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                        >
                          <Edit className="w-3.5 h-3.5 text-primary" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="flex items-center justify-center bg-red-50 border border-red-100 px-3 py-2 min-h-[36px] rounded-xl text-red-500 hover:bg-red-100 transition shadow-sm"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-500 text-sm">No users found</td>
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
              <ChevronLeft className="w-4 h-4" /> Previous
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
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
