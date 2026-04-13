import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/bookings': 'Booking management',
  '/users': 'Users list',
  '/workers': 'Worker list',
  '/payments': 'Payment',
  '/settings': 'Settings',
  '/verification': 'Verification',
  '/tickets': 'Tickets',
  '/notifications': 'Notifications',
  '/services': 'Services',
};

export const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const title = currentPath === '/' ? 'Dashboard' : currentPath.substring(1).charAt(0).toUpperCase() + currentPath.substring(2);
  
  // Extract subtitle based on current route
  const subTitle = currentPath === '/' ? 'Overview of the Maidyone' : 
                   `Manage your ${currentPath.substring(1)} here`;

  return (
    <header className="flex items-center justify-between py-6 px-10">
      <div>
        <h1 className="text-2xl font-bold text-teal-800 capitalize">{title}</h1>
        <p className="text-sm text-gray-500">{subTitle}</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-white rounded-full text-sm border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 shadow-soft w-64"
          />
        </div>
        
        {currentPath === '/workers' && (
           <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all">
             <Plus className="w-4 h-4" /> Add worker
           </button>
        )}

        <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
      </div>
    </header>
  );
};
