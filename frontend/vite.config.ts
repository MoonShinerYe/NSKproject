import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages для project-сайта отдаёт файлы из /<repo>/, поэтому база задаётся env-переменной.
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const base = isGitHubPages ? '/NSKproject/' : '/'

const apiProxy = {
  '/api': {
    target: process.env.VITE_API_PROXY ?? 'http://localhost:5080',
    changeOrigin: true,
  },
}

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.trycloudflare.com'],
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    host: true,
    // Публичный туннель для показа заказчику/друзьям (cloudflared quick tunnel).
    allowedHosts: ['.trycloudflare.com'],
    proxy: apiProxy,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
