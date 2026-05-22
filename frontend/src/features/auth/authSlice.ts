import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Minimal safe auth info — no role, no MongoDB fields
export interface AuthUser {
  uid:         string;
  email:       string | null;
  displayName: string | null;
}

interface AuthState {
  user:            AuthUser | null;
  token:           string | null;   // Firebase ID token (refreshed by onAuthStateChanged)
  isAuthenticated: boolean;
  loading:         boolean;         // true while onAuthStateChanged is resolving on startup
}

// ─── Safe localStorage hydration ─────────────────────────────────────────────
// Only restore if both token and user are present and well-formed.
// This is a best-effort cache — onAuthStateChanged will always be the
// authoritative source and will overwrite this on mount.
const safeParseUser = (raw: string | null): AuthUser | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || typeof parsed.uid !== 'string') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      return null;
    }
    return { uid: parsed.uid, email: parsed.email ?? null, displayName: parsed.displayName ?? null };
  } catch {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    return null;
  }
};

const storedToken = localStorage.getItem('auth_token');
const storedUser  = safeParseUser(localStorage.getItem('auth_user'));
const isConsistent = !!(storedToken && storedUser);

if (!isConsistent) {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

const initialState: AuthState = {
  user:            isConsistent ? storedUser  : null,
  token:           isConsistent ? storedToken : null,
  isAuthenticated: isConsistent,
  // If we have a consistent cached session, start as NOT loading —
  // onAuthStateChanged will still run and update the token, but the
  // user won't see a blank spinner on every page refresh.
  // If no cached session, start as true so ProtectedRoute waits for
  // Firebase to resolve before redirecting to /login.
  loading:         !isConsistent,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called by onAuthStateChanged when a valid admin session is confirmed
    setSession: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.loading         = false;
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
    },
    // Called by onAuthStateChanged when no user / token refresh / logout
    clearSession: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.loading         = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Also clear legacy keys from old auth system
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    // Called while onAuthStateChanged is still resolving
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setSession, clearSession, setAuthLoading } = authSlice.actions;

// Keep backward-compatible aliases so existing pages that import
// setCredentials / logout don't break
export const setCredentials = setSession;
export const logout         = clearSession;

export default authSlice.reducer;
