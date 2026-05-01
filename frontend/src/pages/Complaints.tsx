import React, { useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { AlertCircle, Search } from 'lucide-react';

type Complaint = {
  id: string;
  ticketId: string;
  subject: string;
  status: 'Open' | 'In progress' | 'Closed';
  createdAt: string;
};

const SEED: Complaint[] = [
  { id: 'cmp_1', ticketId: '#TKT-1024', subject: 'Worker arrived late', status: 'Open', createdAt: new Date().toISOString() },
  { id: 'cmp_2', ticketId: '#TKT-1025', subject: 'Payment marked failed but deducted', status: 'In progress', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'cmp_3', ticketId: '#TKT-1026', subject: 'Service quality issue', status: 'Closed', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

function badgeVariant(status: Complaint['status']) {
  switch (status) {
    case 'Open':
      return 'error' as const;
    case 'In progress':
      return 'warning' as const;
    case 'Closed':
      return 'success' as const;
  }
}

export const Complaints = () => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEED;
    return SEED.filter((c) => (c.ticketId + c.subject).toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">Support</p>
          <h3 className="text-lg font-bold text-text-primary">Complaints</h3>
        </div>
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
              placeholder="Search tickets…"
              className="w-full"
            />
          </div>
          <div className="text-xs text-text-secondary">{filtered.length} result(s)</div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="border border-border rounded-2xl p-5 bg-white shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="leading-tight">
                  <p className="font-bold text-text-primary">{c.ticketId}</p>
                  <p className="text-sm text-text-secondary mt-1">{c.subject}</p>
                </div>
                <Badge variant={badgeVariant(c.status)}>{c.status}</Badge>
              </div>
              <div className="mt-4 text-xs text-text-secondary">
                Created {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-text-secondary py-12 border border-border rounded-2xl">
              No complaints found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

