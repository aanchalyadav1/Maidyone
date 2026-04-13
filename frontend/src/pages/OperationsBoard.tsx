import React, { useEffect, useState } from 'react';
import { Plus, Search, Calendar, CheckCircle2, AlertCircle, MapPin, Wrench } from 'lucide-react';
import api from '../services/api';

export const OperationsBoard = () => {
  const [boardData, setBoardData] = useState<any>({
    Pending: [],
    'In Progress': [],
    Completed: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoardTasks = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/bookings');
        const tasks = res.data.bookings || [];
        
        const grouped = {
          Pending: tasks.filter((t: any) => t.status === 'Pending'),
          'In Progress': tasks.filter((t: any) => t.status === 'In Progress' || t.status === 'Confirmed'),
          Completed: tasks.filter((t: any) => t.status === 'Completed' || t.status === 'Cancelled')
        };
        setBoardData(grouped);
      } catch (err) {
        console.warn("Using minimal fallback for Operations Board if empty.");
      } finally {
        setLoading(false);
      }
    };
    fetchBoardTasks();
  }, []);

  const Column = ({ title, count, tasks, bgBase, textHeader, icon }: any) => (
    <div className={`flex flex-col flex-1 border border-border bg-white rounded-[24px] overflow-hidden min-h-[600px] shadow-sm`}>
      <div className="flex justify-between items-center px-5 py-4 border-b border-border/50">
        <h3 className={`font-bold text-[15px] flex items-center gap-2 ${textHeader}`}>
          <span className={`w-2 h-2 rounded-full ${bgBase}`}></span> {title}
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-1">{count}</span>
        </h3>
        <button className="text-gray-400 hover:text-gray-700">•••</button>
      </div>
      <div className={`flex-1 p-4 flex flex-col gap-4 bg-gray-50/30 overflow-y-auto`}>
        {tasks.map((t: any, i: number) => (
          <div key={i} className="bg-white border border-border/60 hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div>
                  <span className="text-[10px] text-gray-400 font-bold tracking-wider">{t.bookingId || `#BK-${Math.floor(1000+Math.random()*9000)}`}</span>
                  <h4 className="font-bold text-[14px] text-gray-800 mt-1">{t.service?.name || 'Assigned Service'}</h4>
               </div>
               <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${bgBase} bg-opacity-20 ${textHeader}`}>
                  {t.service?.category || 'Category'}
               </span>
             </div>
             
             <div className="flex items-center gap-2 mt-1">
               <img src={t.user?.avatar || `https://i.pravatar.cc/150?img=${i+10}`} className="w-6 h-6 rounded-full border border-gray-200" alt="avatar" />
               <p className="text-[12px] text-gray-600 font-medium">{t.user?.name || 'Customer'}</p>
             </div>
             
             <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
               <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {t.date ? new Date(t.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'Today'}</div>
               {title === 'Completed' && <div className="flex items-center gap-1 text-green-500 font-medium"><CheckCircle2 className="w-3.5 h-3.5"/> Done</div>}
               {title === 'In Progress' && <div className="flex items-center gap-1 text-[#1A73E8] font-medium"><div className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]"></div> Active</div>}
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-border p-4 rounded-[20px] shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Operations Board</h2>
        <div className="flex items-center gap-4">
          <select className="border border-border rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none"><option>Oct 10 - Oct 16, 2023</option></select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search jobs..." className="pl-9 pr-4 py-1.5 border border-border rounded-lg text-sm w-48 outline-none focus:border-primary" />
          </div>
          <button className="flex items-center gap-2 bg-[#0EA5A4] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#0B8483] transition-colors"><Plus className="w-4 h-4" /> Add Job</button>
        </div>
      </div>

      <div className="flex gap-6 min-h-[600px] overflow-x-auto pb-4">
        <Column title="Pending" count={boardData.Pending.length} tasks={boardData.Pending} bgBase="bg-yellow-400" textHeader="text-yellow-600" />
        <Column title="In Progress" count={boardData['In Progress'].length} tasks={boardData['In Progress']} bgBase="bg-[#1A73E8]" textHeader="text-[#1A73E8]" />
        <Column title="Completed" count={boardData.Completed.length} tasks={boardData.Completed} bgBase="bg-green-500" textHeader="text-green-600" />
      </div>
    </div>
  );
};
