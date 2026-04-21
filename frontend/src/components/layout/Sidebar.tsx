import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserSquare2, 
  CreditCard, 
  Settings,
  ShieldCheck,
  Ticket,
  Bell,
  Wrench,
  LogOut,
  Tag,
  AlertCircle,
  Image
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Bookings management', path: '/bookings', icon: Calendar },
  { name: 'User', path: '/users', icon: Users },
  { name: 'Worker', path: '/workers', icon: UserSquare2 },
  { name: 'Payment', path: '/payments', icon: CreditCard },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Verification', path: '/verification', icon: ShieldCheck },
  { name: 'Tickets', path: '/tickets', icon: Ticket },
  { name: 'Notification', path: '/notifications', icon: Bell },
  { name: 'Services', path: '/services', icon: Wrench },
  { name: 'Coupons', path: '/coupons', icon: Tag },
  { name: 'Complaints', path: '/complaints', icon: AlertCircle },
  { name: 'Banners', path: '/banners', icon: Image },
];

export const Sidebar = () => {
  return (
    <aside className="w-full h-full bg-gradient-to-b from-[#0EA5A4]/90 to-[#06B6D4]/90 md:from-[#0EA5A4]/90 md:via-[#6CC8C6]/90 md:to-[#E9D060]/90 backdrop-blur-sm rounded-[32px] flex flex-col justify-between overflow-hidden relative shadow-lg">
      <div className="relative z-10 p-6 pt-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col items-center mb-8">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-[72px] h-[72px] rounded-full border-[3px] border-white mb-3 shadow-md" />
          <h2 className="text-white font-bold text-[17px]">Mr. Raj</h2>
          <p className="text-white/80 text-xs">Email.raj@gmail.com</p>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-[10px] rounded-[18px] transition-all duration-200 text-[13px] font-semibold',
                  isActive 
                    ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/10' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="relative z-10 p-6 pt-2 pb-8">
        <button className="flex items-center justify-center w-[120px] mx-auto gap-2 px-4 py-3 bg-[#000000] text-white rounded-full hover:bg-black/80 transition-colors shadow-lg">
          <span className="font-bold text-[13px] font-['Nunito']">Log Out</span>
        </button>
      </div>
    </aside>
  );
};
