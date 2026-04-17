import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { ChevronLeft, ChevronRight, Filter, Edit, Eye, MessageSquare } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

export const Tickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/tickets?limit=10');
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.warn('Failed to fetch tickets, using dummy UI');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="space-y-6">
      <div className="mb-4 text-left">
        <h2 className="text-[20px] font-bold text-[#111827]">Support Tickets</h2>
        <span className="text-[#6B7280] text-[12px]">Manage user and worker complaints!</span>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E5E7EB] min-h-[500px]">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-center mb-6 gap-4">
          <div className="relative w-full md:w-[320px]">
            <input 
              type="text" 
              placeholder="Search ticket id, subject..." 
              className="pl-4 pr-10 py-2.5 w-full border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4] transition-colors bg-[#FAFAFA]"
            />
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-4 py-2.5 bg-[#FAFAFA] w-full md:w-[200px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <select className="bg-transparent outline-none text-[13px] text-[#6B7280] w-full indent-1">
              <option>All Status</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-2"><TableSkeleton columns={8} rows={6} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[#6B7280] text-[12px] font-medium tracking-wide">
                  <th className="pb-4 font-bold px-4">Ticket ID</th>
                  <th className="pb-4 font-bold px-4">Client</th>
                  <th className="pb-4 font-bold px-4">Subject</th>
                  <th className="pb-4 font-bold px-4">Priority</th>
                  <th className="pb-4 font-bold px-4">Status</th>
                  <th className="pb-4 font-bold px-4">Assigned To</th>
                  <th className="pb-4 font-bold px-4">Created Date</th>
                  <th className="pb-4 font-bold px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5,6,7,8].map((item, index) => {
                  const data = [
                      {id: '#TCK8455', client: 'Jhon smith', img: '10', subj: 'Payment Failed', pri: 'High', stat: 'Open', asn: 'Unassigned', date: '26 Apr 2024'},
                      {id: '#TCK8124', client: 'Mike Tyson', img: '11', subj: 'App Crashing', pri: 'Urgent', stat: 'In Progress', asn: 'Tech Team', date: '25 Apr 2024'},
                      {id: '#TCK7854', client: 'Sarah Lee', img: '12', subj: 'Worker rude behavior', pri: 'Medium', stat: 'Resolved', asn: 'Support Team', date: '24 Apr 2024'},
                      {id: '#TCK9945', client: 'Ravi Kumar', img: '14', subj: 'Refund Request', pri: 'High', stat: 'Closed', asn: 'Billing Team', date: '23 Apr 2024'},
                  ][index % 4];

                  return (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition border-opacity-50">
                      <td className="py-3 px-4 font-bold text-[#0EA5A4] text-[14px]">{data.id}</td>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/150?img=${data.img}`} className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-100" />
                        <span className="font-bold text-[#111827] text-[13px]">{data.client}</span>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-[#6B7280] max-w-[150px] truncate">{data.subj}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${data.pri === 'Urgent' ? 'bg-[#FEE2E2] text-[#DC2626]' : data.pri === 'High' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#E1F7E3] text-[#1E7145]'}`}>
                          {data.pri}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${data.stat === 'Resolved' || data.stat === 'Closed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
                          {data.stat}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[#6B7280]">{data.asn}</td>
                      <td className="py-3 px-4 text-[12px] text-[#6B7280]">{data.date}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <button className="flex items-center justify-center bg-[#FAFAFA] border border-[#E5E7EB] px-2 py-1.5 rounded-lg text-[#6B7280] hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                             <Eye className="w-4 h-4" />
                           </button>
                           <button className="flex items-center justify-center bg-[#E1EDEA] border border-transparent px-2 py-1.5 rounded-lg text-[#1496A3] hover:bg-[#1496A3] hover:text-white transition shadow-sm">
                             <MessageSquare className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-1.5">
            <button className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#111827] px-2 py-1"><ChevronLeft className="w-4 h-4"/> Previous</button>
            <button className="w-7 h-7 rounded border border-[#E5E7EB] flex items-center justify-center text-[#111827] text-xs font-bold bg-gray-50 shadow-sm">1</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-[#6B7280] text-xs hover:bg-gray-50 border border-transparent hover:border-[#E5E7EB] transition">2</button>
            <button className="flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#111827] px-2 py-1">Next <ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </div>
  );
};
