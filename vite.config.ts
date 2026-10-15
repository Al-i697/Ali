import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// واجهة سجلي (SPA). المصدر في src/web والناتج في dist/web ليخدمه الخادم نفسه.
export default defineConfig({
  root: r('./src/web'),
  publicDir: r('./public'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@shared': r('./src/shared'), '@': r('./src/web') },
  },
  build: {
    outDir: r('./dist/web'),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: false } },
  },
});
