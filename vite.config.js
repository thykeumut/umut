import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Geliştirme sırasında http://localhost:5173/
// Yayında (GitHub Pages) https://thykeumut.github.io/umut/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/umut/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
}))
