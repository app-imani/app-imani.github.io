import { ref } from 'vue'

/**
 * useNotification — Web Notifications API wrapper
 * Untuk reminder waktu sholat dan pengingat amalan
 */
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
      icon: '/imani-frontend/icons/icon-192x192.png',
      badge: '/imani-frontend/icons/icon-192x192.png',
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

  return {
    isSupported,
    permission,
    requestPermission,
    send,
    schedulePrayerReminder,
  }
}
