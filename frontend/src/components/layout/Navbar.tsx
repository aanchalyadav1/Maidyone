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
  let title = currentPath === '/' ? 'Dashboard' : currentPath.substring(1).split('/')[0].charAt(0).toUpperCase() + currentPath.substring(1).split('/')[0].substring(1);
  if (currentPath.includes('bookings/details')) title = 'Booking details';
  else if (currentPath.includes('bookings')) title = 'Booking management';
  
  // Extract subtitle based on current route
  const subTitle = currentPath === '/' ? 'Overview of the Maidyone!' : 
                   currentPath.includes('bookings') ? 'Overview of the Maidyone!' :
                   `Manage your ${currentPath.substring(1).split('/')[0]} here`;

  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-[22px] font-bold text-text-primary capitalize leading-tight mb-1">{title}</h2>
        <p className="text-sm text-text-secondary">{subTitle}</p>
      </div>
    </header>
  );
};
