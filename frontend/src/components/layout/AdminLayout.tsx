import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Global Top Navbar */}
      <div className="h-[90px] bg-white/70 backdrop-blur-md border-b border-border flex items-center shrink-0 z-30 sticky top-0">
        <div className="w-[280px] flex items-center justify-center border-r border-border h-full shrink-0">
          <h1 className="text-3xl font-extrabold text-primary tracking-wide">Maidyone</h1>
        </div>
        <div className="flex-1 px-8">
          <Navbar />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Area */}
        <div className="w-[280px] p-6 pt-8 shrink-0 overflow-hidden relative">
          <Sidebar />
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-8 py-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
