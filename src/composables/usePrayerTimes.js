import { ref } from 'vue'
import { useLocalStorage } from './useLocalStorage'

const CACHE_KEY_PREFIX = 'imani_prayer_schedule_'

/**
 * usePrayerTimes — Fetch dan cache jadwal sholat dari Aladhan API
 * Fallback ke cache localStorage jika offline
 */
export function usePrayerTimes() {
  const prayerTimes = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const { get: lsGet, set: lsSet } = useLocalStorage()

  /**
   * Fetch jadwal sholat berdasarkan koordinat
   * @param {number} latitude
   * @param {number} longitude
   * @param {string} date - format YYYY-MM-DD, default hari ini
   */
  async function fetchByCoords(latitude, longitude, date = null) {
    const today = date || new Date().toISOString().split('T')[0]
    const cacheKey = `${CACHE_KEY_PREFIX}${today}_${Math.round(latitude * 10)}_${Math.round(longitude * 10)}`

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
      const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=20`

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
      const yesterdayKey = `${CACHE_KEY_PREFIX}${yesterday.toISOString().split('T')[0]}_${Math.round(latitude * 10)}_${Math.round(longitude * 10)}`
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
  async function fetchByCity(city, country = 'Indonesia') {
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `${CACHE_KEY_PREFIX}${today}_${city.toLowerCase()}`

    const cached = lsGet(cacheKey)
    if (cached) {
      prayerTimes.value = cached
      return cached
    }

    isLoading.value = true
    error.value = null

    try {
      const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=20`

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
    return {
      name: 'Subuh',
      time: timings.Fajr,
      secondsLeft: null,
      prayerDate: null,
    }
  }

  return { prayerTimes, isLoading, error, fetchByCoords, fetchByCity, getNextPrayer }
}
