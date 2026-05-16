import { ref } from 'vue'
import { useLocalStorage } from './useLocalStorage'

const CACHE_KEY_PREFIX = 'imani_prayer_schedule_'

/**
 * Hapus cache prayer times lama (format key tanpa method suffix)
 * Dipanggil satu kali saat pertama load untuk cleanup IMPR-04 migration
 */
function _cleanLegacyCacheKeys() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(k => {
      // key lama: imani_prayer_schedule_{date}_{lat}_{lng} (tanpa method suffix)
      if (k.startsWith(CACHE_KEY_PREFIX)) {
        // key baru mempunyai 4 segment dipisah _, key lama hanya 3
        const suffix = k.replace(CACHE_KEY_PREFIX, '')
        const parts = suffix.split('_')
        if (parts.length === 3) {
          localStorage.removeItem(k)
        }
      }
    })
  } catch { /* */ }
}

_cleanLegacyCacheKeys()

/**
 * usePrayerTimes — Fetch dan cache jadwal sholat dari Aladhan API
 * Fallback ke cache localStorage jika offline
 */
export function usePrayerTimes() {
  const prayerTimes = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const { get: lsGet, set: lsSet } = useLocalStorage()

  /** Ambil metode kalkulasi dari settingsStore (lazy import untuk hindari circular dep) */
  function _getMethod() {
    try {
      // Langsung baca dari localStorage agar tidak perlu import store
      const raw = localStorage.getItem('imani_settings_calc_method')
      const parsed = raw !== null ? parseInt(raw, 10) : NaN
      return Number.isFinite(parsed) ? parsed : 20
    } catch {
      return 20 // default: Kemenag Indonesia
    }
  }

  /**
   * Fetch jadwal sholat berdasarkan koordinat
   * @param {number} latitude
   * @param {number} longitude
   * @param {string} date - format YYYY-MM-DD, default hari ini
   */
  async function fetchByCoords(latitude, longitude, date = null) {
    const today = date || new Date().toISOString().split('T')[0]
    const method = _getMethod()
    // IMPR-04: sertakan method dalam cache key agar berbeda antar metode
    const cacheKey = `${CACHE_KEY_PREFIX}${today}_${Math.round(latitude * 10)}_${Math.round(longitude * 10)}_${method}`

    // Cek cache dulu (offline-first)
    const cached = lsGet(cacheKey)
    if (cached) {
      prayerTimes.value = cached
      return cached
    }

    isLoading.value = true
    error.value = null

    try {
      const [year, month, day] = today.split('-')
      // IMPR-04: gunakan method dari settings, bukan hardcode 20
      const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=${method}`

      const response = await fetch(url)
      if (!response.ok) throw new Error(`Aladhan API error: ${response.status}`)

      const json = await response.json()
      if (json.code !== 200) throw new Error(json.status || 'Gagal fetch jadwal sholat')

      const timings = json.data.timings
      const result = {
        Fajr: timings.Fajr,
        Sunrise: timings.Sunrise,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
        date: today,
        meta: json.data.meta,
      }

      // Simpan ke cache localStorage
      lsSet(cacheKey, result)
      prayerTimes.value = result
      return result
    } catch (err) {
      error.value = err.message
      console.error('[usePrayerTimes] Gagal fetch:', err)

      // Fallback: cek cache hari sebelumnya
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayKey = `${CACHE_KEY_PREFIX}${yesterday.toISOString().split('T')[0]}_${Math.round(latitude * 10)}_${Math.round(longitude * 10)}_${method}`
      const yesterdayCache = lsGet(yesterdayKey)
      if (yesterdayCache) {
        prayerTimes.value = yesterdayCache
        return yesterdayCache
      }

      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch jadwal sholat berdasarkan nama kota
   * @param {string} city
   * @param {string} country
   */
  async function fetchByCity(city, country = 'Indonesia', date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0]
    const method = _getMethod()
    const cacheKey = `${CACHE_KEY_PREFIX}${targetDate}_${city.toLowerCase()}_${method}`

    const cached = lsGet(cacheKey)
    if (cached) {
      prayerTimes.value = cached
      return cached
    }

    isLoading.value = true
    error.value = null

    try {
      const [year, month, day] = targetDate.split('-')
      // IMPR-04: gunakan method dari settings
      const url = `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`

      const response = await fetch(url)
      if (!response.ok) throw new Error(`Aladhan API error: ${response.status}`)

      const json = await response.json()
      if (json.code !== 200) throw new Error(json.status || 'Gagal fetch jadwal sholat')

      const timings = json.data.timings
      const result = {
        Fajr: timings.Fajr,
        Sunrise: timings.Sunrise,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
        date: targetDate,
        meta: json.data.meta,
      }

      lsSet(cacheKey, result)
      prayerTimes.value = result
      return result
    } catch (err) {
      error.value = err.message
      console.error('[usePrayerTimes] Gagal fetch by city:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Hitung waktu sholat berikutnya dari jadwal hari ini
   * @param {Object} timings - objek jadwal sholat
   * @returns {{ name: string, time: string, secondsLeft: number } | null}
   */
  function getNextPrayer(timings) {
    if (!timings) return null

    const prayers = [
      { name: 'Subuh', key: 'Fajr' },
      { name: 'Dzuhur', key: 'Dhuhr' },
      { name: 'Ashar', key: 'Asr' },
      { name: 'Maghrib', key: 'Maghrib' },
      { name: 'Isya', key: 'Isha' },
    ]

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    for (const prayer of prayers) {
      const [hours, minutes] = timings[prayer.key].split(':').map(Number)
      const prayerDate = new Date(`${todayStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)

      if (prayerDate > now) {
        const secondsLeft = Math.floor((prayerDate - now) / 1000)
        return {
          name: prayer.name,
          time: timings[prayer.key],
          secondsLeft,
          prayerDate,
        }
      }
    }

    // Semua sholat hari ini sudah lewat → tampilkan Subuh besok
    const [fajrH, fajrM] = timings.Fajr.split(':').map(Number)
    const tomorrowFajr = new Date(now)
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1)
    tomorrowFajr.setHours(fajrH, fajrM, 0, 0)
    return {
      name: 'Subuh',
      time: timings.Fajr,
      secondsLeft: Math.floor((tomorrowFajr - now) / 1000),
      prayerDate: tomorrowFajr,
      isTomorrow: true,
    }
  }

  /**
   * Hapus cache hari ini agar saat fetch berikutnya, API dipanggil ulang.
   * Dipakai saat user mengubah metode kalkulasi di Settings (IMPR-04).
   */
  function clearTodayCache() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const keys = Object.keys(localStorage)
      keys.forEach(k => {
        if (k.startsWith(CACHE_KEY_PREFIX) && k.includes(today)) {
          localStorage.removeItem(k)
        }
      })
    } catch { /* */ }
    prayerTimes.value = null
  }

  return { prayerTimes, isLoading, error, fetchByCoords, fetchByCity, getNextPrayer, clearTodayCache }
}
