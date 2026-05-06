import axios from 'axios';
import { store } from '../store';
import { logout } from '../features/auth/authSlice';
import { getApiV1BaseUrl } from '../config/apiBase';

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

// Create base Axios instance
const api = axios.create({
  baseURL: getApiV1BaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    // We would pull the Firebase Custom Token from our Redux state
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // the backend uses { success, message, data } wrapper
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Force logout on 401 Unauthorized
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
