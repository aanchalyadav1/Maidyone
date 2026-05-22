import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from './store';
import { logout } from './features/auth/authSlice';
import { AdminLayout } from './components/layout/AdminLayout';

import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { BookingDetails } from './pages/BookingDetails';
import { Users } from './pages/Users';
import { Workers } from './pages/Workers';
import { Services } from './pages/Services';
import { Payments } from './pages/Payments';
import { Tickets } from './pages/Tickets';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';
import { OperationsBoard } from './pages/OperationsBoard';
import { AssignWorker } from './pages/AssignWorker';
import { Settings } from './pages/Settings';
import { Verification } from './pages/Verification';
import { Coupons } from './pages/Coupons';
import { Complaints } from './pages/Complaints';
import { Banners } from './pages/Banners';
import { APP_ROUTES, AppRouteKey } from './config/routes';

// ─── Firebase token expiry check ─────────────────────────────────────────────
// Firebase ID tokens expire after 1 hour. Parse the JWT exp claim and
// pre-emptively log out before the backend rejects the next request.
const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token   = useSelector((state: RootState) => state.auth.token);
  const user    = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  // Check token expiry on every render of a protected route
  useEffect(() => {
    if (!token) return;
    const expiry = getTokenExpiry(token);
    if (expiry && Date.now() >= expiry) {
      dispatch(logout());
    }
  }, [token, dispatch]);

  if (!token) return <Navigate to="/login" replace />;

  // Role guard — only admins may access this panel
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow p-10 text-center max-w-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">
            This panel is restricted to administrators only.
          </p>
          <button
            className="bg-[#0EA5A4] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-teal-700 transition"
            onClick={() => {
              dispatch(logout());
              window.location.replace('/login');
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  const routeElements: Record<AppRouteKey, React.ReactNode> = {
    dashboard: <Dashboard />,
    bookings: <Bookings />,
    'booking-details': <BookingDetails />,
    users: <Users />,
    workers: <Workers />,
    payments: <Payments />,
    settings: <Settings />,
    verification: <Verification />,
    tickets: <Tickets />,
    'operations-board': <OperationsBoard />,
    'assign-worker': <AssignWorker />,
    notifications: <Notifications />,
    services: <Services />,
    coupons: <Coupons />,
    complaints: <Complaints />,
    banners: <Banners />,
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        {APP_ROUTES.map((route) => {
          const path = route.path === '/' ? '' : route.path.replace(/^\//, '');
          return (
            <Route
              key={route.key}
              index={route.path === '/'}
              path={route.path === '/' ? undefined : path}
              element={routeElements[route.key]}
            />
          );
        })}
      </Route>
    </Routes>
  );
}

export default App;
