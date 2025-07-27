import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // تأكد من وجود هذا السطر
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://studentregistrationsystem-production-c988.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
