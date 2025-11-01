/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/books': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/journals': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/tags': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/genres': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/lists': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          // Only proxy API requests, not page navigation
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html'
          }
        },
      },
    },
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})

