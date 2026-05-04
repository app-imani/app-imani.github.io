import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useGasApi } from '@/composables/useGasApi'
import { useHijriDate } from '@/composables/useHijriDate'

/**
 * Store Fasting — Puasa tracker + Qadha calculator
 */
export const useFastingStore = defineStore('fasting', () => {
  const { get: lsGet, set: lsSet } = useLocalStorage()
  const { post: gasPost, get: gasGet } = useGasApi()
  const { isRamadhan } = useHijriDate()

  // State
  const logs = ref(lsGet('imani_fasting_logs', {})) // { 'YYYY-MM-DD': { type, status, ... } }
  const qadhaCounter = ref(lsGet('imani_fasting_qadha', {})) // { 'YYYY': { total_debt, total_paid, remaining } }

  // Types puasa yang valid
  const FASTING_TYPES = ['wajib', 'sunnah', 'qadha', 'kifarat']
  const SUNNAH_TYPES = ['senin_kamis', 'ayyamul_bidh', 'daud', 'arafah', 'asyura', 'syawal']

  // Computed
  const todayLog = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return logs.value[today] || null
  })

  const isFastingToday = computed(() => {
    return todayLog.value?.status === 'done'
  })

  const currentYearQadha = computed(() => {
    const year = new Date().getFullYear().toString()
    return qadhaCounter.value[year] || { total_debt: 0, total_paid: 0, remaining: 0 }
  })

  // FastingView-friendly computed
  const logsArray = computed(() => {
    return Object.entries(logs.value).map(([date, log]) => ({ id: date, date, ...log }))
  })

  const qadhaDebt = computed(() => currentYearQadha.value.remaining || 0)
  const totalQadha = computed(() => currentYearQadha.value.total_debt || 0)
  const qadhaPaid = computed(() => currentYearQadha.value.total_paid || 0)

  function isTodayLogged() {
    return !!todayLog.value
  }

  function isQadhaPaidToday() {
    const today = new Date().toISOString().split('T')[0]
    const log = logs.value[today]
    return log?.type === 'qadha'
  }

  // Simplified addLog for FastingView usage
  function addLog({ type, date, note = '', subType = null }) {
    logFasting(date, type, subType, 'done', note)
  }

  // Actions
  /**
   * Log puasa untuk tanggal tertentu
   */
  function logFasting(date, type, sunnahType = null, status = 'done', notes = '') {
    const dateKey = date || new Date().toISOString().split('T')[0]
    logs.value[dateKey] = { type, sunnah_type: sunnahType, status, notes, created_at: new Date().toISOString() }
    saveToStorage()
  }

  /**
   * Tandai qadha selesai dibayar
   */
  function markQadhaPaid(year = null) {
    const yearKey = year || new Date().getFullYear().toString()

    if (!qadhaCounter.value[yearKey]) {
      qadhaCounter.value[yearKey] = { total_debt: 0, total_paid: 0, remaining: 0 }
    }

    const counter = qadhaCounter.value[yearKey]
    if (counter.remaining > 0) {
      counter.total_paid++
      counter.remaining--
      saveToStorage()
    }
  }

  /**
   * Tambah hutang qadha (dipanggil saat Mode Haid selesai di bulan Ramadhan)
   * @param {number} days - jumlah hari haid selama Ramadhan
   * @param {string|number} year
   */
  function addQadhaDebt(days, year = null) {
    const yearKey = (year || new Date().getFullYear()).toString()

    if (!qadhaCounter.value[yearKey]) {
      qadhaCounter.value[yearKey] = { total_debt: 0, total_paid: 0, remaining: 0 }
    }

    qadhaCounter.value[yearKey].total_debt += days
    qadhaCounter.value[yearKey].remaining += days
    saveToStorage()
  }

  function saveToStorage() {
    lsSet('imani_fasting_logs', logs.value)
    lsSet('imani_fasting_qadha', qadhaCounter.value)
  }

  function loadFromStorage() {
    logs.value = lsGet('imani_fasting_logs', {})
    qadhaCounter.value = lsGet('imani_fasting_qadha', {})
  }

  /**
   * Sync ke GAS backend
   */
  async function syncToBackend(date, userId) {
    if (!userId) return
    const dateKey = date || new Date().toISOString().split('T')[0]
    const log = logs.value[dateKey]
    if (!log) return

    try {
      await gasPost('saveFastingLog', { userId, date: dateKey, ...log })
    } catch (err) {
      console.error('[fastingStore] Sync gagal:', err)
    }
  }

  async function syncQadhaToBackend(userId, year) {
    if (!userId) return
    const yearKey = (year || new Date().getFullYear()).toString()
    const counter = qadhaCounter.value[yearKey]
    if (!counter) return

    try {
      await gasPost('updateQadha', { userId, year: yearKey, ...counter })
    } catch (err) {
      console.error('[fastingStore] Sync qadha gagal:', err)
    }
  }

  return {
    logs, qadhaCounter, todayLog, isFastingToday, currentYearQadha,
    logsArray, qadhaDebt, totalQadha, qadhaPaid,
    FASTING_TYPES, SUNNAH_TYPES,
    logFasting, addLog, isTodayLogged, isQadhaPaidToday,
    markQadhaPaid, addQadhaDebt, saveToStorage, loadFromStorage,
    syncToBackend, syncQadhaToBackend,
  }
})
