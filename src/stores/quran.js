import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useGasApi } from '@/composables/useGasApi'

/**
 * Store Quran — Target, bookmark, dan progress tilawah
 */
export const useQuranStore = defineStore('quran', () => {
  const { get: lsGet, set: lsSet } = useLocalStorage()
  const { post: gasPost, get: gasGet } = useGasApi()

  // State
  const bookmark = ref(lsGet('imani_quran_bookmark', { surah: 1, ayah: 1, surahName: 'Al-Fatihah' }))
  const progress = ref(lsGet('imani_quran_progress', {})) // { 'YYYY-MM-DD': { pages, surah, ayah } }
  const goal = ref(lsGet('imani_quran_goal', { type: 'pages_per_day', value: 2, khatamTarget: null }))
  const readingLogs = ref(lsGet('imani_quran_logs', [])) // array of { id, pageFrom, pageTo, date }
  const totalPages = 604

  // Computed
  const todayProgress = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return progress.value[today] || { pages: 0, surah: bookmark.value.surah, ayah: bookmark.value.ayah }
  })

  const todayTarget = computed(() => {
    if (goal.value.type === 'pages_per_day') return goal.value.value
    if (goal.value.type === 'khatam_days') {
      return Math.ceil(totalPages / goal.value.value)
    }
    return 2 // default 2 halaman
  })

  const todayProgressPercent = computed(() => {
    if (todayTarget.value === 0) return 0
    return Math.min(100, Math.round((todayProgress.value.pages / todayTarget.value) * 100))
  })

  const isTodayComplete = computed(() => todayProgress.value.pages >= todayTarget.value)

  // QuranView-friendly aliases
  const progressPercent = computed(() => {
    const pagesRead = Object.values(progress.value).reduce((sum, d) => sum + (d.pages || 0), 0)
    return Math.min(100, Math.round((pagesRead / totalPages) * 100))
  })

  const currentJuz = computed(() => {
    const pagesRead = Object.values(progress.value).reduce((sum, d) => sum + (d.pages || 0), 0)
    return Math.min(30, Math.floor(pagesRead / (totalPages / 30)))
  })

  const logs = readingLogs

  function addLog({ pageFrom, pageTo, date }) {
    const log = { id: `q_${Date.now()}`, pageFrom, pageTo, date }
    readingLogs.value.push(log)
    if (readingLogs.value.length > 100) readingLogs.value = readingLogs.value.slice(-100)
    // Also update daily pages
    const pages = pageTo - pageFrom + 1
    if (!progress.value[date]) progress.value[date] = { pages: 0 }
    progress.value[date].pages = (progress.value[date].pages || 0) + pages
    lsSet('imani_quran_logs', readingLogs.value)
    saveToStorage()
  }

  function setTarget(type, value) {
    setGoal(type, value)
  }

  function setBookmark(data) {
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      bookmark.value = { ...data, savedAt: new Date().toISOString() }
    } else {
      // Legacy: setBookmark(surah, ayah, surahName)
      const [surah, ayah, surahName = ''] = arguments
      bookmark.value = { surah, ayah, surahName, savedAt: new Date().toISOString() }
    }
    lsSet('imani_quran_bookmark', bookmark.value)
  }

  function logProgress(pages, surah, ayah) {
    const today = new Date().toISOString().split('T')[0]
    progress.value[today] = { pages, surah, ayah, updated_at: new Date().toISOString() }
    // Update bookmark otomatis
    setBookmark(surah, ayah)
    saveToStorage()
  }

  function addPages(pages) {
    const today = new Date().toISOString().split('T')[0]
    if (!progress.value[today]) {
      progress.value[today] = { pages: 0, surah: bookmark.value.surah, ayah: bookmark.value.ayah }
    }
    progress.value[today].pages += pages
    saveToStorage()
  }

  function setGoal(type, value) {
    goal.value = { type, value }
    lsSet('imani_quran_goal', goal.value)
  }

  function saveToStorage() {
    lsSet('imani_quran_progress', progress.value)
    lsSet('imani_quran_logs', readingLogs.value)
  }

  function loadFromStorage() {
    bookmark.value = lsGet('imani_quran_bookmark', { surah: 1, ayah: 1, surahName: 'Al-Fatihah' })
    progress.value = lsGet('imani_quran_progress', {})
    goal.value = lsGet('imani_quran_goal', { type: 'pages_per_day', value: 2 })
    readingLogs.value = lsGet('imani_quran_logs', [])
  }

  async function syncToBackend(userId) {
    if (!userId) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const todayData = progress.value[today]
      if (!todayData) return

      await gasPost('saveQuranProgress', {
        userId,
        surah: todayData.surah,
        ayah: todayData.ayah,
        pages: todayData.pages,
        totalPagesTarget: todayTarget.value,
        goalType: goal.value.type,
      })
    } catch (err) {
      console.error('[quranStore] Sync gagal:', err)
    }
  }

  return {
    bookmark, progress, goal, totalPages, todayProgress, todayTarget,
    todayProgressPercent, isTodayComplete,
    progressPercent, currentJuz, logs,
    setBookmark, logProgress, addLog, addPages, setGoal, setTarget,
    saveToStorage, loadFromStorage, syncToBackend,
  }
})
