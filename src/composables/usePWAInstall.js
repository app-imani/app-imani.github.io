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
  // ── Install prompt ──
  const canInstall = computed(
    () => !!deferredPrompt.value && !installDismissed.value && !isInstalled.value
  )

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
    // Install
    canInstall,
    isInstalled,
    triggerInstall,
    dismissInstall,
    // SW Update
    needRefresh,
    offlineReady,
    applyUpdate,
    dismissUpdate,
  }
}
