import { ref } from 'vue'

/**
 * useGeolocation — Deteksi lokasi user via Browser Geolocation API
 * Strategi akurasi tinggi:
 *   1. Coba enableHighAccuracy=true (GPS hardware) max 20 detik
 *   2. Jika gagal/timeout, fallback ke enableHighAccuracy=false (network/cell)
 *   3. Reverse geocoding paralel via BigDataCloud + Nominatim sebagai fallback
 *   4. Hasil reverse geocoding dicocokkan dengan daftar kota Indonesia
 */
export function useGeolocation() {
  const latitude = ref(null)
  const longitude = ref(null)
  const accuracy = ref(null)   // meter
  const cityName = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isSupported = 'geolocation' in navigator

  // ─── Low-level position request ───────────────────────────────────────────

  function _requestPosition(highAccuracy, timeoutMs) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: 0,   // selalu ambil posisi baru, jangan pakai cache
        }
      )
    })
  }

  /**
   * Request koordinat GPS dengan fallback:
   *   Pertama coba high accuracy (GPS), jika timeout/unavailable → network based.
   */
  async function getCurrentPosition() {
    if (!isSupported) {
      error.value = 'Geolocation tidak didukung browser ini'
      return null
    }

    isLoading.value = true
    error.value = null

    let position = null

    // Tahap 1: high accuracy GPS (timeout 20 detik)
    try {
      position = await _requestPosition(true, 20000)
    } catch (err1) {
      // Jika ditolak user — langsung hentikan
      if (err1.code === 1 /* PERMISSION_DENIED */) {
        error.value = 'Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser, lalu coba lagi.'
        isLoading.value = false
        return null
      }
      // Timeout atau unavailable → coba lagi dengan akurasi rendah (lebih cepat)
      try {
        position = await _requestPosition(false, 10000)
      } catch (err2) {
        switch (err2.code) {
          case 2: error.value = 'Sinyal GPS tidak tersedia. Pastikan GPS aktif atau coba di luar ruangan.'; break
          case 3: error.value = 'Waktu habis. Pastikan GPS aktif dan coba lagi.'; break
          default: error.value = 'Gagal mendapatkan lokasi. Pilih kota manual.'
        }
        isLoading.value = false
        return null
      }
    }

    latitude.value  = position.coords.latitude
    longitude.value = position.coords.longitude
    accuracy.value  = Math.round(position.coords.accuracy)  // meter

    // Reverse geocoding (BigDataCloud + fallback Nominatim, jalan paralel)
    await reverseGeocode(latitude.value, longitude.value)

    isLoading.value = false
    return {
      latitude:  latitude.value,
      longitude: longitude.value,
      accuracy:  accuracy.value,
    }
  }

  // ─── Reverse geocoding ────────────────────────────────────────────────────

  /**
   * Coba BigDataCloud dulu. Jika hasilnya kosong, coba Nominatim.
   * Keduanya gratis & tanpa API key.
   */
  async function reverseGeocode(lat, lon) {
    cityName.value = null

    const [bdc, nom] = await Promise.allSettled([
      _reverseBigDataCloud(lat, lon),
      _reverseNominatim(lat, lon),
    ])

    // Ambil hasil terbaik (non-null, prefer BigDataCloud)
    const bdcCity = bdc.status === 'fulfilled' ? bdc.value : null
    const nomCity = nom.status === 'fulfilled' ? nom.value : null

    cityName.value = bdcCity || nomCity || null
  }

  async function _reverseBigDataCloud(lat, lon) {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) return null
      const d = await res.json()
      // Level 4–6 = kota/kabupaten dalam Indonesia
      const fromAdmin = d.localityInfo?.administrative
        ?.sort((a, b) => b.adminLevel - a.adminLevel)
        ?.find(a => a.adminLevel >= 4 && a.adminLevel <= 7)?.name
      return _cleanCityName(d.city || d.locality || fromAdmin || d.principalSubdivision)
    } catch {
      return null
    }
  }

  async function _reverseNominatim(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=id`
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'imani-app/1.0' },
      })
      if (!res.ok) return null
      const d = await res.json()
      const a = d.address || {}
      // Coba berbagai field nama kota Nominatim
      return _cleanCityName(
        a.city || a.town || a.municipality || a.county || a.state_district || a.suburb
      )
    } catch {
      return null
    }
  }

  /** Bersihkan nama kota: hapus prefix "Kota ", "Kabupaten ", dst. */
  function _cleanCityName(name) {
    if (!name) return null
    return name
      .replace(/^(kota|kabupaten|kab\.?)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim() || null
  }

  // ─── Public convenience wrapper ───────────────────────────────────────────

  /**
   * Kembalikan objek lokasi lengkap.
   * city = null jika reverse geocoding gagal (komponen tampilkan picker).
   */
  async function getLocation() {
    const pos = await getCurrentPosition()
    if (!pos) return null
    return {
      latitude:  pos.latitude,
      longitude: pos.longitude,
      accuracy:  pos.accuracy,
      city:      cityName.value || null,
      country:   'Indonesia',
    }
  }

  return {
    latitude,
    longitude,
    accuracy,
    cityName,
    isLoading,
    error,
    isSupported,
    getCurrentPosition,
    getLocation,
  }
}
