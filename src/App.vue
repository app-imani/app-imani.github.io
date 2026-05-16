<template>
  <div id="app" :class="appThemeClass">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
    <ToastNotif />
    <RewardAnimation />
    <AudioPlayer />
    <PWAUpdateBanner />
    <PWAInstallBanner />
    <VersionMigrationOverlay />
    <MilestoneCelebration />
    <!-- IMPR-08: Email verification banner -->
    <Teleport to="body">
      <div
        v-if="authStore.user && authStore.user.emailVerified === false && !dismissedEmailBanner"
        class="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg"
      >
        <p class="text-xs font-medium flex-1 leading-relaxed">📧 Cek emailmu! Kami mengirim link verifikasi. Verifikasi dulu agar akunmu aman.</p>
        <button @click="dismissedEmailBanner = true" class="shrink-0 text-white/80 text-xs underline">Nanti</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref } from 'vue'
import { useCycleStore } from '@/stores/cycle'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import ToastNotif from '@/components/ui/ToastNotif.vue'
import RewardAnimation from '@/components/ui/RewardAnimation.vue'
import AudioPlayer from '@/components/ui/AudioPlayer.vue'
import PWAInstallBanner from '@/components/ui/PWAInstallBanner.vue'
import PWAUpdateBanner from '@/components/ui/PWAUpdateBanner.vue'
import VersionMigrationOverlay from '@/components/ui/VersionMigrationOverlay.vue'
import MilestoneCelebration from '@/components/ui/MilestoneCelebration.vue'
import { useOfflineSync } from '@/composables/useOfflineSync'
import { useGasApi } from '@/composables/useGasApi'
import { useVersionGuard } from '@/composables/useVersionGuard'
import { useNotification } from '@/composables/useNotification'

const cycleStore = useCycleStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const dismissedEmailBanner = ref(false)
const { watchOnline } = useOfflineSync()
const { post: gasPost } = useGasApi()
const { checkVersion } = useVersionGuard()
const { permission, scheduleForToday } = useNotification()

const appThemeClass = computed(() => ({
  'theme-haid': cycleStore.isHaidActive,
}))

// IMPR-03: Apply dark mode based on colorScheme setting
const _mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function applyTheme(scheme) {
  const isDark = scheme === 'dark' || (scheme === 'system' && _mq?.matches)
  document.documentElement.classList.toggle('dark', isDark)
}

watch(() => settingsStore.colorScheme, (scheme) => applyTheme(scheme), { immediate: true })

watch(
  () => cycleStore.isHaidActive,
  (isHaid) => {
    document.body.classList.toggle('theme-haid', isHaid)
  },
  { immediate: true }
)

// IMPR-13 AC-05: Pre-fetch Hijri dates for today + next 6 days so they're cached offline
async function _prefetchHijri() {
  try {
    const { useHijriDate } = await import('@/composables/useHijriDate')
    const { toHijri } = useHijriDate()
    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + i)
      toHijri(d)
    }
  } catch { /* non-critical */ }
}

// IMPR-01: Schedule prayer reminders for today, re-schedule when tab becomes visible
async function _trySchedulePrayerReminders() {
  if (permission.value !== 'granted') return
  try {
    const { usePrayerTimes } = await import('@/composables/usePrayerTimes')
    const { fetchByCoords, fetchByCity, prayerTimes } = usePrayerTimes()
    // Read correct LS keys (individual imani_settings_* keys)
    const notifPrayer = localStorage.getItem('imani_settings_notif_prayer')
    if (notifPrayer === 'false') return
    const reminderMinutes = parseInt(localStorage.getItem('imani_settings_prayer_reminder_minutes') || '10', 10)
    const locationRaw = localStorage.getItem('imani_settings_location')
    const location = locationRaw ? JSON.parse(locationRaw) : {}
    const lat = location.latitude
    const lng = location.longitude
    const city = location.city
    const country = location.country || 'Indonesia'

    // Attempt fetch by coords if available, else by city
    if (lat && lng) {
      await fetchByCoords(lat, lng)
    } else if (city) {
      await fetchByCity(city, country)
    }
    if (prayerTimes.value) {
      scheduleForToday(prayerTimes.value, reminderMinutes)
    }
  } catch { /* non-critical */ }
}

let _visibilityHandler = null

onMounted(() => {
  cycleStore.loadFromStorage()

  // IMPR-03: Listen to system theme change
  _mq?.addEventListener('change', () => applyTheme(settingsStore.colorScheme))

  // Cek versi app — jika berubah, sync data lalu clear cache & logout
  checkVersion()

  // Setup auto-flush: kirim ulang semua queue offline saat kembali online
  // + flush langsung saat app mount jika sudah online
  watchOnline(gasPost)

  // IMPR-01: Schedule prayer reminders on boot
  _trySchedulePrayerReminders()

  // IMPR-13 AC-05: Pre-fetch Hijri dates for next 7 days
  _prefetchHijri()

  // IMPR-01: Re-schedule when tab regains focus (new day scenario)
  _visibilityHandler = () => { if (document.visibilityState === 'visible') _trySchedulePrayerReminders() }
  document.addEventListener('visibilitychange', _visibilityHandler)
})

onUnmounted(() => {
  if (_visibilityHandler) document.removeEventListener('visibilitychange', _visibilityHandler)
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
