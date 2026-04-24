import axios from 'axios';
import { store } from '../store';
import { logout } from '../features/auth/authSlice';

// Create base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
