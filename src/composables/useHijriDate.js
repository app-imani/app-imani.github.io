import dayjs from 'dayjs'
import 'dayjs/locale/id'

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

const HIJRI_FORMATTER = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

function normalizeDate(date) {
  const raw = dayjs.isDayjs(date) ? date.toDate() : new Date(date)
  if (Number.isNaN(raw.getTime())) return new Date()
  return new Date(Date.UTC(raw.getFullYear(), raw.getMonth(), raw.getDate(), 12, 0, 0))
}

function extractHijriParts(date) {
  const parts = HIJRI_FORMATTER.formatToParts(normalizeDate(date))
  const getPart = (type) => Number(parts.find((part) => part.type === type)?.value || 0)

  return {
    day: getPart('day'),
    month: getPart('month'),
    year: getPart('year'),
  }
}

/**
 * Hijri date localStorage cache — IMPR-13
 * Dates never change for a given Gregorian date, so no expiry needed.
 */
function _hijriCacheKey(date) {
  const d = dayjs.isDayjs(date) ? date : dayjs(date)
  return `imani_hijri_cache_${d.format('YYYY-MM-DD')}`
}

/**
 * useHijriDate — Konversi dan format tanggal Hijriah
 */
export function useHijriDate() {
  function toHijri(date = new Date()) {
    // Try cache first (IMPR-13)
    try {
      const cacheKey = _hijriCacheKey(date)
      const cached = localStorage.getItem(cacheKey)
      if (cached) return JSON.parse(cached)
    } catch (_) { /* ignore */ }

    const { day, month, year } = extractHijriParts(date)
    const monthIndex = Math.max(0, Math.min(11, month - 1))

    const result = {
      year,
      month,
      day,
      monthName: HIJRI_MONTHS_ID[monthIndex],
      monthNameAr: HIJRI_MONTHS_AR[monthIndex],
      monthNameId: HIJRI_MONTHS_ID[monthIndex],
      formatted: `${day} ${HIJRI_MONTHS_ID[monthIndex]} ${year} H`,
      formattedAr: `${day} ${HIJRI_MONTHS_AR[monthIndex]} ${year} هـ`,
    }

    // Persist to cache (IMPR-13)
    try {
      localStorage.setItem(_hijriCacheKey(date), JSON.stringify(result))
    } catch (_) { /* ignore quota errors */ }
    return result
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
    const currentHijri = toHijri(today)
    const dates = []

    for (let offset = -40; offset <= 40; offset++) {
      const currentDate = today.add(offset, 'day')
      const hijri = toHijri(currentDate)
      if (
        hijri.year === currentHijri.year &&
        hijri.month === currentHijri.month &&
        [13, 14, 15].includes(hijri.day)
      ) {
        dates.push(currentDate.format('YYYY-MM-DD'))
      }
    }

    return [...new Set(dates)].sort()
  }

  /**
   * Dapatkan tanggal Arafah (9 Dzulhijjah) tahun ini
   * @returns {string} format YYYY-MM-DD
   */
  function getArafahDate() {
    const today = dayjs()
    const currentHijriYear = toHijri(today).year

    for (let offset = -380; offset <= 380; offset++) {
      const currentDate = today.add(offset, 'day')
      const hijri = toHijri(currentDate)
      if (hijri.year === currentHijriYear && hijri.month === 12 && hijri.day === 9) {
        return currentDate.format('YYYY-MM-DD')
      }
    }

    return null
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
      const hijri = toHijri(date)
      return `${hijri.day} ${hijri.monthName} ${hijri.year} H`
    } catch {
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
    } catch { /* */ }
    return null
  }

  return { toHijri, isRamadhan, isFriday, getAyyamulBidhDates, getArafahDate, formatDate, formatHijri, isTodaySunnahFast, getToday }
}
