/**
 * useVersionGuard — Deteksi perubahan versi aplikasi dan jalankan migrasi.
 *
 * Alur kerja:
 *   1. App mount → checkVersion() dipanggil
 *   2. Bandingkan versi tersimpan di localStorage vs __APP_VERSION__ (build-time constant)
 *   3. Jika berbeda & user login → jalankan migrasi:
 *        a. Tampilkan overlay "Menyimpan data..."
 *        b. Flush semua antrian offline (useOfflineSync.flushQueue)
 *        c. Force-sync data amalan & sholat N hari terakhir ke backend
 *        d. Tunggu hingga sync selesai (atau timeout 10 detik)
 *        e. Hapus semua localStorage, IndexedDB, dan SW caches
 *        f. Firebase signOut → reload halaman
 *   4. Jika berbeda & guest → langsung clear & reload tanpa sync
 *   5. Jika sama → tidak ada yang dilakukan
 */

import { ref } from 'vue'

// Build-time constant dari vite.config.js → define.__APP_VERSION__
/* global __APP_VERSION__ */
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'

const VERSION_KEY = 'imani_app_version'

// ─── Reactive migration state (shared singleton) ──────────────────────────────
export const migrationState = {
  /** true saat proses migrasi sedang berjalan */
  active:   ref(false),
  /** Fase saat ini: 'syncing' | 'flushing' | 'clearing' | 'done' */
  phase:    ref(''),
  /** Progress 0–100 */
  progress: ref(0),
  /** Teks status yang ditampilkan ke user */
  message:  ref(''),
  /** Versi baru yang akan dipakai setelah reload */
  newVersion: ref(''),
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── MIGRATIONS registry (IMPR-09) ───────────────────────────────────────────
// Add entries here when a version needs a data transform instead of a full wipe.
// Key: 'fromVersion→toVersion' (exact semver strings), value: async transform fn.
// The transform fn receives (localStorage snapshot) and should apply changes directly.
//
// Example:
//   '1.0.0→1.1.0': async () => {
//     const old = localStorage.getItem('imani_old_key')
//     if (old) {
//       localStorage.setItem('imani_new_key', old)
//       localStorage.removeItem('imani_old_key')
//     }
//   },
export const MIGRATIONS = {
  // '<fromVersion>→<toVersion>': async () => { /* transform */ },
}

/** Auto-export JSON fallback before any destructive clear — IMPR-09 */
function _autoExportFallback() {
  try {
    const payload = { exported: new Date().toISOString(), version: 1, data: {} }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('imani_')) {
        try { payload.data[key] = JSON.parse(localStorage.getItem(key)) }
        catch { payload.data[key] = localStorage.getItem(key) }
      }
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `imani-pre-update-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch { /* ignore — backup is best-effort */ }
}

/** Hapus semua data lokal (localStorage, IndexedDB, SW caches) */
async function _clearAll() {
  migrationState.phase.value   = 'clearing'
  migrationState.message.value = 'Membersihkan data lama...'
  migrationState.progress.value = 90

  // 1. Hapus semua localStorage
  try { localStorage.clear() } catch { /* */ }

  // 2. Hapus IndexedDB imani_offline
  try {
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('imani_offline')
      req.onsuccess = resolve
      req.onerror   = resolve   // tetap lanjut meski gagal
      req.onblocked = resolve
    })
  } catch { /* */ }

  // 3. Unregister semua Service Workers
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.allSettled(regs.map(r => r.unregister()))
    } catch { /* */ }
  }

  // 4. Hapus semua SW cache storage
  if ('caches' in window) {
    try {
      const keys = await caches.keys()
      await Promise.allSettled(keys.map(k => caches.delete(k)))
    } catch { /* */ }
  }

  migrationState.progress.value = 98
}

/** Sync data ke backend sebelum clear */
async function _syncBeforeClear() {
  migrationState.phase.value    = 'syncing'
  migrationState.progress.value = 5

  const { useGasApi }     = await import('@/composables/useGasApi')
  const { useOfflineSync } = await import('@/composables/useOfflineSync')
  const { post: gasPost } = useGasApi()
  const { flushQueue }    = useOfflineSync()

  // ── Step 1: Flush antrian offline yang belum terkirim ────────────────────
  migrationState.message.value  = 'Mengirim data yang tertunda...'
  migrationState.progress.value = 10
  try {
    await Promise.race([
      flushQueue(gasPost),
      new Promise(r => setTimeout(r, 8000)), // timeout 8 detik
    ])
  } catch { /* */ }

  // ── Step 2: Force-sync amalan N hari terakhir ─────────────────────────────
  migrationState.message.value  = 'Menyimpan data amalan...'
  migrationState.progress.value = 35
  try {
    const { useAmalStore } = await import('@/stores/amal')
    const amalStore = useAmalStore()
    await Promise.race([
      amalStore.syncAllRecent(14),
      new Promise(r => setTimeout(r, 8000)),
    ])
  } catch { /* */ }

  // ── Step 3: Force-sync sholat N hari terakhir ─────────────────────────────
  migrationState.message.value  = 'Menyimpan data sholat...'
  migrationState.progress.value = 60
  try {
    const { usePrayerStore } = await import('@/stores/prayer')
    const prayerStore = usePrayerStore()
    await Promise.race([
      prayerStore.syncAllRecent(14),
      new Promise(r => setTimeout(r, 8000)),
    ])
  } catch { /* */ }

  // ── Step 4: Flush sekali lagi (tangkap sisa yang baru masuk queue) ─────────
  migrationState.message.value  = 'Memverifikasi penyimpanan...'
  migrationState.progress.value = 80
  try {
    await Promise.race([
      flushQueue(gasPost),
      new Promise(r => setTimeout(r, 5000)),
    ])
  } catch { /* */ }

  // Beri jeda singkat agar request terakhir benar-benar selesai
  await new Promise(r => setTimeout(r, 1500))
  migrationState.progress.value = 88
}

/** Firebase signOut lalu reload halaman */
async function _signOutAndReload() {
  migrationState.phase.value   = 'done'
  migrationState.message.value = 'Selesai! Memuat ulang aplikasi...'
  migrationState.progress.value = 100

  // Simpan versi baru SEBELUM clear agar tidak loop migrasi setelah reload
  try { localStorage.setItem(VERSION_KEY, APP_VERSION) } catch { /* */ }

  // Tunggu sebentar agar user bisa melihat pesan "Selesai"
  await new Promise(r => setTimeout(r, 1000))

  try {
    const { isFirebaseConfigured } = await import('@/firebase')
    if (isFirebaseConfigured) {
      const { auth }    = await import('@/firebase')
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    }
  } catch { /* */ }

  // Hard reload — paksa browser ambil semua resource terbaru
  window.location.href = window.location.origin + window.location.pathname
}

// ─── Main composable ─────────────────────────────────────────────────────────

export function useVersionGuard() {
  /**
   * Periksa apakah versi aplikasi berubah.
   * Harus dipanggil SATU KALI di App.vue → onMounted.
   */
  async function checkVersion() {
    const storedVersion = localStorage.getItem(VERSION_KEY)

    // Pertama kali install — tidak ada versi tersimpan → simpan & lanjut normal
    if (!storedVersion) {
      localStorage.setItem(VERSION_KEY, APP_VERSION)
      return
    }

    // Versi sama → tidak perlu migrasi
    if (storedVersion === APP_VERSION) return

    // ── Versi BERBEDA → mulai alur migrasi ────────────────────────────────
    console.log(`[VersionGuard] Versi berubah: ${storedVersion} → ${APP_VERSION}`)

    migrationState.active.value    = true
    migrationState.newVersion.value = APP_VERSION

    // ── IMPR-09: Coba jalankan registered migration transform dulu ─────────
    const migrationKey = `${storedVersion}→${APP_VERSION}`
    const migrationFn = MIGRATIONS[migrationKey]
    if (migrationFn) {
      try {
        migrationState.phase.value    = 'syncing'
        migrationState.message.value  = 'Memperbarui data...'
        migrationState.progress.value = 30
        await migrationFn()
        localStorage.setItem(VERSION_KEY, APP_VERSION)
        migrationState.progress.value = 100
        migrationState.active.value = false
        console.log(`[VersionGuard] Migrasi ${migrationKey} selesai tanpa wipe.`)
        return  // Selesai tanpa full clear!
      } catch (err) {
        console.warn('[VersionGuard] Migration transform gagal, fallback ke full clear:', err)
      }
    }

    // ── Fallback: full clear (dengan auto-export dulu) ─────────────────────
    _autoExportFallback()

    try {
      // Cek apakah user sedang login (bukan guest)
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()

      const isLoggedIn = authStore.user && !authStore.isGuest

      if (isLoggedIn) {
        // User login → sync dulu sebelum clear
        await _syncBeforeClear()
      } else {
        // Guest / belum login → langsung clear tanpa sync
        migrationState.phase.value   = 'clearing'
        migrationState.message.value = 'Memperbarui aplikasi...'
        migrationState.progress.value = 50
        await new Promise(r => setTimeout(r, 800))
      }

      await _clearAll()
      await _signOutAndReload()

    } catch (err) {
      console.error('[VersionGuard] Migrasi gagal:', err)
      // Fallback: hapus versi lama agar tidak loop, lalu reload
      try { localStorage.removeItem(VERSION_KEY) } catch { /* */ }
      window.location.reload()
    }
  }

  return { checkVersion, migrationState }
}
