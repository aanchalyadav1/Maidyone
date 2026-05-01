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
    <div className="bg-white px-4 py-[14px] rounded-[22px] shadow-soft border border-border flex flex-col justify-between hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] transition-shadow h-[112px]">
      <div className="flex justify-between items-start">
        <div className={`p-[9px] rounded-[14px] ${iconColor} flex items-center justify-center shadow-sm`}>
           <Icon className="w-[18px] h-[18px] opacity-90" />
        </div>
        <div className="text-right">
          <h3 className="text-text-secondary font-bold text-[12px] leading-[14px] mb-1">{title}</h3>
          <p className="text-[20px] leading-[22px] font-extrabold text-primary">{value}</p>
        </div>
      </div>
      <div className="flex items-center justify-start mt-2">
         <span className={`flex items-center gap-1 px-2 py-[3px] rounded-md font-bold text-[10px] leading-[12px] ${trendUp ? 'bg-[#E1F7E3] text-[#1E7145]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
            {trendUp ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>}
            {trend}
         </span>
         <span className="text-[10px] leading-[12px] text-text-secondary ml-2 font-medium">vs yesterday</span>
      </div>
    </div>
  );
};
