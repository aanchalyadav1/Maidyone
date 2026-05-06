import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Plus, Search, Tag, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { extractApiData, extractApiPagination, normalizeApiError } from '../services/api';

type Coupon = {
  _id: string;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  usageLimit?: number;
  usageCount?: number;
  status: 'active' | 'inactive' | 'expired';
};

export const Coupons = () => {
  const [query, setQuery] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Inline admin form to keep UI stable (no redesign)
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'flat',
    discountValue: '' as string,
    usageLimit: '' as string,
    active: true
  });

  const fetchCoupons = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const envelope = await api.get('/coupons', {
        params: { page, limit, search: query }
      });
      const data = extractApiData<{ coupons: Coupon[] }>(envelope, { coupons: [] } as any);
      setCoupons(data.coupons ?? []);

      const pagination = extractApiPagination(envelope);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (e: any) {
      setError(normalizeApiError(e, 'Failed to fetch coupons'));
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    // Debounce search to avoid hammering the backend
    const t = setTimeout(() => {
      fetchCoupons();
    }, 300);
    return () => clearTimeout(t);
  }, [fetchCoupons]);

  const filtered = coupons; // server-side filtering

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E0F2F1] text-[#00897B] flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Promotions</p>
            <h3 className="text-lg font-bold text-text-primary">Coupons</h3>
          </div>
        </div>

        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setEditingId(null);
            setForm({
              code: '',
              discountType: 'percent',
              discountValue: '',
              usageLimit: '',
              active: true
            });
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create coupon
        </Button>
      </div>

      <Card className="p-5">
        {formOpen && (
          <div className="mb-6 border border-border rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {editingId ? 'Edit coupon' : 'Create coupon'}
                </p>
                <p className="text-xs text-text-secondary">Manage coupon details</p>
              </div>
              <Button variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="WELCOME10"
              />
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">Discount type</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-text-primary border-border"
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as any }))}
                >
                  <option value="percent">Percent</option>
                  <option value="flat">Flat</option>
                </select>
              </div>

              <Input
                label="Discount value"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                placeholder="10"
                inputMode="decimal"
              />
              <Input
                label="Usage limit (optional)"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                placeholder="500"
                inputMode="numeric"
              />

              <div className="w-full flex items-center gap-3 sm:col-span-2">
                <input
                  id="coupon-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                <label htmlFor="coupon-active" className="text-sm font-semibold text-text-primary">
                  Active
                </label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <Button
                onClick={async () => {
                  const discountValueNum = Number(form.discountValue);
                  const usageLimitNum = form.usageLimit.trim() ? Number(form.usageLimit) : undefined;
                  const payload = {
                    code: form.code,
                    discountType: form.discountType,
                    discountValue: discountValueNum,
                    usageLimit: usageLimitNum,
                    status: form.active ? 'active' : 'inactive'
                  };

                  const action = editingId
                    ? api.put(`/coupons/${editingId}`, payload)
                    : api.post('/coupons', payload);

                  await action;
                  setFormOpen(false);
                  fetchCoupons();
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
              placeholder="Search by code…"
              className="w-full"
            />
          </div>
          <div className="text-xs text-text-secondary">
            {loading ? 'Loading…' : `${filtered.length} coupon${filtered.length === 1 ? '' : 's'}`}
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-red-600 font-semibold">{error}</div>}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary">
                <th className="py-3 pr-4 font-semibold">Code</th>
                <th className="py-3 pr-4 font-semibold">Discount</th>
                <th className="py-3 pr-4 font-semibold">Usage limit</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-0 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id} className="border-t border-border/60">
                  <td className="py-4 pr-4 font-bold text-text-primary">{c.code}</td>
                  <td className="py-4 pr-4 text-text-primary">
                    {c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="py-4 pr-4 text-text-primary">{c.usageLimit ?? '—'}</td>
                  <td className="py-4 pr-4">
                    <Badge variant={c.status === 'active' ? 'success' : 'default'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-4 pr-0 text-right">
                    <div className="inline-flex gap-3 items-center justify-end">
                      <button
                        className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary"
                        onClick={() => {
                          setEditingId(c._id);
                          setForm({
                            code: c.code,
                            discountType: c.discountType,
                            discountValue: String(c.discountValue),
                            usageLimit: c.usageLimit !== undefined ? String(c.usageLimit) : '',
                            active: c.status === 'active'
                          });
                          setFormOpen(true);
                        }}
                        aria-label={`Edit coupon ${c.code}`}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (!confirm(`Deactivate coupon ${c.code}?`)) return;
                          await api.delete(`/coupons/${c._id}`);
                          fetchCoupons();
                        }}
                        aria-label={`Deactivate coupon ${c.code}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr className="border-t border-border/60">
                  <td className="py-10 text-center text-text-secondary" colSpan={5}>
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

