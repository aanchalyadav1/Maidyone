import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Mobile sidebar drawer */}
          {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <button
                className="absolute inset-0 bg-black/30"
                aria-label="Close sidebar"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute left-4 top-4 bottom-4 w-[280px] max-w-[85vw]">
                <Sidebar />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="min-w-0">
            <div className="sticky top-0 z-30">
              <div className="bg-white/70 backdrop-blur-md border border-border rounded-[22px] shadow-soft">
                <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
                  <Navbar />
                  <button
                    className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-white hover:bg-gray-50"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open sidebar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="18" x2="20" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <main className="mt-6 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
