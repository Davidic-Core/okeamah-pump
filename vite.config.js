import { defineConfig } from 'vite'

export default defineConfig({
  // Ensure proper base path for deployment
  base: './',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        signup: 'signup.html',
        dashboard: 'dashboard.html',
        certificate: 'certificate.html',
        invest: 'invest.html'
      },
      output: {
        manualChunks: {
          vendor: ['chart.js'],
          auth: ['@supabase/supabase-js'],
          payment: ['@stripe/stripe-js']
        },
        // Ensure consistent naming for assets
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})