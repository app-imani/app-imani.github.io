import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // Wajib untuk GitHub Pages deployment
  base: '/',

  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'icons/*.png', 'offline.html'],
      manifest: {
        name: 'Imani — Muslimah Daily Tracker',
        short_name: 'Imani',
        description: 'Muslimah Daily Habit & Cycle Tracker',
        theme_color: '#059669',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['lifestyle', 'health', 'religion'],
        lang: 'id',
      },
      workbox: {
        navigateFallback: null,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Cache Aladhan API - jadwal sholat (stale while revalidate)
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'aladhan-api-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache Quran.com API - teks Al-Quran
          {
            urlPattern: /^https:\/\/api\.quran\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'quran-api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache audio murottal EveryAyah - CacheFirst max 50
          {
            urlPattern: /^https:\/\/everyayah\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-murottal-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
