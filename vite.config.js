import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  define: {
    // Tersedia di semua file JS sebagai konstanta build-time
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_BUILD__: JSON.stringify(Date.now().toString()),
  },
  // Wajib untuk GitHub Pages deployment
  base: '/',

  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'favicon.svg', '*.png', 'icons/*.png', 'offline.html'],
      manifest: {
        id: '/',
        name: 'Imani — Muslimah Daily Tracker',
        short_name: 'Imani',
        description: 'Tracker ibadah harian, siklus, sholat, Al-Quran, dan amalan untuk Muslimah',
        theme_color: '#863bff',
        background_color: '#f8fafc',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/?utm_source=pwa',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
          // Legacy paths kept for backward compat
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['lifestyle', 'health', 'religion'],
        lang: 'id',
        dir: 'ltr',
        prefer_related_applications: false,
        shortcuts: [
          {
            name: 'Amalan Harian',
            short_name: 'Amalan',
            description: 'Buka tracker amalan harian',
            url: '/#/amal',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Jadwal Sholat',
            short_name: 'Sholat',
            description: 'Cek jadwal sholat hari ini',
            url: '/#/prayer',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
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
