/**
 * useCyclePrediction — Algoritma prediksi siklus menstruasi
 * Input: array dari 3-6 cycle logs terakhir
 * Output: prediksi haid berikutnya, ovulasi, PMS, fertile window
 */
export function useCyclePrediction() {
  /**
   * Hitung rata-rata dari array angka
   * @param {number[]} arr
   * @returns {number}
   */
  function mean(arr) {
    if (!arr || arr.length === 0) return 0
    return Math.round(arr.reduce((sum, n) => sum + n, 0) / arr.length)
  }

  /**
   * Tambah hari ke tanggal
   * @param {string} dateStr - format YYYY-MM-DD
   * @param {number} days
   * @returns {string} format YYYY-MM-DD
   */
  function addDays(dateStr, days) {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  /**
   * Hitung panjang siklus dari cycle log
   * @param {Object} log - { start_date, end_date }
   * @param {Object} nextLog - log berikutnya (untuk hitung panjang siklus)
   * @returns {number|null}
   */
  function calcCycleLength(log, nextLog) {
    if (!nextLog) return null
    const start = new Date(log.start_date)
    const nextStart = new Date(nextLog.start_date)
    const diff = Math.round((nextStart - start) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : null
  }

  /**
   * Prediksi siklus berikutnya dari riwayat logs
   * @param {Object[]} cycleLogs - array cycle logs diurutkan dari terlama ke terbaru
   * @returns {{
   *   avgCycleDays: number,
   *   avgPeriodDays: number,
   *   nextPeriodDate: string,
   *   ovulationDate: string,
   *   pmsStartDate: string,
   *   fertileDays: string[],
   *   confidence: 'high'|'medium'|'low'
   * }}
   */
  function predict(cycleLogs) {
    if (!cycleLogs || cycleLogs.length === 0) {
      return getDefaultPrediction()
    }

    // Hitung durasi tiap period (dalam hari)
    const periodDurations = cycleLogs
      .filter((log) => log.start_date && log.end_date)
      .map((log) => {
        const start = new Date(log.start_date)
        const end = new Date(log.end_date)
        return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
      })
      .filter((d) => d > 0 && d <= 14)

    // Hitung panjang siklus antar period
    const cycleLengths = []
    for (let i = 0; i < cycleLogs.length - 1; i++) {
      const len = calcCycleLength(cycleLogs[i], cycleLogs[i + 1])
      if (len && len >= 21 && len <= 45) {
        cycleLengths.push(len)
      }
    }

    const avgCycleDays = cycleLengths.length > 0 ? mean(cycleLengths) : 28
    const avgPeriodDays = periodDurations.length > 0 ? mean(periodDurations) : 5

    // Ambil tanggal mulai haid terakhir
    const lastLog = cycleLogs[cycleLogs.length - 1]
    const lastPeriodStart = lastLog.start_date

    // Prediksi tanggal berikutnya
    const nextPeriodDate = addDays(lastPeriodStart, avgCycleDays)
    const ovulationDate = addDays(nextPeriodDate, -14)
    const pmsStartDate = addDays(nextPeriodDate, -5)

    // Fertile window: ovulasi - 2 sampai ovulasi + 2
    const fertileDays = []
    for (let i = -2; i <= 2; i++) {
      fertileDays.push(addDays(ovulationDate, i))
    }

    // Confidence level berdasarkan jumlah data
    let confidence = 'low'
    if (cycleLogs.length >= 6) confidence = 'high'
    else if (cycleLogs.length >= 3) confidence = 'medium'

    return {
      avgCycleDays,
      avgPeriodDays,
      nextPeriodDate,
      ovulationDate,
      pmsStartDate,
      fertileDays,
      confidence,
      lastPeriodStart,
    }
  }

  /**
   * Nilai default jika belum ada data
   */
  function getDefaultPrediction() {
    return {
      avgCycleDays: 28,
      avgPeriodDays: 5,
      nextPeriodDate: null,
      ovulationDate: null,
      pmsStartDate: null,
      fertileDays: [],
      confidence: 'low',
      lastPeriodStart: null,
    }
  }

  /**
   * Hitung berapa hari lagi hingga haid berikutnya
   * @param {string} nextPeriodDate - format YYYY-MM-DD
   * @returns {number} positif = hari lagi, negatif = sudah lewat
   */
  function daysUntilNextPeriod(nextPeriodDate) {
    if (!nextPeriodDate) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const next = new Date(nextPeriodDate)
    return Math.round((next - today) / (1000 * 60 * 60 * 24))
  }

  /**
   * Cek apakah tanggal tertentu adalah fertile day
   * @param {string} dateStr - format YYYY-MM-DD
   * @param {string[]} fertileDays
   * @returns {boolean}
   */
  function isFertileDay(dateStr, fertileDays) {
    return fertileDays.includes(dateStr)
  }

  return { predict, daysUntilNextPeriod, isFertileDay, addDays, mean }
}
