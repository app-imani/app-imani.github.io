/**
 * useIslamicCalendar.js
 * Konversi tanggal Masehi → Hijriah via Aladhan API
 * Includes helper untuk mendeteksi hari/tanggal spesial
 */
import { ref, computed } from 'vue'

const BASE_URL = 'https://api.aladhan.com/v1'

// Cache agar tidak fetch ulang hari yang sama
const _cache = new Map()

/**
 * Fetch hijri date for a Gregorian date string (YYYY-MM-DD)
 * Returns: { day, month, year, monthName, monthNameAr, dayOfWeek }
 */
export async function toHijri(dateStr) {
  if (_cache.has(dateStr)) return _cache.get(dateStr)

  try {
    const [year, month, day] = dateStr.split('-')
    const res = await fetch(`${BASE_URL}/gToH?date=${day}-${month}-${year}`)
    const json = await res.json()
    const h = json?.data?.hijri
    if (!h) return null

    const result = {
      day: parseInt(h.day),
      month: parseInt(h.month.number),
      year: parseInt(h.year),
      monthName: h.month.en,
      monthNameAr: h.month.ar,
      dayOfWeek: h.weekday.en,
    }
    _cache.set(dateStr, result)
    return result
  } catch {
    return null
  }
}

/**
 * useIslamicCalendar composable
 */
export function useIslamicCalendar() {
  const todayHijri = ref(null)
  const isLoading = ref(false)

  async function loadToday() {
    const today = new Date().toISOString().slice(0, 10)
    isLoading.value = true
    todayHijri.value = await toHijri(today)
    isLoading.value = false
  }

  /** Apakah hari ini malam Jumat? (Kamis malam atau check hari Jumat) */
  const isMalamJumat = computed(() => {
    const day = new Date().getDay()
    const hour = new Date().getHours()
    // Kamis setelah Maghrib (kira-kira jam 18) atau Jumat dini hari
    return (day === 4 && hour >= 18) || day === 5
  })

  /** Apakah hari ini Senin atau Kamis? */
  const isSeninaKamis = computed(() => {
    const day = new Date().getDay()
    return day === 1 || day === 4
  })

  /** Apakah hari ini Ayyamul Bidh? (tanggal 13, 14, 15 Hijriah) */
  const isAyyamulBidh = computed(() => {
    if (!todayHijri.value) return false
    return [13, 14, 15].includes(todayHijri.value.day)
  })

  /** Apakah 10 Dzulhijjah pertama? (tanggal 1-9, bulan 12 Hijriah) */
  const isAsyaraDzulhijjah = computed(() => {
    if (!todayHijri.value) return false
    return todayHijri.value.month === 12 && todayHijri.value.day <= 9
  })

  /** Apakah Nisfu Sya'ban? (tanggal 15, bulan 8 Hijriah) */
  const isNisfuSyaban = computed(() => {
    if (!todayHijri.value) return false
    return todayHijri.value.month === 8 && todayHijri.value.day === 15
  })

  /** Nama bulan Hijriah saat ini */
  const currentHijriMonth = computed(() => todayHijri.value?.monthName || '')

  return {
    todayHijri,
    isLoading,
    isMalamJumat,
    isSeninaKamis,
    isAyyamulBidh,
    isAsyaraDzulhijjah,
    isNisfuSyaban,
    currentHijriMonth,
    loadToday,
  }
}
