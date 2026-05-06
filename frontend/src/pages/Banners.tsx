import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Image as ImageIcon, Plus, Search, Pencil, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { extractApiData, extractApiPagination, normalizeApiError } from '../services/api';

type Banner = {
  _id: string;
  title: string;
  placement: 'Home' | 'Bookings' | 'Offers' | 'Dashboard';
  imageUrl?: string;
  status: 'active' | 'inactive' | 'expired';
};

export const Banners = () => {
  const [query, setQuery] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  // Inline admin form to keep UI stable (no modal redesign)
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    placement: 'Home' as Banner['placement'],
    imageUrl: '',
    active: true
  });

  const fetchBanners = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const envelope = await api.get('/banners', { params: { page, limit, search: query } });
      const data = extractApiData<{ banners: Banner[] }>(envelope, { banners: [] } as any);
      setBanners(data.banners ?? []);

      const pagination = extractApiPagination(envelope);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (e: any) {
      setError(normalizeApiError(e, 'Failed to fetch banners'));
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchBanners();
    }, 300);
    return () => clearTimeout(t);
  }, [fetchBanners]);

  const filtered = banners; // server-side search

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Marketing</p>
            <h3 className="text-lg font-bold text-text-primary">Banners</h3>
          </div>
        </div>

        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setEditingId(null);
            setForm({
              title: '',
              placement: 'Home',
              imageUrl: '',
              active: true
            });
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add banner
        </Button>
      </div>

      <Card className="p-5">
        {formOpen && (
          <div className="mb-6 border border-border rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {editingId ? 'Edit banner' : 'Create banner'}
                </p>
                <p className="text-xs text-text-secondary">Manage banner details</p>
              </div>
              <Button variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Summer Offer Hero"
              />

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">Placement</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-text-primary border-border"
                  value={form.placement}
                  onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value as Banner['placement'] }))}
                >
                  <option value="Home">Home</option>
                  <option value="Bookings">Bookings</option>
                  <option value="Offers">Offers</option>
                  <option value="Dashboard">Dashboard</option>
                </select>
              </div>

              <Input
                label="Image URL (optional)"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://.../banner.png"
              />

              <div className="w-full flex items-center gap-3 sm:col-span-1">
                <input
                  id="banner-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                <label htmlFor="banner-active" className="text-sm font-semibold text-text-primary">
                  Active
                </label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <Button
                onClick={async () => {
                  if (!form.title.trim()) {
                    alert('Title is required');
                    return;
                  }

                  const payload = {
                    title: form.title,
                    placement: form.placement,
                    imageUrl: form.imageUrl.trim() ? form.imageUrl.trim() : undefined,
                    status: form.active ? 'active' : 'inactive'
                  };

                  if (editingId) {
                    await api.put(`/banners/${editingId}`, payload);
                  } else {
                    await api.post('/banners', payload);
                  }

                  setFormOpen(false);
                  fetchBanners();
                }}
              >
                {editingId ? 'Save changes' : 'Create'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-full sm:max-w-md">
            <div className="text-text-secondary">
              <Search className="w-4 h-4" />
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search banners…"
              className="w-full"
            />
          </div>
          <div className="text-xs text-text-secondary">{filtered.length} banner(s)</div>
        </div>

        {error && <div className="mt-4 text-sm text-red-600 font-semibold">{error}</div>}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div key={b._id} className="border border-border rounded-2xl overflow-hidden bg-white shadow-soft">
              <div className="h-36 bg-gradient-to-br from-[#0EA5A4]/25 via-[#6CC8C6]/25 to-[#FACC15]/25 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-text-secondary" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="leading-tight">
                    <p className="font-bold text-text-primary">{b.title}</p>
                    <p className="text-sm text-text-secondary mt-1">Placement: {b.placement}</p>
                  </div>
                  <Badge variant={b.status === 'active' ? 'success' : 'default'}>
                    {b.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {b.imageUrl ? (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="mt-3 w-full h-28 object-cover rounded-xl border border-border/60"
                    loading="lazy"
                  />
                ) : null}

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingId(b._id);
                      setForm({
                        title: b.title,
                        placement: b.placement,
                        imageUrl: b.imageUrl ?? '',
                        active: b.status === 'active'
                      });
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (b.imageUrl) window.open(b.imageUrl, '_blank', 'noopener,noreferrer');
                      else alert('No banner image URL available');
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={async () => {
                      if (!confirm(`Deactivate banner ${b.title}?`)) return;
                      await api.delete(`/banners/${b._id}`);
                      fetchBanners();
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-text-secondary py-12 border border-border rounded-2xl md:col-span-2 xl:col-span-3">
              No banners found.
            </div>
          )}
        </div>

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
              disabled={page === totalPages || totalPages === 0}
              className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#111827] px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

