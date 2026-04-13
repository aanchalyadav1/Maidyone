import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { AdminLayout } from './components/layout/AdminLayout';

import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { Users } from './pages/Users';
import { Workers } from './pages/Workers';
import { Services } from './pages/Services';
import { Payments } from './pages/Payments';
import { Tickets } from './pages/Tickets';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';

// Placeholder empty components for routes
const Settings = () => <div>Settings</div>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="users" element={<Users />} />
        <Route path="workers" element={<Workers />} />
        <Route path="payments" element={<Payments />} />
        <Route path="settings" element={<Settings />} />
        <Route path="verification" element={<div>Verification</div>} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="services" element={<Services />} />
      </Route>
    </Routes>
  );
}

export default App;
