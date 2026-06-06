import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import scanApi from './vite/plugins/scan-api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    scanApi()
  ],
})
