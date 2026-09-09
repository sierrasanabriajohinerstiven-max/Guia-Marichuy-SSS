import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // No publicar sourcemaps del código fuente en producción.
    sourcemap: false,
    target: 'es2020',
    // Eliminar console/debugger del bundle de producción.
    minify: 'esbuild',
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
}));
