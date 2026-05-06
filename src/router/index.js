import { createRouter, createWebHashHistory } from 'vue-router'
import { watch } from 'vue'

// Lazy-loaded semua view untuk code splitting optimal
const routes = [
  // ─── Public ───
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
    meta: { public: true, noNav: true, title: 'Masuk' },
  },

  // ─── Onboarding (butuh auth, belum tentu onboarded) ───
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: { requiresAuth: true, noNav: true, title: 'Selamat Datang' },
  },

  // ─── Main app (butuh auth + onboarding selesai) ───
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true, title: 'Beranda' },
  },
  {
    path: '/prayer',
    name: 'prayer',
    component: () => import('@/views/PrayerView.vue'),
    meta: { requiresAuth: true, title: 'Sholat' },
  },
  {
    path: '/fasting',
    name: 'fasting',
    component: () => import('@/views/FastingView.vue'),
    meta: { requiresAuth: true, title: 'Puasa' },
  },
  {
    path: '/quran',
    name: 'quran',
    component: () => import('@/views/QuranView.vue'),
    meta: { requiresAuth: true, title: 'Al-Qur\'an' },
  },
  {
    path: '/cycle',
    name: 'cycle',
    component: () => import('@/views/CycleView.vue'),
    meta: { requiresAuth: true, title: 'Siklus' },
  },
  {
    path: '/amal',
    name: 'amal',
    component: () => import('@/views/AmalView.vue'),
    meta: { requiresAuth: true, title: 'Amalan' },
  },
  {
    path: '/tasbih',
    name: 'tasbih',
    component: () => import('@/views/TasbihView.vue'),
    meta: { requiresAuth: true, title: 'Tasbih' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true, title: 'Pengaturan' },
  },
  {
    path: '/hijri-calendar',
    name: 'hijri-calendar',
    component: () => import('@/views/HijriCalendarView.vue'),
    meta: { requiresAuth: true, noNav: true, title: 'Kalender Hijriah' },
  },

  // Catch-all redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// ─────────────────────────────────────────────────────────────
// Navigation Guard
// Urutan pemeriksaan:
//  1. Tunggu authStore selesai hydrate dari localStorage
//  2. Jika route requiresAuth dan belum login → /auth
//  3. Jika sudah login dan needsOnboarding → /onboarding
//  4. Jika sudah login dan akses /auth → /
// ─────────────────────────────────────────────────────────────
router.beforeEach(async (to) => {
  // Lazy import untuk menghindari circular dependency
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  // 1. Tunggu hydrate selesai (hanya pada load pertama)
  if (authStore.isLoading) {
    await new Promise((resolve) => {
      const stop = watch(
        () => authStore.isLoading,
        (val) => { if (!val) { stop(); resolve() } },
        { immediate: true }
      )
    })
  }

  const isAuthenticated = authStore.isAuthenticated

  // 2. Route butuh auth tapi belum login → redirect ke /auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: '/auth' }
  }

  // 3. Sudah login, butuh onboarding, bukan menuju /onboarding → redirect
  if (to.meta.requiresAuth && isAuthenticated && authStore.needsOnboarding) {
    if (to.path !== '/onboarding') {
      return { path: '/onboarding' }
    }
  }

  // 4. Sudah login tapi akses /auth → redirect ke home
  if (to.path === '/auth' && isAuthenticated) {
    return { path: '/' }
  }
})

export default router
