import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Image as ImageIcon, Plus, Search, Pencil, Eye, Trash2, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import api, { extractApiData, extractApiPagination, normalizeApiError } from '../services/api';
import { getApiV1BaseUrl } from '../config/apiBase';

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

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    placement: 'Home' as Banner['placement'],
    imageUrl: '',
    active: true,
  });

  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    const t = setTimeout(() => fetchBanners(), 300);
    return () => clearTimeout(t);
  }, [fetchBanners]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = ev => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Clear manual URL when file is selected
    setForm(f => ({ ...f, imageUrl: '' }));
  };

  const clearFile = () => {
    setUploadFile(null);
    setUploadPreview(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    try {
      setSaving(true);
      setFormError(null);

      let finalImageUrl = form.imageUrl.trim() || undefined;

      // Upload file first if one is selected
      if (uploadFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', uploadFile);
        const uploadRes: any = await api.post('/upload?folder=banners', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadData = extractApiData<{ url: string }>(uploadRes, { url: '' } as any);
        finalImageUrl = uploadData.url || undefined;
        setUploading(false);
      }

      const payload = {
        title: form.title,
        placement: form.placement,
        imageUrl: finalImageUrl,
        status: form.active ? 'active' : 'inactive',
      };

      if (editingId) {
        await api.put(`/banners/${editingId}`, payload);
      } else {
        await api.post('/banners', payload);
      }

      setFormOpen(false);
      clearFile();
      fetchBanners();
    } catch (e: any) {
      setUploading(false);
      setFormError(normalizeApiError(e, 'Failed to save banner'));
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', placement: 'Home', imageUrl: '', active: true });
    clearFile();
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditingId(b._id);
    setForm({ title: b.title, placement: b.placement, imageUrl: b.imageUrl ?? '', active: b.status === 'active' });
    clearFile();
    setFormError(null);
    setFormOpen(true);
  };

  // Resolve image URL — handle both absolute URLs and relative /uploads paths
  const resolveImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Relative path from backend static serving
    const base = getApiV1BaseUrl().replace('/api/v1', '');
    return `${base}${url}`;
  };

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

        <Button className="w-full sm:w-auto" onClick={openCreate}>
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
              <Button variant="ghost" onClick={() => { setFormOpen(false); clearFile(); }}>
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Summer Offer Hero"
              />

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">Placement</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-text-primary border-border"
                  value={form.placement}
                  onChange={e => setForm(f => ({ ...f, placement: e.target.value as Banner['placement'] }))}
                >
                  <option value="Home">Home</option>
                  <option value="Bookings">Bookings</option>
                  <option value="Offers">Offers</option>
                  <option value="Dashboard">Dashboard</option>
                </select>
              </div>

              {/* Image Upload Section */}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Banner Image</label>

                {/* File upload area */}
                <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-3 bg-gray-50/50">
                  {uploadPreview ? (
                    <div className="relative w-full">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="w-full h-36 object-cover rounded-xl border border-border"
                      />
                      <button
                        onClick={clearFile}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-border hover:bg-red-50"
                      >
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </button>
                      <p className="text-xs text-text-secondary mt-1 text-center">{uploadFile?.name}</p>
                    </div>
                  ) : form.imageUrl && resolveImageUrl(form.imageUrl) ? (
                    <div className="relative w-full">
                      <img
                        src={resolveImageUrl(form.imageUrl)!}
                        alt="Current"
                        className="w-full h-36 object-cover rounded-xl border border-border"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <p className="text-xs text-text-secondary mt-1 text-center">Current image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Upload className="w-8 h-8 text-text-secondary" />
                      <p className="text-sm text-text-secondary">Drop an image or click to upload</p>
                      <p className="text-xs text-text-secondary">JPEG, PNG, WebP — max 5 MB</p>
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-text-primary hover:bg-gray-50 transition">
                      <Upload className="w-4 h-4" />
                      {uploadFile ? 'Change file' : 'Choose file'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {/* OR manual URL */}
                {!uploadFile && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-text-secondary">or paste URL</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                {!uploadFile && (
                  <Input
                    value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://.../banner.png"
                  />
                )}
              </div>

              <div className="w-full flex items-center gap-3 sm:col-span-1">
                <input
                  id="banner-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                />
                <label htmlFor="banner-active" className="text-sm font-semibold text-text-primary">
                  Active
                </label>
              </div>
            </div>

            {formError && (
              <p className="mt-3 text-[12px] text-red-600 font-semibold">{formError}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saving || uploading}
              >
                {uploading ? 'Uploading…' : saving ? 'Saving…' : editingId ? 'Save changes' : 'Create'}
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
              onChange={e => setQuery(e.target.value)}
              placeholder="Search banners…"
              className="w-full"
            />
          </div>
          <div className="text-xs text-text-secondary">{banners.length} banner(s)</div>
        </div>

        {error && <div className="mt-4 text-sm text-red-600 font-semibold">{error}</div>}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {banners.map(b => {
            const imgSrc = resolveImageUrl(b.imageUrl);
            return (
              <div key={b._id} className="border border-border rounded-2xl overflow-hidden bg-white shadow-soft">
                <div className="h-36 bg-gradient-to-br from-[#0EA5A4]/25 via-[#6CC8C6]/25 to-[#FACC15]/25 flex items-center justify-center relative overflow-hidden">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-text-secondary" />
                  )}
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

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(b)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const url = resolveImageUrl(b.imageUrl);
                        if (url) window.open(url, '_blank', 'noopener,noreferrer');
                        else alert('No banner image available');
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
                        if (!confirm(`Deactivate banner "${b.title}"?`)) return;
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
            );
          })}
          {!loading && banners.length === 0 && (
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
              disabled={page === totalPages || totalPages === 0}
              className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#111827] px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
