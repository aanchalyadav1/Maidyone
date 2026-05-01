import React, { useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Image as ImageIcon, Plus, Search } from 'lucide-react';

type Banner = {
  id: string;
  title: string;
  placement: 'Home' | 'Bookings' | 'Offers';
  active: boolean;
};

const SEED: Banner[] = [
  { id: 'bnr_1', title: 'Summer Offer Hero', placement: 'Home', active: true },
  { id: 'bnr_2', title: 'New Services Spotlight', placement: 'Bookings', active: false },
];

export const Banners = () => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEED;
    return SEED.filter((b) => (b.title + b.placement).toLowerCase().includes(q));
  }, [query]);

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

        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add banner
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
              placeholder="Search banners…"
              className="w-full"
            />
          </div>
          <div className="text-xs text-text-secondary">{filtered.length} banner(s)</div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div key={b.id} className="border border-border rounded-2xl overflow-hidden bg-white shadow-soft">
              <div className="h-36 bg-gradient-to-br from-[#0EA5A4]/25 via-[#6CC8C6]/25 to-[#FACC15]/25 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-text-secondary" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="leading-tight">
                    <p className="font-bold text-text-primary">{b.title}</p>
                    <p className="text-sm text-text-secondary mt-1">Placement: {b.placement}</p>
                  </div>
                  <Badge variant={b.active ? 'success' : 'default'}>{b.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button variant="ghost" size="sm" className="flex-1">Preview</Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-text-secondary py-12 border border-border rounded-2xl md:col-span-2 xl:col-span-3">
              No banners found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

