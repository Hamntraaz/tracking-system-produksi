import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // penting untuk URL VS Code Port Forward / dev tunnel agar tidak diblokir Vite
    allowedHosts: true,
    proxy: {
      // Frontend cukup panggil /api. Vite akan teruskan ke backend lokal.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
