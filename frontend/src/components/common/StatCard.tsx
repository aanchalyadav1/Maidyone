import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon: Icon, iconColor }) => {
  return (
    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconColor} bg-opacity-10 flex items-center justify-center`}>
           <Icon className={`w-6 h-6 ${iconColor.replace('bg-', 'text-').replace('-100', '-500')}`} />
        </div>
      </div>
      <div>
        <h3 className="text-gray-500 font-medium text-sm mb-1">{title}</h3>
        <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className={`text-xs ml-2 font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendUp ? '↑' : '↓'} {trend}
            </p>
        </div>
      </div>
    </div>
  );
};
