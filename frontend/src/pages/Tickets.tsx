import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Loader2, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface TicketData {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  user: { name: string; email: string };
  assignedTo?: { user: { name: string } };
}

export const Tickets = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res: any = await api.get('/tickets', { params });
      setTickets(res.data.tickets);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tickets/${id}`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Support Tickets</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <select 
               className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-white"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="">All Statuses</option>
               <option value="Open">Open</option>
               <option value="In Progress">In Progress</option>
               <option value="Resolved">Resolved</option>
               <option value="Closed">Closed</option>
             </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">No tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 font-medium px-4">Ticket ID</th>
                  <th className="pb-3 font-medium px-4">Client</th>
                  <th className="pb-3 font-medium px-4">Subject</th>
                  <th className="pb-3 font-medium px-4">Priority</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4">Assigned To</th>
                  <th className="pb-3 font-medium px-4">Date</th>
                  <th className="pb-3 font-medium px-4 text-center">Update</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="py-4 px-4 font-medium text-gray-800">#{t.ticketId}</td>
                    <td className="py-4 px-4 text-gray-600">{t.user?.name}</td>
                    <td className="py-4 px-4">
                      <div className="max-w-[150px] truncate" title={t.description}>{t.subject}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center max-w-fit gap-1 ${
                        t.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 
                        t.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t.priority === 'Urgent' || t.priority === 'High' ? <Zap className="w-3 h-3"/> : ''}
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                       <select 
                         className="bg-transparent border border-gray-200 rounded p-1 outline-none text-xs"
                         value={t.status}
                         onChange={(e) => updateStatus(t._id, e.target.value)}
                       >
                         <option value="Open">Open</option>
                         <option value="In Progress">In Progress</option>
                         <option value="Resolved">Resolved</option>
                         <option value="Closed">Closed</option>
                       </select>
                    </td>
                    <td className="py-4 px-4 text-gray-500">{t.assignedTo?.user.name || 'Unassigned'}</td>
                    <td className="py-4 px-4 text-gray-500">{format(new Date(t.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="py-4 px-4 text-center">
                       <button className="text-sm bg-primary/10 text-primary px-3 py-1 text-xs rounded hover:bg-primary/20 transition-colors">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-end items-center mt-6 gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 text-sm">Prev</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 text-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
