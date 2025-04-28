import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5002',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5002',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://localhost:5002',
          changeOrigin: true,
          ws: true,
        },
      }
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === 'development',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['react-hot-toast', 'zustand'],
          }
        }
      }
    },
    define: {
      // Make environment variables available to the client
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  }
})
