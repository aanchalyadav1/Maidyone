import React from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMetaByPath } from '../../config/routes';

export const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const routeMeta = getRouteMetaByPath(currentPath);
  const title =
    routeMeta?.title ??
    (currentPath === '/'
      ? 'Dashboard'
      : currentPath
        .substring(1)
        .split('/')[0]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (m) => m.toUpperCase()));

  const subTitle = currentPath === '/' ? 'Overview of the Maidyone!' :
    currentPath.includes('bookings') ? 'Overview of the Maidyone!' :
    currentPath.includes('admin-management') ? 'Manage admin access and permissions' :
      `Manage your ${currentPath.substring(1).split('/')[0].replace(/-/g, ' ')} here`;

  return (
    <header className="min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-primary font-extrabold text-[14px] tracking-wide shrink-0">Maidyone</span>
        <span className="h-4 w-px bg-border shrink-0" />
        <div className="min-w-0">
          <h2 className="text-[16px] sm:text-[18px] font-extrabold text-text-primary leading-tight truncate">
            {title}
          </h2>
          <p className="text-[12px] sm:text-[13px] text-text-secondary truncate">{subTitle}</p>
        </div>
      </div>
    </header>
  );
};
