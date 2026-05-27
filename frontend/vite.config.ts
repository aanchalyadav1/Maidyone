import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const backendOrigin = env.VITE_API_URL
    ? env.VITE_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
    : 'http://localhost:5006';

  return {
    plugins: [react()],

    server: {
      port: 5173,
      proxy: {
        '/api/v1': { target: backendOrigin, changeOrigin: true, secure: false },
        '/uploads': { target: backendOrigin, changeOrigin: true, secure: false },
      },
    },
  };
});
