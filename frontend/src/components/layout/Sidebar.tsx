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
  LogOut
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
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 bg-gradient-to-b from-[#1FA2A6] via-[#A6FFCB]/20 to-[#1FA2A6] rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl z-20">
      {/* Decorative colored blobs behind content */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#F9D423]/20 rounded-full blur-3xl rounded-full"></div>
      
      <div className="relative z-10 p-6 pt-8 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center mb-8">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-20 h-20 rounded-full border-4 border-white mb-2 shadow-lg" />
          <h2 className="text-white font-semibold text-lg">Mr. Raj</h2>
          <p className="text-white/70 text-sm">Real.raj@gmail.com</p>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium',
                  isActive 
                    ? 'bg-white/20 text-white shadow-sm border border-white/10' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="relative z-10 p-6">
        <button className="flex items-center justify-center w-full gap-2 px-4 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors shadow-lg">
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Log Out</span>
        </button>
      </div>
    </aside>
  );
};
