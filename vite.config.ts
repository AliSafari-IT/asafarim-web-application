import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy for Node.js backend (preferences, etc.)
      '/api': {
        target: 'http://localhost:3300',
        changeOrigin: true,
        rewrite: (path) => path
      }
      // Note: .NET backend (auth) is accessed directly via http://localhost:5242/api
    }
  },
  build: {
    outDir: 'dist',
  },
});
