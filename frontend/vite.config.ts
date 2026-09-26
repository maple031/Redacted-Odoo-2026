import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// VITE_PROXY_TARGET is injected by Docker Compose (http://backend:8080).
// When running locally outside Docker, it defaults to http://localhost:8080.
// All frontend API calls use relative /api/... paths — the proxy handles routing.
const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,          // Required to accept connections from outside the container.
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
