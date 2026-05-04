import { ref } from 'vue'

/**
 * useGasApi — Wrapper fetch ke Google Apps Script backend
 *
 * CORS note: GAS tidak mendukung preflight OPTIONS.
 * Aturan "simple request" harus dipenuhi:
 *   - GET: tidak ada custom header (token di query param)
 *   - POST: Content-Type: text/plain (bukan application/json),
 *           token di dalam JSON body (bukan header)
 */

let _authProvider = null

export function setAuthProvider(fn) {
  _authProvider = fn
}

function getAuthInfo() {
  if (typeof _authProvider === 'function') {
    try { return _authProvider() } catch { /* */ }
  }
  return { token: null, userId: null }
}

export function useGasApi() {
  const isLoading = ref(false)
  const error = ref(null)

  const BASE_URL = import.meta.env.VITE_GAS_BACKEND_URL

  /**
   * GET request ke GAS backend
   * Token dikirim sebagai query param (bukan header) agar tidak memicu preflight.
   */
  async function get(action, params = {}) {
    if (!BASE_URL) {
      console.warn('[GAS API] VITE_GAS_BACKEND_URL belum dikonfigurasi, skip request')
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const auth = getAuthInfo()
      const searchParams = new URLSearchParams({
        action,
        ...(auth.userId ? { userId: auth.userId } : {}),
        ...(auth.token ? { token: auth.token } : {}),
        ...params,
      })

      // Tidak ada custom header → simple request → no preflight
      const response = await fetch(`${BASE_URL}?${searchParams.toString()}`, {
        method: 'GET',
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      if (!result.success) throw new Error(result.message || 'Request gagal')
      return result
    } catch (err) {
      error.value = err.message
      console.error(`[GAS API] GET ${action} error:`, err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * POST request ke GAS backend
   * Content-Type: text/plain agar tidak memicu preflight OPTIONS.
   * GAS membaca body sebagai string lalu JSON.parse di doPost.
   */
  async function post(action, data = {}) {
    if (!BASE_URL) {
      console.warn('[GAS API] VITE_GAS_BACKEND_URL belum dikonfigurasi, skip request')
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const auth = getAuthInfo()

      // Token di dalam body (bukan header) → tidak perlu custom header
      const body = {
        action,
        ...(auth.userId ? { userId: auth.userId } : {}),
        ...(auth.token ? { token: auth.token } : {}),
        data,
      }

      // Content-Type: text/plain = simple request = no preflight
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      if (!result.success) throw new Error(result.message || 'Request gagal')
      return result
    } catch (err) {
      error.value = err.message
      console.error(`[GAS API] POST ${action} error:`, err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { get, post, isLoading, error }
}
