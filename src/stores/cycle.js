import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useGasApi } from '@/composables/useGasApi'
import { useCyclePrediction } from '@/composables/useCyclePrediction'
import { useHijriDate } from '@/composables/useHijriDate'

/**
 * Cycle Store — State Machine Mode Haid + Siklus Tracker
 * 
 * State Machine:
 * IDLE → [mulaiHaid()] → HAID_ACTIVE
 * HAID_ACTIVE → [selesaiHaid()] → HAID_ENDED
 * HAID_ENDED → [sistem hitung qadha] → IDLE
 */
export const useCycleStore = defineStore('cycle', () => {
  const { get: lsGet, set: lsSet } = useLocalStorage()
  const { post: gasPost } = useGasApi()
  const { predict, daysUntilNextPeriod } = useCyclePrediction()
  const { isRamadhan } = useHijriDate()

  // State
  const cycleLogs = ref(lsGet('imani_cycle_logs', [])) // array dari cycle log objects
  const haidState = ref(lsGet('imani_cycle_haid_state', 'IDLE')) // 'IDLE' | 'HAID_ACTIVE' | 'HAID_ENDED'
  const currentHaidStart = ref(lsGet('imani_cycle_current_haid_start', null))
  const mood = ref(lsGet('imani_cycle_mood_today', null))
  const symptoms = ref(lsGet('imani_cycle_symptoms_today', []))
  const dailyLogs = ref(lsGet('imani_cycle_daily_logs', {})) // { 'YYYY-MM-DD': { mood, symptoms, note } }
  const initialAvgCycle = ref(lsGet('imani_cycle_init_avg_cycle', 28))
  const initialAvgPeriod = ref(lsGet('imani_cycle_init_avg_period', 6))
  const lastPeriodDate = ref(lsGet('imani_cycle_last_period_date', null))

  // Computed
  const isHaidActive = computed(() => haidState.value === 'HAID_ACTIVE')

  // Alias for template use
  const cycles = cycleLogs

  const currentHaidDay = computed(() => {
    if (!isHaidActive.value || !currentHaidStart.value) return 0
    return Math.floor((Date.now() - new Date(currentHaidStart.value).getTime()) / 86400000) + 1
  })

  const avgPeriodDays = computed(() => {
    if (cycleLogs.value.length >= 2) {
      const durations = cycleLogs.value.filter(l => l.duration_days).map(l => l.duration_days)
      return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    }
    return initialAvgPeriod.value
  })

  const prediction = computed(() => predict(cycleLogs.value))

  const daysUntilNext = computed(() => {
    return daysUntilNextPeriod(prediction.value.nextPeriodDate)
  })

  const cycleStatusText = computed(() => {
    if (isHaidActive.value) {
      const start = new Date(currentHaidStart.value)
      const today = new Date()
      const dayNum = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1
      return `Hari ke-${dayNum} Haid`
    }

    const days = daysUntilNext.value
    if (days === null) return 'Belum ada data siklus'
    if (days <= 0) return 'Perkiraan haid hari ini'
    if (days <= 5) return `H-${days} Prediksi Haid`

    const lastLog = cycleLogs.value[cycleLogs.value.length - 1]
    if (!lastLog) return 'Belum ada data siklus'
    const lastStart = new Date(lastLog.start_date)
    const today = new Date()
    const cycleDay = Math.floor((today - lastStart) / (1000 * 60 * 60 * 24)) + 1
    return `Hari ke-${cycleDay} Siklus`
  })

  // Actions

  /**
   * Mulai Mode Haid
   * @param {string} date - YYYY-MM-DD, default hari ini
   */
  function mulaiHaid(date = null) {
    const startDate = date || new Date().toISOString().split('T')[0]
    haidState.value = 'HAID_ACTIVE'
    currentHaidStart.value = startDate
    lsSet('imani_cycle_haid_state', 'HAID_ACTIVE')
    lsSet('imani_cycle_current_haid_start', startDate)
  }

  /**
   * Selesai Mode Haid — hitung qadha otomatis jika bulan Ramadhan
   * @param {string} date - YYYY-MM-DD end date, default hari ini
   * @returns {{ qadhaAdded: number, isRamadhan: boolean }}
   */
  function selesaiHaid(date = null) {
    const endDate = date || new Date().toISOString().split('T')[0]
    const startDate = currentHaidStart.value

    if (!isHaidActive.value || !startDate) {
      return { success: false, qadhaAdded: 0, duringRamadhan: false, durationDays: 0, message: 'Mode haid belum aktif.' }
    }

    if (endDate < startDate) {
      return { success: false, qadhaAdded: 0, duringRamadhan: false, durationDays: 0, message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.' }
    }

    // Hitung durasi haid
    const start = new Date(startDate)
    const end = new Date(endDate)
    const durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1

    // Buat log baru
    const newLog = {
      log_id: `cycle_${Date.now()}`,
      start_date: startDate,
      end_date: endDate,
      duration_days: durationDays,
      mood: mood.value,
      symptoms: [...symptoms.value],
      notes: '',
      created_at: new Date().toISOString(),
    }

    cycleLogs.value.push(newLog)
    // Simpan hanya 12 logs terakhir
    if (cycleLogs.value.length > 12) {
      cycleLogs.value = cycleLogs.value.slice(-12)
    }

    // Cek apakah bulan Ramadhan → hitung qadha otomatis
    let qadhaAdded = 0
    const duringRamadhan = isRamadhan(new Date(startDate))

    if (duringRamadhan) {
      // Hitung berapa hari haid jatuh di bulan Ramadhan
      qadhaAdded = countRamadhanDays(startDate, endDate)
    }

    // Reset state
    haidState.value = 'IDLE'
    currentHaidStart.value = null
    mood.value = null
    symptoms.value = []
    lastPeriodDate.value = startDate

    saveToStorage()

    return { success: true, qadhaAdded, duringRamadhan, durationDays }
  }

  /**
   * Hitung berapa hari dalam rentang yang jatuh di bulan Ramadhan
   */
  function countRamadhanDays(startDate, endDate) {
    let count = 0
    const current = new Date(startDate)
    const end = new Date(endDate)

    while (current <= end) {
      if (isRamadhan(new Date(current))) count++
      current.setDate(current.getDate() + 1)
    }

    return count
  }

  function getDailyLog(date) {
    return dailyLogs.value[date] || null
  }

  function isHaidOnDate(date) {
    // Check if the date falls within any logged haid period
    const inHistory = cycleLogs.value.some(c => {
      if (!c.start_date || !c.end_date) return false
      return date >= c.start_date && date <= c.end_date
    })
    if (inHistory) return true
    // Check current active haid
    if (isHaidActive.value && currentHaidStart.value) {
      return date >= currentHaidStart.value && date <= new Date().toISOString().split('T')[0]
    }
    return false
  }

  function saveDailyLog({ date, mood: m, symptoms: s, note }) {
    dailyLogs.value[date] = { mood: m, symptoms: s, note, updatedAt: Date.now() }
    lsSet('imani_cycle_daily_logs', dailyLogs.value)
    // Also update store-level mood/symptoms if today
    const today = new Date().toISOString().split('T')[0]
    if (date === today) {
      mood.value = m
      symptoms.value = s
      lsSet('imani_cycle_mood_today', m)
      lsSet('imani_cycle_symptoms_today', s)
    }
  }

  function setMood(moodValue) {
    mood.value = moodValue
    lsSet('imani_cycle_mood_today', moodValue)
  }

  function toggleSymptom(symptom) {
    const idx = symptoms.value.indexOf(symptom)
    if (idx === -1) {
      symptoms.value.push(symptom)
    } else {
      symptoms.value.splice(idx, 1)
    }
    lsSet('imani_cycle_symptoms_today', symptoms.value)
  }

  function saveToStorage() {
    lsSet('imani_cycle_logs', cycleLogs.value)
    lsSet('imani_cycle_haid_state', haidState.value)
    lsSet('imani_cycle_current_haid_start', currentHaidStart.value)
    lsSet('imani_cycle_daily_logs', dailyLogs.value)
    lsSet('imani_cycle_init_avg_cycle', initialAvgCycle.value)
    lsSet('imani_cycle_init_avg_period', initialAvgPeriod.value)
    if (lastPeriodDate.value) lsSet('imani_cycle_last_period_date', lastPeriodDate.value)
  }

  function loadFromStorage() {
    cycleLogs.value = lsGet('imani_cycle_logs', [])
    haidState.value = lsGet('imani_cycle_haid_state', 'IDLE')
    currentHaidStart.value = lsGet('imani_cycle_current_haid_start', null)
    mood.value = lsGet('imani_cycle_mood_today', null)
    symptoms.value = lsGet('imani_cycle_symptoms_today', [])
    dailyLogs.value = lsGet('imani_cycle_daily_logs', {})
    initialAvgCycle.value = lsGet('imani_cycle_init_avg_cycle', 28)
    initialAvgPeriod.value = lsGet('imani_cycle_init_avg_period', 6)
    lastPeriodDate.value = lsGet('imani_cycle_last_period_date', null)
  }

  async function syncToBackend(userId) {
    if (!userId || cycleLogs.value.length === 0) return
    const lastLog = cycleLogs.value[cycleLogs.value.length - 1]
    try {
      await gasPost('saveCycleLog', {
        userId,
        startDate: lastLog.start_date,
        endDate: lastLog.end_date,
        mood: lastLog.mood,
        symptoms: lastLog.symptoms,
      })
    } catch (err) {
      console.error('[cycleStore] Sync gagal:', err)
    }
  }

  return {
    cycleLogs, cycles, haidState, currentHaidStart, mood, symptoms,
    dailyLogs, initialAvgCycle, initialAvgPeriod, lastPeriodDate,
    isHaidActive, prediction, daysUntilNext, cycleStatusText, currentHaidDay, avgPeriodDays,
    mulaiHaid, selesaiHaid, setMood, toggleSymptom,
    getDailyLog, isHaidOnDate, saveDailyLog,
    saveToStorage, loadFromStorage, syncToBackend,
  }
})
