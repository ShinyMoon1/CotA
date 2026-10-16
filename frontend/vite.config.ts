import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // host: true → слушать 0.0.0.0 (IPv4+IPv6): Firefox резолвит
    // localhost в 127.0.0.1, без этого Vite на ::1 теряет соединение.
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.io',
      'localhost',
    ],
    proxy: {
      // Dev-прокси: в Go-бэкенде нет префикса /api, поэтому rewrite
      // срезает его перед отправкой на :8080.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Не инлайнить шрифты в base64: Firefox отвергает инлайненные
    // woff2 санитайзером (rejected by sanitizer).
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'telegram-ui': ['@telegram-apps/telegram-ui'],
        },
      },
    },
  },
});
