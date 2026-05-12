/**
 * usePWAInstall — composable untuk mengelola Add to Home Screen (A2HS)
 * dan notifikasi update Service Worker.
 *
 * Cara kerja:
 * 1. Browser menembak event `beforeinstallprompt` saat syarat PWA terpenuhi
 * 2. Kita simpan event tersebut (preventDefault agar browser tidak langsung tampil)
 * 3. Saat user klik tombol install → panggil deferredPrompt.prompt()
 * 4. Service Worker update → useRegisterSW memberitahu via needRefresh
 */

import { ref, computed } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

// ────────── Install Prompt State (shared singleton) ──────────
const deferredPrompt = ref(null)
const installDismissed = ref(false)
const isInstalled = ref(false)

// ── iOS detection ──────────────────────────────────────────
// Semua browser iOS (Chrome, Firefox, Edge, Safari) menggunakan WebKit
// dan TIDAK mendukung `beforeinstallprompt`. Deteksi dilakukan via UA.
const _isIos = typeof navigator !== 'undefined'
  && (/iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)) // iPad OS 13+
  && !navigator.userAgent.includes('Windows') // exclude Windows tablet

// Tidak perlu cek isIos — cukup cek: iOS + belum standalone + belum dismiss
const iosInstallDismissed = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('imani_ios_install_dismissed') === '1'
    : false
)

// Cek apakah sudah diinstall (standalone mode)
if (typeof window !== 'undefined') {
  // Match media untuk standalone (Android/Desktop)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  // iOS Safari standalone
  const isIosStandalone = window.navigator.standalone === true
  isInstalled.value = isStandalone || isIosStandalone

  if (!isInstalled.value) {
    // Tangkap event sebelum browser tampilkan prompt default
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
    })

    // Saat berhasil diinstall
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      deferredPrompt.value = null
      installDismissed.value = false
    })
  }
}

export function usePWAInstall() {
  // ── Install prompt (Android / Desktop Chrome) ──
  const canInstall = computed(
    () => !!deferredPrompt.value && !installDismissed.value && !isInstalled.value
  )

  // ── iOS manual install guide ──
  // iOS tidak punya beforeinstallprompt; tampilkan instruksi Share → Add to Home Screen
  const isIos = _isIos
  const canInstallIos = computed(
    () => _isIos && !isInstalled.value && !iosInstallDismissed.value
  )

  function dismissIosInstall() {
    iosInstallDismissed.value = true
    try { localStorage.setItem('imani_ios_install_dismissed', '1') } catch { /* */ }
  }

  async function triggerInstall() {
    if (!deferredPrompt.value) return false
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    if (outcome === 'accepted') {
      isInstalled.value = true
      return true
    }
    return false
  }

  function dismissInstall() {
    installDismissed.value = true
    deferredPrompt.value = null
  }

  // ── SW Update ──
  const {
    needRefresh,    // ref<boolean> — ada versi baru
    offlineReady,   // ref<boolean> — app siap offline
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Cek update periodik setiap 1 jam
      if (r) setInterval(() => r.update(), 60 * 60 * 1000)
    },
  })

  function applyUpdate() {
    updateServiceWorker(true)
  }

  function dismissUpdate() {
    needRefresh.value = false
  }

  return {
    // Install (Android/Desktop)
    canInstall,
    isInstalled,
    triggerInstall,
    dismissInstall,
    // iOS manual install guide
    isIos,
    canInstallIos,
    dismissIosInstall,
    // SW Update
    needRefresh,
    offlineReady,
    applyUpdate,
    dismissUpdate,
  }
}
