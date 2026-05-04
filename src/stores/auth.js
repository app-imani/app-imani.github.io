// src/stores/auth.js
// State global autentikasi + persistensi ke localStorage

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const SESSION_KEY = 'imani_auth_session'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)       // { uid, email, displayName, photoURL, onboardingDone }
  const token = ref(null)      // Firebase ID Token (JWT)
  const isGuest = ref(false)
  const isLoading = ref(true)  // true saat pertama load (hydrate dari localStorage)
  const guestOnboarded = ref(!!localStorage.getItem('imani_settings_onboarded'))

  // Computed
  const isAuthenticated = computed(() => !!user.value || isGuest.value)
  const userId = computed(() => user.value?.uid || (isGuest.value ? 'guest' : null))

  const needsOnboarding = computed(() => {
    if (isGuest.value) return !guestOnboarded.value
    return !user.value?.onboardingDone
  })

  // Actions

  /**
   * Dipanggil setelah Firebase auth berhasil.
   * Kirim token ke GAS untuk upsert user, lalu simpan session.
   * @param {import('firebase/auth').User} firebaseUser
   * @param {string} idToken
   * @param {string|null} displayName  – override nama (untuk register)
   */
  async function initSession(firebaseUser, idToken, displayName = null) {
    token.value = idToken

    // Lazy import untuk menghindari circular dependency
    const { useGasApi } = await import('@/composables/useGasApi')
    const { post } = useGasApi()

    try {
      const response = await post('initUser', {
        displayName: displayName || firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
      })

      const data = response?.data || {}
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: data.displayName || displayName || firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        onboardingDone: !!data.onboardingDone,
        isNewUser: !!data.isNewUser,
      }
    } catch (e) {
      // GAS tidak tersedia (offline/dev) → tetap set user dari Firebase data
      console.warn('[authStore] GAS initUser gagal, pakai data Firebase:', e.message)
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        onboardingDone: false,
        isNewUser: true,
      }
    }

    isGuest.value = false
    saveToStorage()
  }

  /**
   * Guest mode: tidak ada Firebase, data hanya di localStorage
   */
  function continueAsGuest() {
    isGuest.value = true
    user.value = null
    token.value = null
    saveToStorage()
  }

  /**
   * Dipanggil oleh onAuthStateChanged saat Firebase refresh token
   */
  function updateToken(newToken) {
    token.value = newToken
    // Update storage token tanpa mengubah user data
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      try {
        const session = JSON.parse(raw)
        session.token = newToken
        session.savedAt = Date.now()
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      } catch { /* */ }
    }
  }

  /**
   * Tandai onboarding selesai (dipanggil oleh OnboardingView)
   */
  function setOnboardingDone() {
    if (user.value) user.value.onboardingDone = true
    guestOnboarded.value = true
    saveToStorage()
  }

  function clearSession() {
    user.value = null
    token.value = null
    isGuest.value = false
    localStorage.removeItem(SESSION_KEY)
  }

  /**
   * Hydrate store dari localStorage saat app pertama load.
   * Harus dipanggil di main.js sebelum router.isReady()
   */
  function hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) {
        isLoading.value = false
        return
      }
      const session = JSON.parse(raw)

      // Session dianggap valid max 7 hari (token akan di-refresh oleh Firebase listener)
      const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
      if (session.savedAt && Date.now() - session.savedAt > SESSION_TTL_MS) {
        clearSession()
        isLoading.value = false
        return
      }

      user.value = session.user || null
      token.value = session.token || null
      isGuest.value = session.isGuest || false
    } catch {
      clearSession()
    } finally {
      isLoading.value = false
    }
  }

  function saveToStorage() {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      user: user.value,
      token: token.value,   // Disimpan untuk request saat offline
      isGuest: isGuest.value,
      savedAt: Date.now(),
    }))
  }

  return {
    user, token, isGuest, isLoading,
    isAuthenticated, userId, needsOnboarding,
    initSession, continueAsGuest, updateToken,
    setOnboardingDone, clearSession, hydrateFromStorage,
  }
})
