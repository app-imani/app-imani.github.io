import { ref } from 'vue'

/**
 * useNotification — Web Notifications API wrapper
 * Untuk reminder waktu sholat dan pengingat amalan
 */

// Module-level timeout handles so we can cancel on re-schedule (IMPR-01)
const _scheduledHandles = []

function _clearScheduled() {
  while (_scheduledHandles.length) clearTimeout(_scheduledHandles.pop())
}

export function useNotification() {
  const isSupported = 'Notification' in window
  const permission = ref(isSupported ? Notification.permission : 'denied')

  /**
   * Request izin notifikasi dari user
   * @returns {Promise<'granted'|'denied'|'default'>}
   */
  async function requestPermission() {
    if (!isSupported) return 'denied'

    const result = await Notification.requestPermission()
    permission.value = result
    return result
  }

  /**
   * Kirim local notification
   * @param {string} title
   * @param {Object} options
   */
  function send(title, options = {}) {
    if (!isSupported || permission.value !== 'granted') return null

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      lang: 'id',
      requireInteraction: false,
      ...options,
    }

    try {
      return new Notification(title, defaultOptions)
    } catch (err) {
      console.error('[useNotification] Gagal send notifikasi:', err)
      return null
    }
  }

  /**
   * Schedule notifikasi untuk waktu sholat berikutnya
   * @param {string} prayerName - nama sholat
   * @param {number} secondsBefore - berapa detik sebelum waktu sholat
   * @param {Date} prayerDate - waktu sholat
   */
  function schedulePrayerReminder(prayerName, prayerDate, secondsBefore = 300) {
    if (!prayerDate) return

    const now = new Date()
    const reminderTime = new Date(prayerDate.getTime() - secondsBefore * 1000)
    const delay = reminderTime.getTime() - now.getTime()

    if (delay <= 0) return

    setTimeout(() => {
      send(`🕌 ${prayerName} dalam ${Math.round(secondsBefore / 60)} menit`, {
        body: `Waktunya bersiap untuk sholat ${prayerName}`,
        tag: `prayer-${prayerName}`,
        renotify: true,
      })
    }, delay)
  }

  /**
   * IMPR-01: Schedule reminder untuk semua sholat hari ini.
   * Cancels any previously scheduled reminders first.
   *
   * @param {Object} prayers - { Fajr, Dhuhr, Asr, Maghrib, Isha } dengan nilai string "HH:mm"
   * @param {number} reminderMinutes - menit sebelum adzan untuk notifikasi
   */
  function scheduleForToday(prayers, reminderMinutes = 5) {
    if (!isSupported || permission.value !== 'granted') return
    _clearScheduled()

    const PRAYER_NAMES = {
      Fajr: 'Subuh', Sunrise: 'Syuruq', Dhuhr: 'Dzuhur',
      Asr: 'Ashar', Maghrib: 'Maghrib', Isha: 'Isya',
    }
    const REMIND_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)

    REMIND_KEYS.forEach(key => {
      const timeStr = prayers[key]
      if (!timeStr) return

      const [h, m] = timeStr.split(':').map(Number)
      const prayerDate = new Date(`${todayStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
      const reminderDate = new Date(prayerDate.getTime() - reminderMinutes * 60 * 1000)
      const delay = reminderDate.getTime() - now.getTime()

      if (delay <= 0) return  // already passed

      const label = PRAYER_NAMES[key] || key
      const handle = setTimeout(() => {
        send(`🕌 ${label} ${reminderMinutes} menit lagi`, {
          body: `Waktunya bersiap untuk sholat ${label}`,
          tag: `prayer-${key}-today`,
          renotify: true,
        })
      }, delay)
      _scheduledHandles.push(handle)
    })

    console.log(`[useNotification] Dijadwalkan ${_scheduledHandles.length} reminder sholat hari ini`)
  }

  return {
    isSupported,
    permission,
    requestPermission,
    send,
    schedulePrayerReminder,
    scheduleForToday,
  }
}
