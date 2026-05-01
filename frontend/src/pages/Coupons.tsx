import React, { useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Plus, Search, Tag, Trash2 } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  active: boolean;
  usageLimit?: number;
};

const SEED: Coupon[] = [
  { id: 'cpn_1', code: 'WELCOME10', discountType: 'percent', discountValue: 10, active: true, usageLimit: 500 },
  { id: 'cpn_2', code: 'MAIDYONE50', discountType: 'flat', discountValue: 50, active: false, usageLimit: 200 },
];

export const Coupons = () => {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Coupon[]>(SEED);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.code.toLowerCase().includes(q));
  }, [query, rows]);

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

        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create coupon
        </Button>
      </div>

      <Card className="p-5">
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
            {filtered.length} coupon{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

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
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-4 pr-4 font-bold text-text-primary">{c.code}</td>
                  <td className="py-4 pr-4 text-text-primary">
                    {c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="py-4 pr-4 text-text-primary">{c.usageLimit ?? '—'}</td>
                  <td className="py-4 pr-4">
                    <Badge variant={c.active ? 'success' : 'default'}>
                      {c.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-4 pr-0 text-right">
                    <button
                      className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700"
                      onClick={() => setRows((prev) => prev.filter((x) => x.id !== c.id))}
                      aria-label={`Delete coupon ${c.code}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="border-t border-border/60">
                  <td className="py-10 text-center text-text-secondary" colSpan={5}>
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

