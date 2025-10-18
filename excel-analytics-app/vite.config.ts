import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and React DOM
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor'
          }
          
          // Chart libraries
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts'
          }
          
          // Excel parsing library
          if (id.includes('xlsx')) {
            return 'excel-parser'
          }
          
          // UI libraries
          if (id.includes('lucide-react') || id.includes('tailwindcss')) {
            return 'ui-vendor'
          }
          
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          
          // Component chunks
          if (id.includes('/components/')) {
            const componentName = id.split('/components/')[1].split('/')[0]
            return `component-${componentName}`
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            return `assets/[name]-[hash].js`
          }
          return 'assets/[name]-[hash].js'
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'chart.js', 'react-chartjs-2'],
    exclude: ['xlsx'],
    force: true
  },
  define: {
    // Fix module resolution issues
    global: 'globalThis'
  }
})

