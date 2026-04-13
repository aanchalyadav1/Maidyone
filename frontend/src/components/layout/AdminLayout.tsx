import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar />
      <div className="pl-[296px] pr-4 h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-10 px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
