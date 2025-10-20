import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // kullanıyorsan şunları da aç:
      // '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      // '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
})
