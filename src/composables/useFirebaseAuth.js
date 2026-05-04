// src/composables/useFirebaseAuth.js
// Semua logika Firebase Auth terpusat di sini

import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { isFirebaseConfigured } from '@/firebase'
import { useRouter } from 'vue-router'

export function useFirebaseAuth() {
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()
  const router = useRouter()

  // Helper: redirect setelah login berhasil
  function redirectAfterLogin() {
    if (authStore.needsOnboarding) {
      router.replace('/onboarding')
    } else {
      router.replace('/')
    }
  }

  // Lazy-load Firebase fungsi agar tidak crash jika env tidak dikonfigurasi
  async function getFirebaseAuth() {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase belum dikonfigurasi. Tambahkan VITE_FIREBASE_* ke .env')
    }
    const { auth, googleProvider } = await import('@/firebase')
    return { auth, googleProvider }
  }

  // ─────────────────────────────────────────
  // Google Sign-In
  // ─────────────────────────────────────────
  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const { auth, googleProvider } = await getFirebaseAuth()
      const { signInWithPopup } = await import('firebase/auth')
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      await authStore.initSession(result.user, token)
      redirectAfterLogin()
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        error.value = mapFirebaseError(e.code) || e.message
      }
    } finally {
      loading.value = false
    }
  }

  // ─────────────────────────────────────────
  // Email/Password Register
  // ─────────────────────────────────────────
  async function registerWithEmail(email, password, displayName) {
    loading.value = true
    error.value = null
    try {
      const { auth } = await getFirebaseAuth()
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
      const result = await createUserWithEmailAndPassword(auth, email, password)
      // Set displayName di Firebase
      await updateProfile(result.user, { displayName })
      const token = await result.user.getIdToken()
      await authStore.initSession(result.user, token, displayName)
      redirectAfterLogin()
    } catch (e) {
      error.value = mapFirebaseError(e.code) || e.message
    } finally {
      loading.value = false
    }
  }

  // ─────────────────────────────────────────
  // Email/Password Login
  // ─────────────────────────────────────────
  async function loginWithEmail(email, password) {
    loading.value = true
    error.value = null
    try {
      const { auth } = await getFirebaseAuth()
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const result = await signInWithEmailAndPassword(auth, email, password)
      const token = await result.user.getIdToken()
      await authStore.initSession(result.user, token)
      redirectAfterLogin()
    } catch (e) {
      error.value = mapFirebaseError(e.code) || e.message
    } finally {
      loading.value = false
    }
  }

  // ─────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────
  async function logout() {
    try {
      if (isFirebaseConfigured) {
        const { auth } = await import('@/firebase')
        const { signOut } = await import('firebase/auth')
        if (auth) await signOut(auth)
      }
    } finally {
      authStore.clearSession()
    }
  }

  // ─────────────────────────────────────────
  // Reset Password
  // ─────────────────────────────────────────
  async function resetPassword(email) {
    loading.value = true
    error.value = null
    try {
      const { auth } = await getFirebaseAuth()
      const { sendPasswordResetEmail } = await import('firebase/auth')
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (e) {
      error.value = mapFirebaseError(e.code) || e.message
      return false
    } finally {
      loading.value = false
    }
  }

  // ─────────────────────────────────────────
  // Auth State Watcher — untuk auto token refresh
  // Firebase refresh token otomatis setiap ~55 menit.
  // Dipanggil sekali di main.js.
  // ─────────────────────────────────────────
  async function watchAuthState() {
    if (!isFirebaseConfigured) return
    try {
      const { auth } = await import('@/firebase')
      const { onAuthStateChanged } = await import('firebase/auth')
      if (!auth) return

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Refresh token terbaru
          const freshToken = await firebaseUser.getIdToken()
          authStore.updateToken(freshToken)
        } else {
          // User logout dari Firebase (misal: hapus akun dari konsol)
          // Hanya clear jika bukan guest mode
          if (!authStore.isGuest) {
            authStore.clearSession()
          }
        }
      })
    } catch (e) {
      console.warn('[useFirebaseAuth] watchAuthState error:', e)
    }
  }

  return {
    loading, error,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    resetPassword,
    watchAuthState,
  }
}

// ─────────────────────────────────────────
// Mapping error code Firebase → pesan Indonesia
// ─────────────────────────────────────────
function mapFirebaseError(code) {
  const map = {
    'auth/email-already-in-use':   'Email sudah terdaftar. Silakan masuk.',
    'auth/invalid-email':          'Format email tidak valid.',
    'auth/weak-password':          'Password minimal 6 karakter.',
    'auth/user-not-found':         'Email tidak ditemukan.',
    'auth/wrong-password':         'Password salah. Coba lagi.',
    'auth/invalid-credential':     'Email atau password salah.',
    'auth/too-many-requests':      'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/network-request-failed': 'Gagal terhubung. Periksa koneksi internet.',
    'auth/user-disabled':          'Akun ini telah dinonaktifkan.',
    'auth/requires-recent-login':  'Sesi berakhir. Silakan masuk ulang.',
  }
  return map[code] || null
}
