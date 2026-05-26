import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'Transfera',
        short_name: 'Transfera',
        description: 'Equalize o estoque físico da sua loja',
        theme_color: '#185FA5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/transfera/',
        start_url: '/transfera/',
        icons: [
  { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
  { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
]
        ]
      }
    })
  ],
  base: '/transfera/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'xlsx-vendor': ['xlsx'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'icons-vendor': ['@tabler/icons-react'],
        }
      }
    }
  }
})