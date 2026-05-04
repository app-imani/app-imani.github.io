import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useGasApi } from '@/composables/useGasApi'

// Status sholat yang valid
const PRAYER_STATUSES = ['tepat_waktu', 'terlambat', 'berjamaah', 'munfarid', 'skip', null]

/**
 * Store Prayer — Sholat tracker & jadwal
 */
export const usePrayerStore = defineStore('prayer', () => {
  const { get: lsGet, set: lsSet } = useLocalStorage()
  const { get: gasGet, post: gasPost } = useGasApi()

  // State
  const logs = ref(lsGet('imani_prayer_logs', {})) // { 'YYYY-MM-DD': { fajr, dhuhr, ... } }
  const streak = ref(lsGet('imani_prayer_streak', 0))
  const todaySchedule = ref(null)

  const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

  // Computed
  const todayLog = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return logs.value[today] || createEmptyLog()
  })

  const todayCompletionCount = computed(() => {
    const log = todayLog.value
    return PRAYERS.filter((p) => log[p] && log[p] !== 'skip').length
  })

  const isTodayComplete = computed(() => todayCompletionCount.value === 5)

  // Actions
  function createEmptyLog(isUdzur = false) {
    return {
      fajr: null,
      dhuhr: null,
      asr: null,
      maghrib: null,
      isha: null,
      is_udzur: isUdzur,
      notes: '',
    }
  }

  /**
   * Set status satu sholat untuk tanggal tertentu
   * @param {string} prayer - 'fajr'|'dhuhr'|'asr'|'maghrib'|'isha'
   * @param {string|null} status
   * @param {string} date - YYYY-MM-DD
   */
  function setPrayerStatus(prayer, status, date = null) {
    const dateKey = date || new Date().toISOString().split('T')[0]

    if (!logs.value[dateKey]) {
      logs.value[dateKey] = createEmptyLog()
    }

    logs.value[dateKey][prayer] = status
    saveToStorage()
    updateStreak()
  }

  /**
   * Set semua sholat sebagai udzur (Mode Haid)
   * @param {string} date - YYYY-MM-DD
   */
  function setUdzur(date = null) {
    const dateKey = date || new Date().toISOString().split('T')[0]
    logs.value[dateKey] = createEmptyLog(true)
    saveToStorage()
  }

  /**
   * Update streak berdasarkan log
   */
  function updateStreak() {
    let currentStreak = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const log = logs.value[dateKey]

      if (!log) break // Tidak ada log = rantai streak putus

      // Mode haid tidak memutus streak
      if (log.is_udzur) {
        currentStreak++
        continue
      }

      const completedCount = PRAYERS.filter((p) => log[p] && log[p] !== 'skip').length
      if (completedCount === 5) {
        currentStreak++
      } else {
        break
      }
    }

    streak.value = currentStreak
    lsSet('imani_prayer_streak', currentStreak)
  }

  function saveToStorage() {
    lsSet('imani_prayer_logs', logs.value)
  }

  function loadFromStorage() {
    logs.value = lsGet('imani_prayer_logs', {})
    streak.value = lsGet('imani_prayer_streak', 0)
  }

  /**
   * Sync log ke GAS backend
   */
  async function syncToBackend(date, userId) {
    if (!userId) return
    const dateKey = date || new Date().toISOString().split('T')[0]
    const log = logs.value[dateKey]
    if (!log) return

    try {
      await gasPost('savePrayerLog', {
        userId,
        date: dateKey,
        prayers: log,
        isUdzur: log.is_udzur,
      })
    } catch (err) {
      console.error('[prayerStore] Sync gagal:', err)
    }
  }

  /**
   * Ambil log dari GAS backend
   */
  async function fetchFromBackend(date, userId) {
    if (!userId) return
    const dateKey = date || new Date().toISOString().split('T')[0]

    try {
      const data = await gasGet('getPrayerLog', { userId, date: dateKey })
      if (data) {
        logs.value[dateKey] = data
        saveToStorage()
      }
    } catch (err) {
      console.error('[prayerStore] Fetch gagal:', err)
    }
  }

  return {
    logs, streak, todaySchedule, todayLog, todayCompletionCount, isTodayComplete,
    PRAYERS, setPrayerStatus, setUdzur, updateStreak, saveToStorage, loadFromStorage,
    // Convenience aliases used by views
    setStatus: (key, status, date = null) => setPrayerStatus(key, status, date),
    getStatus: (date, key) => logs.value[date]?.[key] || null,
    getTodayStatus: (key) => logs.value[new Date().toISOString().split('T')[0]]?.[key] || null,
    syncToBackend, fetchFromBackend,
  }
})
