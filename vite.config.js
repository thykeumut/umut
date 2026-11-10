import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Geliştirme sırasında http://localhost:5173/
// Yayında kendi alan adında (kök dizin): https://thyke.me/
export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
}))
