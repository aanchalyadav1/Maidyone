import React, { useEffect, useMemo, useState } from 'react';
import { Search, Eye, FileCheck, XCircle, Loader2 } from 'lucide-react';
import api, { extractApiData, normalizeApiError } from '../services/api';

export const Verification = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      const envelope = await api.get('/workers', {
        params: {
          status: 'pending',
          search: query || undefined,
          limit: 50
        }
      });
      const data = extractApiData<{ workers: any[] }>(envelope, { workers: [] } as any);
      setWorkers(data.workers ?? []);
    } catch (e: any) {
      setError(normalizeApiError(e, 'Failed to fetch verification queue'));
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchWorkers();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const pendingCount = useMemo(() => workers.length, [workers]);

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-4">
        <h2 className="text-[22px] font-bold text-[#111827]">Verification</h2>
        <span className="text-gray-500 text-[13px]">Manage worker verifications!</span>
      </div>

      <div className="bg-white rounded-[24px] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-border rounded-lg text-[13px] outline-none focus:border-primary w-[240px] shadow-sm bg-white"
                />
              </div>
              <select className="border border-border rounded-lg px-3 py-2 text-[13px] text-gray-600 outline-none shadow-sm bg-white"><option>Pending Verification</option></select>
           </div>
           <select className="border border-border rounded-lg px-3 py-2 text-[13px] text-gray-600 outline-none shadow-sm bg-white"><option>All Actions</option></select>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead>
               <tr className="bg-white border-b border-gray-100">
                 <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Submitted Date</th>
                 <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Worker Info</th>
                 <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Document</th>
                 <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Type</th>
                 <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                 <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Actions</th>
               </tr>
             </thead>
             <tbody>
               {loading ? (
                 <tr>
                   <td colSpan={6} className="py-10 text-center text-text-secondary">
                     <div className="flex items-center justify-center gap-3">
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Loading verification requests…
                     </div>
                   </td>
                 </tr>
               ) : workers.length > 0 ? (
               workers.map((w) => (
                 <tr key={w._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition last:border-0">
                    <td className="py-4 px-6 text-[13px] font-semibold text-gray-800">
                      {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={w.user?.avatar} className="w-9 h-9 rounded-full border border-gray-200 shadow-sm" alt="Worker" />
                        <div>
                          <p className="font-bold text-[14px] text-gray-800">{w.user?.name || 'Worker'}</p>
                          <p className="text-[11px] text-[#0EA5A4] font-medium">
                            {w.skills?.[0]?.category || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        className="flex items-center gap-2 text-blue-600 font-bold text-[12px] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                        disabled={!w.documents?.length || !w.documents?.[0]?.url}
                        onClick={() => {
                          const url = w.documents?.[0]?.url;
                          if (url) window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                         <Eye className="w-3.5 h-3.5" /> View
                        {w.documents?.[0]?.type ? ` ${w.documents[0].type}` : ''}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-gray-600">Identity Guard</td>
                    <td className="py-4 px-6">
                       <span className="bg-[#FFF4E5] text-[#ED6C02] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 w-max">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#ED6C02]"></span> Pending
                       </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          className="bg-[#E6F4EA] text-[#137333] hover:bg-green-100 p-2 rounded-lg transition"
                          title="Approve"
                          onClick={async () => {
                            await api.patch(`/workers/${w._id}`, { verificationStatus: 'verified' });
                            fetchWorkers();
                          }}
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                        <button
                          className="bg-[#FCE8E6] text-[#C5221F] hover:bg-red-100 p-2 rounded-lg transition"
                          title="Reject"
                          onClick={async () => {
                            await api.patch(`/workers/${w._id}`, { verificationStatus: 'rejected' });
                            fetchWorkers();
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                 </tr>
               ))
               ) : (
                 <tr>
                   <td colSpan={6} className="py-10 text-center text-text-secondary">
                     No pending verification requests.
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-gray-500 text-[13px]">
          <span>
            Showing <span className="font-bold text-gray-800">1</span> of <span className="font-bold text-gray-800">{pendingCount}</span> requests
          </span>
          <div className="flex gap-2">
             <button className="border border-border rounded px-3 py-1 hover:bg-gray-50">Previous</button>
             <button className="border border-border rounded px-3 py-1 hover:bg-gray-50">Next</button>
          </div>
        </div>

        {error && <div className="text-red-600 font-semibold text-center pt-2">{error}</div>}
      </div>
    </div>
  );
};
