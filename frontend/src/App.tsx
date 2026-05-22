import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { isAdminEmail } from './config/adminWhitelist';
import { RootState } from './store';
import { setSession, clearSession } from './features/auth/authSlice';
import { AdminLayout } from './components/layout/AdminLayout';

import { Dashboard }      from './pages/Dashboard';
import { Bookings }       from './pages/Bookings';
import { BookingDetails } from './pages/BookingDetails';
import { Users }          from './pages/Users';
import { Workers }        from './pages/Workers';
import { Services }       from './pages/Services';
import { Payments }       from './pages/Payments';
import { Tickets }        from './pages/Tickets';
import { Notifications }  from './pages/Notifications';
import { Login }          from './pages/Login';
import { OperationsBoard } from './pages/OperationsBoard';
import { AssignWorker }   from './pages/AssignWorker';
import { Settings }       from './pages/Settings';
import { Verification }   from './pages/Verification';
import { Coupons }        from './pages/Coupons';
import { Complaints }     from './pages/Complaints';
import { Banners }        from './pages/Banners';
import { APP_ROUTES, AppRouteKey } from './config/routes';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // While Firebase is resolving the session on startup, show nothing
  // (avoids a flash-redirect to /login on page refresh)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useDispatch();

  // ── Single source of truth: Firebase onAuthStateChanged ──────────────────
  // This runs once on mount and fires whenever the Firebase session changes
  // (login, logout, token refresh, page reload).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // No Firebase session — clear everything
        dispatch(clearSession());
        return;
      }

      // Check admin whitelist — only whitelisted emails get in
      if (!isAdminEmail(firebaseUser.email)) {
        // Valid Firebase user but not an admin — sign them out silently
        await auth.signOut();
        dispatch(clearSession());
        return;
      }

      try {
        // Get a fresh Firebase ID token (auto-refreshed by Firebase SDK)
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
        // Token fetch failed — clear session
        dispatch(clearSession());
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [dispatch]);

  const routeElements: Record<AppRouteKey, React.ReactNode> = {
    dashboard:        <Dashboard />,
    bookings:         <Bookings />,
    'booking-details': <BookingDetails />,
    users:            <Users />,
    workers:          <Workers />,
    payments:         <Payments />,
    settings:         <Settings />,
    verification:     <Verification />,
    tickets:          <Tickets />,
    'operations-board': <OperationsBoard />,
    'assign-worker':  <AssignWorker />,
    notifications:    <Notifications />,
    services:         <Services />,
    coupons:          <Coupons />,
    complaints:       <Complaints />,
    banners:          <Banners />,
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {APP_ROUTES.map((route) => {
          const routePath = route.path === '/' ? '' : route.path.replace(/^\//, '');
          return (
            <Route
              key={route.key}
              index={route.path === '/'}
              path={route.path === '/' ? undefined : routePath}
              element={routeElements[route.key]}
            />
          );
        })}
      </Route>
    </Routes>
  );
}

export default App;
