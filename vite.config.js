import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/snake-3d/',
  root: 'src',
  publicDir: '../public',
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  }
}); 