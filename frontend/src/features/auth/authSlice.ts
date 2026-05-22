import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  uid: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  role: 'admin' | 'worker' | 'user';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ─── Safe localStorage hydration ─────────────────────────────────────────────
// Validate that stored data has the expected shape before trusting it.
const safeParseUser = (raw: string | null): User | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Must have uid and a valid role — reject anything else
    if (
      typeof parsed !== 'object' ||
      typeof parsed.uid !== 'string' ||
      !['admin', 'worker', 'user'].includes(parsed.role)
    ) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
    return parsed as User;
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

const storedToken = localStorage.getItem('token');
const storedUser  = safeParseUser(localStorage.getItem('user'));

// If token exists but user is invalid (or vice versa), clear both
const isConsistent = !!(storedToken && storedUser);
if (!isConsistent) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

const initialState: AuthState = {
  user:            isConsistent ? storedUser  : null,
  token:           isConsistent ? storedToken : null,
  isAuthenticated: isConsistent,
  loading:         false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.loading         = false;
      // Persist to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.loading         = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
