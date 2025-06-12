import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://beggtho-server.vercel.app', // Yerel Node.js sunucu
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    allowedHosts: [
      'https://bright-papayas-open.loca.lt', // Localtunnel host'unu ekle
    ],
  },
});
