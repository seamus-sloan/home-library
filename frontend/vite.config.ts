import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/users': 'http://localhost:3000',
      '/books': 'http://localhost:3000',
      '/journals': 'http://localhost:3000',
    },
  },
  plugins: [react()],
})

