import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev-сервер проксирует API на .NET-бэкенд, чтобы фронт и бэк жили на одном origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://localhost:5080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
