import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { isAdminEmail } from './config/adminEmails';
import { RootState } from './store';
import { setSession, clearSession } from './features/auth/authSlice';
import { AdminLayout } from './components/layout/AdminLayout';

import { Dashboard }       from './pages/Dashboard';
import { Bookings }        from './pages/Bookings';
import { BookingDetails }  from './pages/BookingDetails';
import { Users }           from './pages/Users';
import { Workers }         from './pages/Workers';
import { Services }        from './pages/Services';
import { Payments }        from './pages/Payments';
import { Tickets }         from './pages/Tickets';
import { Notifications }   from './pages/Notifications';
import { Login }           from './pages/Login';
import { OperationsBoard } from './pages/OperationsBoard';
import { AssignWorker }    from './pages/AssignWorker';
import { Settings }        from './pages/Settings';
import { Verification }    from './pages/Verification';
import { Coupons }         from './pages/Coupons';
import { Complaints }      from './pages/Complaints';
import { Banners }         from './pages/Banners';
import { AdminManagement } from './pages/AdminManagement';
import { APP_ROUTES, AppRouteKey } from './config/routes';

// ─── Loading spinner ──────────────────────────────────────────────────────────
const AuthLoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
    <div className="w-10 h-10 border-4 border-[#0EA5A4]/30 border-t-[#0EA5A4] rounded-full animate-spin" />
  </div>
);

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // Show spinner only while Firebase is resolving on a fresh (no cached) session
  if (loading) return <AuthLoadingScreen />;

  // Not authenticated — send to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // ── Single source of truth: Firebase onAuthStateChanged ──────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(clearSession());
        return;
      }

      // Whitelist check
      if (!isAdminEmail(firebaseUser.email)) {
        await auth.signOut();
        dispatch(clearSession());
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        dispatch(setSession({
          user: {
            uid:         firebaseUser.uid,
            email:       firebaseUser.email,
            displayName: firebaseUser.displayName,
          },
          token,
        }));
      } catch {
        dispatch(clearSession());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Page-level elements map
  const routeElements: Record<AppRouteKey, React.ReactNode> = {
    dashboard:          <Dashboard />,
    bookings:           <Bookings />,
    'booking-details':  <BookingDetails />,
    users:              <Users />,
    workers:            <Workers />,
    payments:           <Payments />,
    settings:           <Settings />,
    verification:       <Verification />,
    tickets:            <Tickets />,
    'operations-board': <OperationsBoard />,
    'assign-worker':    <AssignWorker />,
    notifications:      <Notifications />,
    services:           <Services />,
    coupons:            <Coupons />,
    complaints:         <Complaints />,
    banners:            <Banners />,
    'admin-management': <AdminManagement />,
  };

  return (
    <Routes>
      {/* Login — redirect to dashboard if already authenticated */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Admin panel — all nested routes under "/" */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {APP_ROUTES.map((route) => {
          // dashboard has path '/' → render as index route
          if (route.path === '/') {
            return (
              <Route
                key={route.key}
                index
                element={routeElements[route.key]}
              />
            );
          }
          // All other routes: strip leading slash
          const relativePath = route.path.replace(/^\//, '');
          return (
            <Route
              key={route.key}
              path={relativePath}
              element={routeElements[route.key]}
            />
          );
        })}

        {/* Catch-all inside admin panel — redirect unknown paths to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Global catch-all — redirect anything else to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
