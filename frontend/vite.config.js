import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..', '/locales'], // السماح بالوصول إلى مجلد locales
    },
  },
});
