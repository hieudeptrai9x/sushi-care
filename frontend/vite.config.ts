import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE_PATH || '/baby-care/',
  plugins: command === 'serve' ? [react()] : [],
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:8080', '/uploads': 'http://127.0.0.1:8080' },
  },
  build: { outDir: 'dist', sourcemap: false },
}))
