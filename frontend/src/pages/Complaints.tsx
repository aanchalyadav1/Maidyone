import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { AlertCircle, Search } from 'lucide-react';
import api, { extractApiData, normalizeApiError } from '../services/api';

type Complaint = {
  _id: string;
  ticketId: string;
  subject: string;
  status: 'Open' | 'In progress' | 'Closed';
  createdAt: string | Date;
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Complaint[]>([]);

  const mapTicketToComplaint = (t: any): Complaint => {
    const rawStatus = t.status;
    let status: Complaint['status'] = 'Open';
    if (rawStatus === 'In Progress') status = 'In progress';
    else if (rawStatus === 'Resolved' || rawStatus === 'Closed') status = 'Closed';

    return {
      _id: t._id,
      ticketId: t.ticketId,
      subject: t.subject,
      status,
      createdAt: t.createdAt
    };
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const envelope = await api.get('/tickets', {
        params: {
          page: 1,
          limit: 20,
          search: query || undefined
        }
      });
      const data = extractApiData<{ tickets: any[] }>(envelope, { tickets: [] } as any);
      setTickets((data.tickets ?? []).map(mapTicketToComplaint));
    } catch (e: any) {
      setError(normalizeApiError(e, 'Failed to fetch complaints'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchTickets(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => tickets, [tickets]);

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
          <div className="text-xs text-text-secondary">
            {loading ? 'Loading…' : `${filtered.length} result(s)`}
          </div>
        </div>

        {error && <div className="mt-4 text-red-600 font-semibold text-sm">{error}</div>}

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="lg:col-span-2 text-center text-text-secondary py-6">Loading…</div>
          ) : (
            filtered.map((c) => (
            <div key={c._id} className="border border-border rounded-2xl p-5 bg-white shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="leading-tight">
                  <p className="font-bold text-text-primary">{c.ticketId}</p>
                  <p className="text-sm text-text-secondary mt-1">{c.subject}</p>
                </div>
                <Badge variant={badgeVariant(c.status)}>{c.status}</Badge>
              </div>
              <div className="mt-4 text-xs text-text-secondary">
                Created {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
              </div>
            </div>
            ))
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center text-text-secondary py-12 border border-border rounded-2xl">
              No complaints found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

