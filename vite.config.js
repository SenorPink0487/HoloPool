import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  server: { port: 3001, strictPort: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        game: fileURLToPath(new URL('./index.html', import.meta.url)),
        showcase: fileURLToPath(new URL('./showcase.html', import.meta.url)),
      },
    },
  },
});
