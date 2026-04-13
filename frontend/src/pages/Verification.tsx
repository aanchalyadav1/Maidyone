import React from 'react';
import { Search, Eye, FileCheck, XCircle } from 'lucide-react';

export const Verification = () => {
  const requests = [
    { id: 'VR-10023', name: 'John Smith', category: 'Deep Cleaning', date: 'Oct 24, 2023', doc: 'ID Card.pdf', status: 'Pending', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: 'VR-10024', name: 'Lisa Brown', category: 'Standard Clean', date: 'Oct 23, 2023', doc: 'License.jpg', status: 'Pending', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 'VR-10025', name: 'James Wilson', category: 'Appliance Repair', date: 'Oct 22, 2023', doc: 'Certificate.pdf', status: 'Pending', avatar: 'https://i.pravatar.cc/150?img=11' }
  ];

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
                <input type="text" placeholder="Search by name or ID..." className="pl-9 pr-4 py-2 border border-border rounded-lg text-[13px] outline-none focus:border-primary w-[240px] shadow-sm bg-white" />
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
               {requests.map((req, i) => (
                 <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition last:border-0">
                    <td className="py-4 px-6 text-[13px] font-semibold text-gray-800">{req.date}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={req.avatar} className="w-9 h-9 rounded-full border border-gray-200 shadow-sm" alt="Worker" />
                        <div>
                          <p className="font-bold text-[14px] text-gray-800">{req.name}</p>
                          <p className="text-[11px] text-[#0EA5A4] font-medium">{req.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button className="flex items-center gap-2 text-blue-600 font-bold text-[12px] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                         <Eye className="w-3.5 h-3.5" /> View {req.doc}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-gray-600">Identity Guard</td>
                    <td className="py-4 px-6">
                       <span className="bg-[#FFF4E5] text-[#ED6C02] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 w-max">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#ED6C02]"></span> {req.status}
                       </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button className="bg-[#E6F4EA] text-[#137333] hover:bg-green-100 p-2 rounded-lg transition" title="Approve">
                          <FileCheck className="w-4 h-4" />
                        </button>
                        <button className="bg-[#FCE8E6] text-[#C5221F] hover:bg-red-100 p-2 rounded-lg transition" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-gray-500 text-[13px]">
          <span>Showing <span className="font-bold text-gray-800">1-3</span> of <span className="font-bold text-gray-800">12</span> requests</span>
          <div className="flex gap-2">
             <button className="border border-border rounded px-3 py-1 hover:bg-gray-50">Previous</button>
             <button className="border border-border rounded px-3 py-1 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
