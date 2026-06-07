import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import scanApi from './vite/plugins/scan-api'

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
  plugins: [
    react(),
    scanApi()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@xyflow')) {
              return 'react-flow'
            }
            if (id.includes('lucide-react')) {
              return 'lucide'
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-core'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
