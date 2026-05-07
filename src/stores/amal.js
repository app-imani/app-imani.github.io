import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useGasApi } from '@/composables/useGasApi'
import { useOfflineSync } from '@/composables/useOfflineSync'

/**
 * Store Amal — Dzikir, doa, dan amalan harian
 */
export const useAmalStore = defineStore('amal', () => {
  const { get: lsGet, set: lsSet } = useLocalStorage()
  const { post: gasPost } = useGasApi()
  const { offlineSave } = useOfflineSync()

  // State
  const logs = ref(lsGet('imani_amal_logs', {})) // { 'YYYY-MM-DD': { ... } }
  const tasbihSession = ref(lsGet('imani_tasbih_session', { count: 0, target: 33, label: 'Subhanallah' }))

  // Computed
  const todayLog = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return logs.value[today] || createEmptyLog()
  })

  const todayCompletionCount = computed(() => {
    const log = todayLog.value
    const items = ['dzikir_pagi', 'dzikir_petang', 'al_mulk', 'al_kahfi', 'al_waqiah']
    return items.filter((k) => log[k]).length
  })

  // Actions
  function createEmptyLog() {
    return {
      dzikir_pagi: false,
      dzikir_petang: false,
      al_mulk: false,
      al_kahfi: false,
      al_waqiah: false,
      custom_amal: [],
      tasbih_counts: {},
    }
  }

  /**
   * Toggle amalan (centang/batal centang)
   * @param {string} key - key amalan
   * @param {string} date - YYYY-MM-DD
   */
  function toggleAmal(key, date = null) {
    const dateKey = date || new Date().toISOString().split('T')[0]
    if (!logs.value[dateKey]) {
      logs.value[dateKey] = createEmptyLog()
    }
    logs.value[dateKey][key] = !logs.value[dateKey][key]
    saveToStorage()
  }

  /**
   * Set tasbih session
   * @param {number} count
   * @param {number} target
   * @param {string} label - nama dzikir
   */
  function setTasbihSession(count, target, label) {
    tasbihSession.value = { count, target, label }
    lsSet('imani_tasbih_session', tasbihSession.value)
  }

  function incrementTasbih() {
    tasbihSession.value.count++
    lsSet('imani_tasbih_session', tasbihSession.value)
    return tasbihSession.value.count
  }

  function resetTasbih() {
    tasbihSession.value.count = 0
    lsSet('imani_tasbih_session', tasbihSession.value)
  }

  function saveToStorage() {
    lsSet('imani_amal_logs', logs.value)
  }

  function loadFromStorage() {
    logs.value = lsGet('imani_amal_logs', {})
    tasbihSession.value = lsGet('imani_tasbih_session', { count: 0, target: 33, label: 'Subhanallah' })
  }

  async function syncToBackend(date, userId) {
    if (!userId) return
    const dateKey = date || new Date().toISOString().split('T')[0]
    const log = logs.value[dateKey]
    if (!log) return

    await offlineSave('saveAmalLog', { userId, date: dateKey, amalData: log }, gasPost)
  }

  return {
    logs, tasbihSession,
    // alias for TasbihView
    tasbih: tasbihSession,
    todayLog, todayCompletionCount,
    toggleAmal, setTasbihSession, incrementTasbih, resetTasbih,
    // Dzikir helpers for AmalView
    isDzikirDone(dzikirId, time) {
      const today = new Date().toISOString().split('T')[0]
      const key = `dzikir_${time}_${dzikirId}`
      return !!(logs.value[today]?.[key])
    },
    toggleDzikir(dzikirId, time) {
      const today = new Date().toISOString().split('T')[0]
      const key = `dzikir_${time}_${dzikirId}`
      if (!logs.value[today]) logs.value[today] = createEmptyLog()
      logs.value[today][key] = !logs.value[today][key]
      lsSet('imani_amal_logs', logs.value)
    },
    resetDzikir(time) {
      const today = new Date().toISOString().split('T')[0]
      if (!logs.value[today]) return
      Object.keys(logs.value[today]).forEach(k => {
        if (k.startsWith(`dzikir_${time}_`)) logs.value[today][k] = false
      })
      lsSet('imani_amal_logs', logs.value)
    },
    saveToStorage, loadFromStorage, syncToBackend,
  }
})
