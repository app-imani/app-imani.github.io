import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/assets/styles/main.css'
import { setAuthProvider } from '@/composables/useGasApi'
import { useAuthStore } from '@/stores/auth'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

const app = createApp(App)

// 1. Pinia harus di-use pertama sebelum store dapat dipakai
const pinia = createPinia()
app.use(pinia)

// 2. Hydrate auth session dari localStorage (sync)
const authStore = useAuthStore()
authStore.hydrateFromStorage()

// 3. Sediakan auth info ke useGasApi tanpa circular dependency
setAuthProvider(() => ({
  token: authStore.token,
  userId: authStore.userId,
  spreadsheetId: authStore.spreadsheetId,
}))

// 4. Mulai watch Firebase auth state (token refresh, logout eksternal, dll.)
const { watchAuthState } = useFirebaseAuth()
watchAuthState()

// 5. Router
app.use(router)

// 6. Mount setelah router siap agar guard pertama berjalan dengan benar
router.isReady().then(() => {
  app.mount('#app')
})
