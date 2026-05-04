import { ref } from 'vue'

/**
 * useGasApi — Wrapper fetch ke Google Apps Script backend
 * Setiap request otomatis menyertakan Firebase ID Token via X-Firebase-Token header.
 *
 * Auth provider di-set dari main.js via setAuthProvider() agar tidak ada
 * circular dependency antara composable ini dan Pinia store.
 */

// Module-level auth provider — di-set oleh main.js
let _authProvider = null

/**
 * Dipanggil dari main.js setelah Pinia diinisialisasi.
 * @param {() => { token: string|null, userId: string|null }} fn
 */
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
        ...params,
      })

      const headers = { 'Content-Type': 'application/json' }
      if (auth.token) headers['X-Firebase-Token'] = auth.token

      const response = await fetch(`${BASE_URL}?${searchParams.toString()}`, {
        method: 'GET',
        headers,
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
      const headers = { 'Content-Type': 'application/json' }
      if (auth.token) headers['X-Firebase-Token'] = auth.token

      const body = {
        action,
        ...(auth.userId ? { userId: auth.userId } : {}),
        // Token juga di-include di body untuk action=initUser (sebelum header auth)
        ...(action === 'initUser' && data.token ? { token: data.token } : {}),
        data,
      }

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers,
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

