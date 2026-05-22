import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearSession } from '../../features/auth/authSlice';
import { auth } from '../../config/firebase';
import { RootState } from '../../store';
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
  Tag,
  AlertCircle,
  Image,
  Kanban
} from 'lucide-react';
import clsx from 'clsx';
import { SIDEBAR_ROUTES } from '../../config/routes';

const iconMap = {
  LayoutDashboard,
  Calendar,
  Kanban,
  Users,
  UserSquare2,
  CreditCard,
  Settings,
  ShieldCheck,
  Ticket,
  Bell,
  Wrench,
  Tag,
  AlertCircle,
  Image,
} as const;

export const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user);

  // AuthUser has displayName (Firebase) not name (old MongoDB shape)
  const displayName  = authUser?.displayName || authUser?.email?.split('@')[0] || 'Admin';
  const displayEmail = authUser?.email || '';

  const handleLogout = async () => {
    await auth.signOut();          // sign out of Firebase
    dispatch(clearSession());      // clear Redux + localStorage
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-full h-full bg-gradient-to-b from-primary/90 via-primary-light/80 to-[#E9D060]/90 backdrop-blur-sm rounded-[34px] flex flex-col justify-between overflow-hidden relative shadow-soft border border-white/15">
      {/* Decorative blobs */}
      <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-[1px]" />
      <div className="absolute -left-24 bottom-20 w-56 h-56 rounded-full bg-[#FACC15]/25" />
      <div className="absolute -left-8 bottom-10 w-40 h-40 rounded-full bg-primary/25" />

      <div className="relative z-10 p-6 pt-7 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col items-center mb-8">
          <img
            src={`https://i.pravatar.cc/150?u=${encodeURIComponent(displayEmail || displayName)}`}
            alt="Profile"
            className="w-[72px] h-[72px] rounded-full border-[3px] border-white mb-3 shadow-md"
          />
          <h2 className="text-white font-bold text-[17px] truncate max-w-[180px] text-center">{displayName}</h2>
          {displayEmail && (
            <p className="text-white/80 text-xs truncate max-w-[180px] text-center">{displayEmail}</p>
          )}
        </div>

        <nav className="flex flex-col gap-2">
          {SIDEBAR_ROUTES.map((item) => {
            const Icon = item.sidebarIcon ? iconMap[item.sidebarIcon] : LayoutDashboard;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-[10px] rounded-[18px] transition-all duration-200 text-[13px] font-semibold min-h-[44px]',
                    isActive
                      ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/10'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.navLabel || item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="relative z-10 p-6 pt-2 pb-8">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-[120px] mx-auto gap-2 px-4 py-3 bg-[#000000] text-white rounded-full hover:bg-black/80 transition-colors shadow-lg"
        >
          <span className="font-bold text-[13px] font-['Nunito']">Log Out</span>
        </button>
      </div>
    </aside>
  );
};
