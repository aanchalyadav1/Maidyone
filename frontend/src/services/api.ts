import axios from 'axios';
import { store } from '../store';
import { clearSession } from '../features/auth/authSlice';
import { getApiV1BaseUrl } from '../config/apiBase';
import { auth } from '../config/firebase';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const extractApiData = <T>(response: unknown, fallback: T): T => {
  const envelope = response as Partial<ApiEnvelope<T>> | undefined;
  return envelope?.data ?? fallback;
};

export const extractApiPagination = (response: unknown) => {
  const envelope = response as Partial<ApiEnvelope<unknown>> | undefined;
  return envelope?.pagination;
};

export const normalizeApiError = (error: unknown, fallbackMessage = 'Request failed') => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallbackMessage;
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: getApiV1BaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — always use a fresh Firebase ID token ───────────────
// Firebase SDK auto-refreshes the token when it's within 5 minutes of expiry.
// Calling getIdToken() here ensures we never send a stale token to the backend.
api.interceptors.request.use(
  async (config) => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        // forceRefresh=false — Firebase will refresh automatically when needed
        const token = await firebaseUser.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
        // Also keep Redux store in sync with the latest token
        store.dispatch({ type: 'auth/setSession', payload: {
          user: {
            uid:         firebaseUser.uid,
            email:       firebaseUser.email,
            displayName: firebaseUser.displayName,
          },
          token,
        }});
      } catch {
        // Token fetch failed — clear session and let the 401 handler redirect
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data, // unwrap the { success, message, data } envelope
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token rejected by backend — sign out of Firebase and clear session
      await auth.signOut();
      store.dispatch(clearSession());
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    if (status === 403) {
      // Forbidden — clear session and redirect
      await auth.signOut();
      store.dispatch(clearSession());
      window.location.replace('/login');
    }

    return Promise.reject(error);
  }
);

export default api;
