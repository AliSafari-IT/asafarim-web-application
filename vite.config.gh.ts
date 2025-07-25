import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config specifically for GitHub Pages deployment
export default defineConfig({
  base: '/asafarim-web-application/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
