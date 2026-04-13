import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface BookingTrendChartProps {
  data: any[];
}

export const BookingTrendChart: React.FC<BookingTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 h-80 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">Booking Trend</h3>
        <select className="text-sm bg-gray-50 border-none rounded-md text-gray-500 outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1FA2A6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1FA2A6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
            />
            <Area type="monotone" dataKey="Booking" stroke="#1FA2A6" strokeWidth={3} fillOpacity={1} fill="url(#colorBooking)" />
            <Line type="monotone" dataKey="Completed" stroke="#a0a0a0" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
