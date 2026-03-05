import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,      // Устанавливаем порт 3000
    strictPort: true, // Если порт 3000 занят, Vite не будет пробовать другой
    host: true       // Позволяет подключаться к серверу извне (нужно для Docker)
  }
})