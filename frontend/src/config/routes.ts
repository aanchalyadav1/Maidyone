export type AppRouteKey =
  | 'dashboard'
  | 'bookings'
  | 'booking-details'
  | 'users'
  | 'workers'
  | 'payments'
  | 'settings'
  | 'verification'
  | 'tickets'
  | 'operations-board'
  | 'assign-worker'
  | 'notifications'
  | 'services'
  | 'coupons'
  | 'complaints'
  | 'banners'
  | 'admin-management';

export type SidebarIconKey =
  | 'LayoutDashboard'
  | 'Calendar'
  | 'Kanban'
  | 'Users'
  | 'UserSquare2'
  | 'CreditCard'
  | 'Settings'
  | 'ShieldCheck'
  | 'Ticket'
  | 'Bell'
  | 'Wrench'
  | 'Tag'
  | 'AlertCircle'
  | 'Image'
  | 'Shield';

export interface AppRouteMeta {
  key: AppRouteKey;
  path: string;
  title: string;
  navLabel?: string;
  sidebarIcon?: SidebarIconKey;
  showInSidebar: boolean;
}

export const APP_ROUTES: AppRouteMeta[] = [
  { key: 'dashboard', path: '/', title: 'Dashboard', navLabel: 'Dashboard', sidebarIcon: 'LayoutDashboard', showInSidebar: true },
  { key: 'bookings', path: '/bookings', title: 'Booking management', navLabel: 'Bookings management', sidebarIcon: 'Calendar', showInSidebar: true },
  { key: 'booking-details', path: '/bookings/details/:id', title: 'Booking details', showInSidebar: false },
  { key: 'operations-board', path: '/operations-board', title: 'Operations board', navLabel: 'Operations board', sidebarIcon: 'Kanban', showInSidebar: true },
  { key: 'assign-worker', path: '/bookings/assign/:id', title: 'Assign worker', showInSidebar: false },
  { key: 'users', path: '/users', title: 'Users list', navLabel: 'User', sidebarIcon: 'Users', showInSidebar: true },
  { key: 'workers', path: '/workers', title: 'Worker list', navLabel: 'Worker', sidebarIcon: 'UserSquare2', showInSidebar: true },
  { key: 'payments', path: '/payments', title: 'Payment', navLabel: 'Payment', sidebarIcon: 'CreditCard', showInSidebar: true },
  { key: 'settings', path: '/settings', title: 'Settings', navLabel: 'Settings', sidebarIcon: 'Settings', showInSidebar: true },
  { key: 'verification', path: '/verification', title: 'Verification', navLabel: 'Verification', sidebarIcon: 'ShieldCheck', showInSidebar: true },
  { key: 'tickets', path: '/tickets', title: 'Tickets', navLabel: 'Tickets', sidebarIcon: 'Ticket', showInSidebar: true },
  { key: 'notifications', path: '/notifications', title: 'Notifications', navLabel: 'Notification', sidebarIcon: 'Bell', showInSidebar: true },
  { key: 'services', path: '/services', title: 'Services', navLabel: 'Services', sidebarIcon: 'Wrench', showInSidebar: true },
  { key: 'coupons', path: '/coupons', title: 'Coupons', navLabel: 'Coupons', sidebarIcon: 'Tag', showInSidebar: true },
  { key: 'complaints', path: '/complaints', title: 'Complaints', navLabel: 'Complaints', sidebarIcon: 'AlertCircle', showInSidebar: true },
  { key: 'banners', path: '/banners', title: 'Banners', navLabel: 'Banners', sidebarIcon: 'Image', showInSidebar: true },
  { key: 'admin-management', path: '/admin-management', title: 'Admin Management', navLabel: 'Admin Access', sidebarIcon: 'Shield', showInSidebar: true },
];

export const SIDEBAR_ROUTES = APP_ROUTES.filter((route) => route.showInSidebar);

const toStaticPath = (path: string) => path.replace(/\/:.*$/, '');

export const getRouteMetaByPath = (pathname: string): AppRouteMeta | undefined => {
  if (pathname.includes('/bookings/details/')) {
    return APP_ROUTES.find((r) => r.key === 'booking-details');
  }
  if (pathname.includes('/bookings/assign/')) {
    return APP_ROUTES.find((r) => r.key === 'assign-worker');
  }
  return APP_ROUTES.find((route) => toStaticPath(route.path) === pathname);
};
