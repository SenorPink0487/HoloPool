import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 3001, strictPort: true },
  build: {
    target: 'es2022',
  },
});
