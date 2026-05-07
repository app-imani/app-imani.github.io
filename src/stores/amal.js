import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useGasApi } from '@/composables/useGasApi'
import { useOfflineSync } from '@/composables/useOfflineSync'

/**
 * Store Amal — Dzikir, doa, tasbih, sunnah, muhasabah, wirid, udzur
 */
export const useAmalStore = defineStore('amal', () => {
  const { get: lsGet, set: lsSet } = useLocalStorage()
  const { post: gasPost } = useGasApi()
  const { offlineSave } = useOfflineSync()

  // ─── State ────────────────────────────────────────────────
  const logs = ref(lsGet('imani_amal_logs', {}))
  const tasbihSession = ref(lsGet('imani_tasbih_session', { count: 0, target: 33, label: 'Subhanallah' }))

  // F-01 — Mode Udzur
  const udzurMode = ref(lsGet('imani_udzur_mode', { active: false, startDate: null, durationDays: 7 }))

  // F-02 — Amalan Sunnah config
  const sunnahConfig = ref(lsGet('imani_sunnah_config', {
    sholat_dhuha: true,
    sholat_tahajud: false,
    sholat_rawatib: false,
    puasa_sunnah: false,
    sedekah_harian: true,
    tilawah_quran: true,
    tilawah_target_pages: 2,
    sholawat_100: true,
    istighfar_100: false,
    al_mulk: true,
    al_waqiah: true,
    al_kahfi: true,
  }))

  // F-05 — Wirid Session
  const wiridSession = ref({
    sholatName: null,
    currentStep: 0,
    counts: [0, 0, 0],
    targets: [33, 33, 34],
    isComplete: false,
  })

  // ─── Helpers ──────────────────────────────────────────────
  function getTodayKey() {
    return new Date().toISOString().split('T')[0]
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0]
  }

  // ─── createEmptyLog ───────────────────────────────────────
  function createEmptyLog() {
    return {
      dzikir_pagi:   false,
      dzikir_petang: false,
      al_mulk:       false,
      al_kahfi:      false,
      al_waqiah:     false,
      custom_amal:   [],
      tasbih_counts: {},
      // F-01
      is_udzur: false,
      udzur_amal: { istighfar: 0, selawat: 0, sedekah: false, tadabbur: false },
      // F-02
      sunnah: {
        sholat_dhuha:    false,
        sholat_tahajud:  false,
        sholat_rawatib:  false,
        puasa_sunnah:    false,
        sedekah_harian:  false,
        tilawah_pages:   0,
        sholawat_count:  0,
        istighfar_count: 0,
      },
      // F-04
      muhasabah: {
        filled: false, syukur: '', amal_terbaik: '', perbaikan: '',
        timestamp: null, question_id: null,
      },
      // F-05
      wirid_sholat: { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false },
    }
  }

  // ─── Background Sync (BUG-02 + BUG-04) ───────────────────
  async function _bgSync(date = null) {
    const dateKey = date || getTodayKey()
    const log = logs.value[dateKey]
    if (!log) return
    try {
      const { useAuthStore } = await import('@/stores/auth')
      const auth = useAuthStore()
      if (!auth.user?.uid || auth.isGuest) return
      const sid = await auth.ensureSpreadsheetId()
      if (!sid) { console.debug('[amalStore] _bgSync skip: no spreadsheetId'); return }
      await offlineSave('saveAmalLog', { userId: auth.user.uid, date: dateKey, amalData: log }, gasPost)
    } catch (e) {
      console.debug('[amalStore] _bgSync error:', e.message)
    }
  }

  // ─── Computed ─────────────────────────────────────────────
  const todayLog = computed(() => logs.value[getTodayKey()] || createEmptyLog())

  const todayCompletionCount = computed(() => {
    const log = todayLog.value
    return ['dzikir_pagi', 'dzikir_petang', 'al_mulk', 'al_kahfi', 'al_waqiah'].filter(k => log[k]).length
  })

  const isUdzurActive = computed(() => {
    if (!udzurMode.value.active || !udzurMode.value.startDate) return false
    const end = new Date(udzurMode.value.startDate)
    end.setDate(end.getDate() + (udzurMode.value.durationDays || 7))
    return new Date() < end
  })

  function hasMinAmal(log, minCount = 3) {
    if (!log) return false
    if (log.is_udzur) return true
    const mainDone = ['dzikir_pagi', 'dzikir_petang', 'al_mulk', 'al_kahfi', 'al_waqiah'].filter(k => log[k]).length
    const dzikirDone = Object.keys(log).filter(k => (k.startsWith('dzikir_pagi_') || k.startsWith('dzikir_petang_')) && log[k]).length
    const sunnahDone = Object.values(log.sunnah || {}).filter(v => v === true || (typeof v === 'number' && v > 0)).length
    return (mainDone + (dzikirDone > 0 ? 1 : 0) + sunnahDone) >= minCount
  }

  const currentStreak = computed(() => {
    let streak = 0
    const date = new Date()
    date.setDate(date.getDate() - 1)
    for (let i = 0; i < 365; i++) {
      const key = formatDate(date)
      if (!logs.value[key] || !hasMinAmal(logs.value[key])) break
      streak++
      date.setDate(date.getDate() - 1)
    }
    return streak
  })

  function getMonthHeatmap(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate()
    const todayKey = getTodayKey()
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1
      const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const log = logs.value[key]
      let level = 0; let isUdzur = false
      let pagiCount = 0; let petangCount = 0; let sunnahCount = 0
      if (log) {
        isUdzur = !!log.is_udzur
        pagiCount = Object.keys(log).filter(k => k.startsWith('dzikir_pagi_') && log[k]).length
        petangCount = Object.keys(log).filter(k => k.startsWith('dzikir_petang_') && log[k]).length
        sunnahCount = Object.values(log.sunnah || {}).filter(v => v === true || (typeof v === 'number' && v > 0)).length
        const mainDone = ['dzikir_pagi', 'dzikir_petang', 'al_mulk', 'al_kahfi', 'al_waqiah'].filter(k => log[k]).length
        const done = mainDone + pagiCount + petangCount + sunnahCount
        level = isUdzur ? 5 : done >= 5 ? 4 : done >= 3 ? 3 : done >= 1 ? 2 : 1
      }
      return {
        date: key, day: d, level, isUdzur,
        isToday: key === todayKey,
        hasData: !!log,
        pagiCount, petangCount, sunnahCount,
        log: log || null,
      }
    })
  }  function getMonthSummary(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate()
    let activeDays = 0
    const amalCount = {}
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const log = logs.value[key]
      if (!log) continue
      if (hasMinAmal(log)) activeDays++
      ;['dzikir_pagi', 'dzikir_petang', 'al_mulk', 'al_kahfi', 'al_waqiah'].forEach(k => {
        if (log[k]) amalCount[k] = (amalCount[k] || 0) + 1
      })
      Object.entries(log.sunnah || {}).forEach(([k, v]) => {
        if (v === true || (typeof v === 'number' && v > 0))
          amalCount[`sunnah_${k}`] = (amalCount[`sunnah_${k}`] || 0) + 1
      })
    }
    const sorted = Object.entries(amalCount).sort((a, b) => b[1] - a[1])
    return {
      activeDays, totalDays: daysInMonth,
      percentActive: Math.round((activeDays / daysInMonth) * 100),
      mostConsistent: sorted[0]?.[0] || null,
      leastConsistent: sorted[sorted.length - 1]?.[0] || null,
    }
  }

  const weeklyReport = computed(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      const key = formatDate(d)
      return { key, log: logs.value[key] || null }
    })
    return {
      activeDays: days.filter(d => d.log && hasMinAmal(d.log)).length,
      dzikirPagiDone: days.filter(d => d.log?.dzikir_pagi).length,
      dzikirPetangDone: days.filter(d => d.log?.dzikir_petang).length,
      muhasabahDone: days.filter(d => d.log?.muhasabah?.filled).length,
      totalTasbih: days.reduce((s, d) => s + Object.values(d.log?.tasbih_counts || {}).reduce((a, v) => a + (v || 0), 0), 0),
      streak: currentStreak.value, days,
    }
  })

  // ─── Actions: Amalan Utama ────────────────────────────────
  function toggleAmal(key, date = null) {
    const dateKey = date || getTodayKey()
    if (!logs.value[dateKey]) logs.value[dateKey] = createEmptyLog()
    logs.value[dateKey][key] = !logs.value[dateKey][key]
    lsSet('imani_amal_logs', logs.value)
    _bgSync(dateKey)
  }

  // ─── Actions: Dzikir ──────────────────────────────────────
  function isDzikirDone(dzikirId, time) {
    return !!(logs.value[getTodayKey()]?.[`dzikir_${time}_${dzikirId}`])
  }

  function toggleDzikir(dzikirId, time) {
    const today = getTodayKey()
    if (!logs.value[today]) logs.value[today] = createEmptyLog()
    logs.value[today][`dzikir_${time}_${dzikirId}`] = !logs.value[today][`dzikir_${time}_${dzikirId}`]
    lsSet('imani_amal_logs', logs.value)
    _bgSync(today)
  }

  function resetDzikir(time) {
    const today = getTodayKey()
    if (!logs.value[today]) return
    Object.keys(logs.value[today]).forEach(k => {
      if (k.startsWith(`dzikir_${time}_`)) logs.value[today][k] = false
    })
    lsSet('imani_amal_logs', logs.value)
  }

  // ─── Actions: Tasbih ──────────────────────────────────────
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
    const { label, count } = tasbihSession.value
    if (label && count > 0) {
      const today = getTodayKey()
      if (!logs.value[today]) logs.value[today] = createEmptyLog()
      logs.value[today].tasbih_counts[label] = (logs.value[today].tasbih_counts[label] || 0) + count
      lsSet('imani_amal_logs', logs.value)
      _bgSync(today)
    }
    tasbihSession.value.count = 0
    lsSet('imani_tasbih_session', tasbihSession.value)
  }

  // ─── Actions: F-01 Udzur ──────────────────────────────────
  function activateUdzurMode(durationDays = 7) {
    udzurMode.value = { active: true, startDate: new Date().toISOString(), durationDays }
    lsSet('imani_udzur_mode', udzurMode.value)
    const today = getTodayKey()
    if (!logs.value[today]) logs.value[today] = createEmptyLog()
    logs.value[today].is_udzur = true
    lsSet('imani_amal_logs', logs.value)
    _bgSync(today)
  }

  function deactivateUdzurMode() {
    udzurMode.value = { active: false, startDate: null, durationDays: 7 }
    lsSet('imani_udzur_mode', udzurMode.value)
  }

  function incrementUdzurAmal(type) {
    const today = getTodayKey()
    if (!logs.value[today]) logs.value[today] = createEmptyLog()
    if (!logs.value[today].udzur_amal) logs.value[today].udzur_amal = createEmptyLog().udzur_amal
    logs.value[today].udzur_amal[type] = (logs.value[today].udzur_amal[type] || 0) + 1
    lsSet('imani_amal_logs', logs.value)
    _bgSync(today)
  }

  function toggleUdzurAmal(type) {
    const today = getTodayKey()
    if (!logs.value[today]) logs.value[today] = createEmptyLog()
    if (!logs.value[today].udzur_amal) logs.value[today].udzur_amal = createEmptyLog().udzur_amal
    logs.value[today].udzur_amal[type] = !logs.value[today].udzur_amal[type]
    lsSet('imani_amal_logs', logs.value)
    _bgSync(today)
  }

  // ─── Actions: F-02 Sunnah ─────────────────────────────────
  function toggleSunnah(key) {
    const today = getTodayKey()
    if (!logs.value[today]) logs.value[today] = createEmptyLog()
    if (!logs.value[today].sunnah) logs.value[today].sunnah = createEmptyLog().sunnah
    logs.value[today].sunnah[key] = !logs.value[today].sunnah[key]
    lsSet('imani_amal_logs', logs.value)
    _bgSync(today)
  }

  function incrementTilawah(pages = 1) {
    const today = getTodayKey()
    if (!logs.value[today]) logs.value[today] = createEmptyLog()
    if (!logs.value[today].sunnah) logs.value[today].sunnah = createEmptyLog().sunnah
    logs.value[today].sunnah.tilawah_pages = (logs.value[today].sunnah.tilawah_pages || 0) + pages
    lsSet('imani_amal_logs', logs.value)
    _bgSync(today)
  }

  function setSunnahConfig(key, value) {
    sunnahConfig.value[key] = value
    lsSet('imani_sunnah_config', sunnahConfig.value)
  }

  // ─── Actions: F-04 Muhasabah ──────────────────────────────
  function saveMuhasabah({ syukur, amal_terbaik, perbaikan, question_id }) {
    const today = getTodayKey()
    if (!logs.value[today]) logs.value[today] = createEmptyLog()
    logs.value[today].muhasabah = {
      filled: true, syukur, amal_terbaik, perbaikan,
      timestamp: new Date().toISOString(), question_id,
    }
    lsSet('imani_amal_logs', logs.value)
    _bgSync(today)
  }

  // ─── Actions: F-05 Wirid ──────────────────────────────────
  function startWirid(sholatName) {
    wiridSession.value = { sholatName, currentStep: 0, counts: [0, 0, 0], targets: [33, 33, 34], isComplete: false }
  }

  function tapWirid() {
    const s = wiridSession.value
    if (s.isComplete) return
    s.counts[s.currentStep]++
    if (s.counts[s.currentStep] >= s.targets[s.currentStep]) {
      if (s.currentStep < 2) {
        s.currentStep++
      } else {
        s.isComplete = true
        const today = getTodayKey()
        if (!logs.value[today]) logs.value[today] = createEmptyLog()
        if (!logs.value[today].wirid_sholat) logs.value[today].wirid_sholat = createEmptyLog().wirid_sholat
        logs.value[today].wirid_sholat[s.sholatName] = true
        lsSet('imani_amal_logs', logs.value)
        _bgSync(today)
      }
    }
  }

  function resetWirid() {
    wiridSession.value = { sholatName: null, currentStep: 0, counts: [0, 0, 0], targets: [33, 33, 34], isComplete: false }
  }

  // ─── Storage ──────────────────────────────────────────────
  function saveToStorage() { lsSet('imani_amal_logs', logs.value) }

  function loadFromStorage() {
    logs.value = lsGet('imani_amal_logs', {})
    tasbihSession.value = lsGet('imani_tasbih_session', { count: 0, target: 33, label: 'Subhanallah' })
    udzurMode.value = lsGet('imani_udzur_mode', { active: false, startDate: null, durationDays: 7 })
    sunnahConfig.value = lsGet('imani_sunnah_config', sunnahConfig.value)
  }

  async function syncToBackend(date) { await _bgSync(date) }

  // Auto-expire udzur saat store init
  if (udzurMode.value.active && !isUdzurActive.value) {
    udzurMode.value.active = false
    lsSet('imani_udzur_mode', udzurMode.value)
  }

  return {
    logs, tasbihSession, udzurMode, sunnahConfig, wiridSession,
    tasbih: tasbihSession,
    todayLog, todayCompletionCount, isUdzurActive, currentStreak, weeklyReport,
    hasMinAmal, getMonthHeatmap, getMonthSummary,
    toggleAmal, createEmptyLog,
    isDzikirDone, toggleDzikir, resetDzikir,
    setTasbihSession, incrementTasbih, resetTasbih,
    activateUdzurMode, deactivateUdzurMode, incrementUdzurAmal, toggleUdzurAmal,
    toggleSunnah, incrementTilawah, setSunnahConfig,
    saveMuhasabah,
    startWirid, tapWirid, resetWirid,
    saveToStorage, loadFromStorage, syncToBackend,
  }
})
