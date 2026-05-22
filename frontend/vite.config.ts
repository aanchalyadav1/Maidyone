import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Backend origin for the dev proxy.
  // If VITE_API_URL is set (e.g. http://localhost:5000), use it.
  // Otherwise fall back to the default local backend port.
  const backendOrigin = env.VITE_API_URL
    ? env.VITE_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
    : 'http://localhost:5000';

  return {
    plugins: [react()],

    server: {
      port: 5173,
      proxy: {
        // Proxy all /api/v1 requests to the backend in development
        '/api/v1': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        // Proxy /uploads so uploaded images load in development
        '/uploads': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
