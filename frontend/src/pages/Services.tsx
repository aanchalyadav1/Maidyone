import React, { useEffect, useState, useCallback } from 'react';
import api, { extractApiData, extractApiPagination, normalizeApiError } from '../services/api';
import { ChevronLeft, ChevronRight, Filter, Edit, Plus, Trash2, X } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

type ServiceForm = {
  name: string;
  category: string;
  description: string;
  basePrice: string;
  icon: string;
  isActive: boolean;
};

const EMPTY_FORM: ServiceForm = {
  name: '',
  category: '',
  description: '',
  basePrice: '',
  icon: '',
  isActive: true,
};

export const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const envelope: any = await api.get(`/services?page=${page}&limit=${limit}&search=${search}`);
      const data = extractApiData<{ services: any[] }>(envelope, { services: [] } as any);
      setServices(data.services ?? []);
      const pagination = extractApiPagination(envelope);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (err) {
      console.warn('Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 300);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (service: any) => {
    setEditingId(service._id);
    setForm({
      name: service.name || '',
      category: service.category || '',
      description: service.description || '',
      basePrice: service.basePrice != null ? String(service.basePrice) : '',
      icon: service.icon || '',
      isActive: service.isActive !== false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Service name is required'); return; }
    if (!form.category.trim()) { setFormError('Category is required'); return; }
    const priceNum = parseFloat(form.basePrice);
    if (isNaN(priceNum) || priceNum < 0) { setFormError('Valid base price is required'); return; }

    try {
      setSaving(true);
      setFormError(null);
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        basePrice: priceNum,
        icon: form.icon.trim() || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await api.put(`/services/${editingId}`, payload);
      } else {
        await api.post('/services', payload);
      }
      setModalOpen(false);
      fetchServices();
    } catch (e: any) {
      setFormError(normalizeApiError(e, 'Failed to save service'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/services/${deleteId}`);
      setDeleteId(null);
      fetchServices();
    } catch (e: any) {
      alert(normalizeApiError(e, 'Failed to delete service'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Modal */}
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
              {editingId ? 'Edit Service' : 'Add Service'}
            </h3>
            <p className="text-[12px] text-[#6B7280] mb-5">
              {editingId ? 'Update service details below.' : 'Fill in the details to create a new service.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Service Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Home Deep Cleaning"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Category *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="Cleaning"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Base Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.basePrice}
                  onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                  placeholder="1500"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#374151]">Icon URL (optional)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="https://..."
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4]"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[12px] font-semibold text-[#374151]">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the service..."
                  rows={3}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4] resize-none"
                />
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  id="svc-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="svc-active" className="text-[13px] font-semibold text-[#374151]">
                  Active
                </label>
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
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Service'}
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
            <h3 className="text-[16px] font-bold text-[#111827] mb-2">Deactivate Service</h3>
            <p className="text-[13px] text-[#6B7280] mb-6">
              This will mark the service as inactive. It can be re-activated later.
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
                {deleting ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 text-left flex justify-between items-end">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827]">Services list</h2>
          <span className="text-[#6B7280] text-[12px]">Manage and view your services!</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1496A3] text-white px-5 py-2.5 min-h-[44px] rounded-xl text-[13px] font-bold hover:bg-teal-700 transition shadow-sm"
        >
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
              onChange={e => { setSearch(e.target.value); setPage(1); }}
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
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-[#6B7280] text-[12px] font-medium tracking-wide">
                  <th className="pb-4 font-bold px-4">Service Name</th>
                  <th className="pb-4 font-bold px-4 hidden sm:table-cell">Category</th>
                  <th className="pb-4 font-bold px-4">Base Price</th>
                  <th className="pb-4 font-bold px-4 hidden md:table-cell">Status</th>
                  <th className="pb-4 font-bold px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {services && services.length > 0 ? services.map((service, index) => (
                  <tr key={service._id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition border-opacity-50">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#0EA5A4] font-bold text-sm border border-gray-200">
                        {(service.name || 'S').charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111827] text-[14px]">{service.name || 'Unknown'}</span>
                        <span className="text-[#6B7280] text-[11px]">ID: #{service._id ? service._id.slice(-6).toUpperCase() : `SRV${index}`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[13px] font-medium text-[#111827] hidden sm:table-cell">{service.category || 'General'}</td>
                    <td className="py-3 px-4 font-extrabold text-[13px] text-[#111827]">₹{service.basePrice || 0}</td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`px-3 py-1 rounded text-[11px] font-bold ${service.isActive !== false ? 'bg-[#E1F7E3] text-[#1E7145]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                        {service.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(service)}
                          className="flex items-center justify-center gap-1 text-[#111827] bg-[#FAFAFA] border border-[#E5E7EB] px-4 py-2 min-h-[44px] rounded-lg text-[11px] font-bold hover:bg-white shadow-sm"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#0EA5A4]" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(service._id)}
                          className="flex items-center justify-center bg-[#FAFAFA] border border-red-100 px-4 py-2 min-h-[44px] rounded-lg text-red-500 hover:bg-red-50 transition shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
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
