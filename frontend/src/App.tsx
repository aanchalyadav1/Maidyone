import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
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
