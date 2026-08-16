import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ledgr-4qvv.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
