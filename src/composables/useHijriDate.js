import dayjs from 'dayjs'
import 'dayjs/locale/id'
import dayjsHijri from 'dayjs-hijri'

// Register plugin Hijri
dayjs.extend(dayjsHijri)
dayjs.locale('id')

/**
 * Nama bulan Hijriah dalam Bahasa Arab
 */
const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيعُ الْأَوَّل', 'رَبِيعُ الثَّانِي',
  'جُمَادَى الْأُولَى', 'جُمَادَى الثَّانِيَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو الْقَعْدَة', 'ذُو الْحِجَّة',
]

/**
 * Nama bulan Hijriah dalam Bahasa Indonesia/Latin
 */
const HIJRI_MONTHS_ID = [
  'Muharram', 'Shafar', 'Rabi\'ul Awwal', 'Rabi\'ul Akhir',
  'Jumadal Ula', 'Jumadal Akhirah', 'Rajab', 'Sya\'ban',
  'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah',
]

/**
 * useHijriDate — Konversi dan format tanggal Hijriah
 */
export function useHijriDate() {
  /**
   * Konversi tanggal Masehi ke Hijriah
   * @param {Date|string} date - tanggal Masehi
   * @returns {{ year: number, month: number, day: number, monthNameAr: string, monthNameId: string, formatted: string }}
   */
  function toHijri(date = new Date()) {
    const d = dayjs(date).iH()
    const month = d.iMonth() // 0-indexed
    return {
      year: d.iYear(),
      month: month + 1,
      day: d.iDate(),
      monthNameAr: HIJRI_MONTHS_AR[month],
      monthNameId: HIJRI_MONTHS_ID[month],
      formatted: `${d.iDate()} ${HIJRI_MONTHS_ID[month]} ${d.iYear()} H`,
      formattedAr: `${d.iDate()} ${HIJRI_MONTHS_AR[month]} ${d.iYear()} هـ`,
    }
  }

  /**
   * Cek apakah tanggal berada dalam bulan Ramadhan
   * @param {Date|string} date
   * @returns {boolean}
   */
  function isRamadhan(date = new Date()) {
    const hijri = toHijri(date)
    return hijri.month === 9 // Ramadhan = bulan ke-9
  }

  /**
   * Cek apakah hari ini adalah hari Jumat
   * @returns {boolean}
   */
  function isFriday() {
    return dayjs().day() === 5
  }

  /**
   * Dapatkan Ayyamul Bidh (13, 14, 15 bulan Hijriah) bulan ini
   * @returns {string[]} array tanggal Masehi format YYYY-MM-DD
   */
  function getAyyamulBidhDates() {
    const today = dayjs()
    const hijriToday = dayjs(today.toDate()).iH()
    const currentHijriYear = hijriToday.iYear()
    const currentHijriMonth = hijriToday.iMonth() + 1

    // Konversi tanggal 13, 14, 15 bulan hijri ini ke Masehi
    const dates = []
    for (const day of [13, 14, 15]) {
      try {
        // Buat tanggal hijri menggunakan iH()
        const hijriDate = dayjs(`${currentHijriYear}-${currentHijriMonth}-${day}`, 'iYYYY-iM-iD')
        dates.push(hijriDate.format('YYYY-MM-DD'))
      } catch (e) {
        console.warn('[useHijriDate] Error konversi Ayyamul Bidh:', e)
      }
    }
    return dates
  }

  /**
   * Dapatkan tanggal Arafah (9 Dzulhijjah) tahun ini
   * @returns {string} format YYYY-MM-DD
   */
  function getArafahDate() {
    const today = dayjs()
    const hijriToday = dayjs(today.toDate()).iH()
    const currentHijriYear = hijriToday.iYear()

    try {
      const arafahDate = dayjs(`${currentHijriYear}-12-9`, 'iYYYY-iM-iD')
      return arafahDate.format('YYYY-MM-DD')
    } catch (e) {
      return null
    }
  }

  /**
   * Format tanggal Masehi ke bahasa Indonesia
   * @param {Date|string} date
   * @param {string} format
   * @returns {string}
   */
  function formatDate(date = new Date(), format = 'dddd, D MMMM YYYY') {
    return dayjs(date).locale('id').format(format)
  }

  /**
   * Dapatkan hari ini dalam Masehi dan Hijriah
   * @returns {{ masehi: string, hijri: string, hijriObj: object }}
   */
  function getToday() {
    const today = new Date()
    return {
      masehi: formatDate(today),
      masehiShort: dayjs(today).format('YYYY-MM-DD'),
      hijri: toHijri(today).formatted,
      hijriObj: toHijri(today),
    }
  }

  function formatHijri(date = new Date()) {
    try {
      const d = dayjs(date).toDate ? dayjs(date) : dayjs(date)
      const hijri = toHijri(d.toDate ? d.toDate() : date)
      return `${hijri.day} ${hijri.monthName} ${hijri.year} H`
    } catch (e) {
      return ''
    }
  }

  /**
   * Returns sunnah fast info if today is a sunnah fast day
   * @returns {{ key, name, desc } | null}
   */
  function isTodaySunnahFast() {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, ..., 4=Thu
    if (dayOfWeek === 1 || dayOfWeek === 4) {
      return { key: 'senin_kamis', name: 'Puasa Senin/Kamis', desc: 'Puasa sunnah Senin & Kamis' }
    }
    // Check Ayyamul Bidh (13, 14, 15 Hijriah)
    try {
      const hijri = toHijri(today)
      if ([13, 14, 15].includes(hijri.day)) {
        return { key: 'ayyamul_bidh', name: "Ayyamul Bidh", desc: `${hijri.day} ${hijri.monthName}` }
      }
    } catch (e) { /* */ }
    return null
  }

  return { toHijri, isRamadhan, isFriday, getAyyamulBidhDates, getArafahDate, formatDate, formatHijri, isTodaySunnahFast, getToday }
}
