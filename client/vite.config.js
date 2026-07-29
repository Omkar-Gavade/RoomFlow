import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — ARCHITECTURE.md §25.4 (Vercel build). Dev proxies /api to the
// Express backend so the SPA and API share an origin in development.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
