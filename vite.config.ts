import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'ios/180.png', 'ios/192.png'],
      manifest: {
        name: 'Barcode Scanner POC',
        short_name: 'Scanner POC',
        description: 'A high-performance barcode scanner web application for warehouse operations',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          // Android icons
          {
            src: 'android/android-launchericon-48-48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-72-72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-96-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-144-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          // iOS icons
          {
            src: 'ios/57.png',
            sizes: '57x57',
            type: 'image/png'
          },
          {
            src: 'ios/60.png',
            sizes: '60x60',
            type: 'image/png'
          },
          {
            src: 'ios/72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'ios/76.png',
            sizes: '76x76',
            type: 'image/png'
          },
          {
            src: 'ios/114.png',
            sizes: '114x114',
            type: 'image/png'
          },
          {
            src: 'ios/120.png',
            sizes: '120x120',
            type: 'image/png'
          },
          {
            src: 'ios/144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'ios/152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'ios/180.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: 'ios/192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'ios/512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          // Maskable icons for better Android support
          {
            src: 'android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          }
        ]
      }
    })
  ],
})
