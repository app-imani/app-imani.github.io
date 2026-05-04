import { ref } from 'vue'

/**
 * useGeolocation — Deteksi lokasi user via Browser Geolocation API
 * Dengan fallback ke nama kota manual
 */
export function useGeolocation() {
  const latitude = ref(null)
  const longitude = ref(null)
  const cityName = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isSupported = 'geolocation' in navigator

  /**
   * Request koordinat GPS user
   * @returns {Promise<{ latitude: number, longitude: number } | null>}
   */
  async function getCurrentPosition() {
    if (!isSupported) {
      error.value = 'Geolocation tidak didukung browser ini'
      return null
    }

    isLoading.value = true
    error.value = null

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          latitude.value = position.coords.latitude
          longitude.value = position.coords.longitude

          // Reverse geocoding via BigDataCloud (gratis, tanpa API key)
          await reverseGeocode(latitude.value, longitude.value)

          isLoading.value = false
          resolve({ latitude: latitude.value, longitude: longitude.value })
        },
        (err) => {
          isLoading.value = false
          switch (err.code) {
            case err.PERMISSION_DENIED:
              error.value = 'Izin lokasi ditolak. Silakan aktifkan di pengaturan.'
              break
            case err.POSITION_UNAVAILABLE:
              error.value = 'Informasi lokasi tidak tersedia.'
              break
            case err.TIMEOUT:
              error.value = 'Request lokasi timeout.'
              break
            default:
              error.value = 'Gagal mendapatkan lokasi.'
          }
          resolve(null)
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000, // Cache 5 menit
        }
      )
    })
  }

  /**
   * Reverse geocoding via BigDataCloud API
   * @param {number} lat
   * @param {number} lon
   */
  async function reverseGeocode(lat, lon) {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`
      const response = await fetch(url)
      if (!response.ok) return

      const data = await response.json()
      cityName.value = data.city || data.locality || data.principalSubdivision || 'Lokasi Saya'
    } catch (err) {
      console.warn('[useGeolocation] Reverse geocoding gagal:', err)
      cityName.value = 'Lokasi Saya'
    }
  }

  return {
    latitude,
    longitude,
    cityName,
    isLoading,
    error,
    isSupported,
    getCurrentPosition,
  }
}
