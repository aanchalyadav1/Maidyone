import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export const ServiceDistributionChart = ({ data }: { data: any[] }) => {
  // Vibrant colors exactly matching the screenshot's service wise booking donut
  const COLORS = ['#0EA5A4', '#FFCA28', '#1A73E8', '#F26B4D', '#8E24AA', '#00BCD4', '#4CAF50', '#EC407A', '#9C27B0'];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative">
      <div className="w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col w-full gap-2 mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="text-text-primary text-[11px] font-bold">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%</span>
              <span className="text-text-secondary text-[11px]">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
