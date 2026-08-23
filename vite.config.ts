import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'android-icon-192x192.png', 'favicon-32x32.png'],
      manifest: {
        name: 'Christian Awareness Embassy',
        short_name: 'CAE',
        description: 'Raising a generation of believers who know God, walk in His word, and impact their world for Christ.',
        theme_color: '#03060a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ]
})
