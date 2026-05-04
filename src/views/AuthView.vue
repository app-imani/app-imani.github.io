<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 flex flex-col items-center justify-center px-5 py-10">

    <!-- Logo & Tagline -->
    <div class="text-center mb-8">
      <div class="text-5xl mb-3">🌙</div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Imani</h1>
      <p class="text-primary-200 text-sm mt-1">Teman Ibadah Harianmu ✨</p>
    </div>

    <!-- Card -->
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

      <!-- Tabs -->
      <div class="flex border-b border-slate-100">
        <button
          v-for="tab in ['masuk', 'daftar']"
          :key="tab"
          @click="activeTab = tab"
          class="flex-1 py-4 text-sm font-semibold capitalize transition-colors"
          :class="activeTab === tab
            ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
            : 'text-slate-400'"
        >
          {{ tab === 'masuk' ? '👋 Masuk' : '✨ Daftar' }}
        </button>
      </div>

      <div class="p-6">

        <!-- Error banner -->
        <Transition name="shake">
          <div v-if="firebaseAuth.error.value" class="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
            <AlertCircle :size="16" class="text-red-400 mt-0.5 shrink-0" />
            <p class="text-xs text-red-600 leading-relaxed">{{ firebaseAuth.error.value }}</p>
          </div>
        </Transition>

        <!-- ─── TAB: MASUK ─── -->
        <form v-if="activeTab === 'masuk'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="text-xs font-medium text-slate-600 mb-1 block">Email</label>
            <input
              v-model="loginForm.email"
              type="email"
              autocomplete="email"
              placeholder="email@contoh.com"
              class="input-base"
              required
            />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-600 mb-1 block">Password</label>
            <div class="relative">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Minimal 6 karakter"
                class="input-base pr-10"
                required
              />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 active:opacity-60">
                <Eye v-if="!showPassword" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="handleForgotPassword"
            class="text-xs text-primary-600 font-medium -mt-1 block active:opacity-60"
          >
            Lupa password?
          </button>

          <button
            type="submit"
            :disabled="firebaseAuth.loading.value"
            class="btn-primary w-full"
          >
            <LoadingSpinner v-if="firebaseAuth.loading.value" class="w-4 h-4 mr-2" />
            {{ firebaseAuth.loading.value ? 'Memproses...' : 'Masuk dengan Email' }}
          </button>

          <Divider />

          <button
            type="button"
            @click="firebaseAuth.loginWithGoogle()"
            :disabled="firebaseAuth.loading.value || !isFirebaseConfigured"
            class="btn-google w-full"
          >
            <GoogleIcon class="w-4 h-4 mr-2 shrink-0" />
            Lanjutkan dengan Google
          </button>
        </form>

        <!-- ─── TAB: DAFTAR ─── -->
        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="text-xs font-medium text-slate-600 mb-1 block">Nama panggilan</label>
            <input v-model="registerForm.name" type="text" placeholder="Misal: Fatimah"
              maxlength="30" class="input-base" required />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-600 mb-1 block">Email</label>
            <input v-model="registerForm.email" type="email" autocomplete="email"
              placeholder="email@contoh.com" class="input-base" required />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-600 mb-1 block">Password</label>
            <div class="relative">
              <input v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password" placeholder="Minimal 6 karakter"
                class="input-base pr-10" required minlength="6" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Eye v-if="!showPassword" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-600 mb-1 block">Konfirmasi password</label>
            <input v-model="registerForm.confirm"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ulangi password"
              class="input-base" required />
            <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">Password tidak cocok</p>
          </div>

          <label class="flex items-start gap-2 cursor-pointer">
            <input v-model="registerForm.agree" type="checkbox"
              class="mt-0.5 accent-primary-500 w-4 h-4" required />
            <span class="text-xs text-slate-500 leading-relaxed">
              Saya menyetujui <a href="#" class="text-primary-600 underline">Syarat & Ketentuan</a>
            </span>
          </label>

          <button type="submit"
            :disabled="firebaseAuth.loading.value || passwordMismatch || !registerForm.agree"
            class="btn-primary w-full">
            <LoadingSpinner v-if="firebaseAuth.loading.value" class="w-4 h-4 mr-2" />
            {{ firebaseAuth.loading.value ? 'Mendaftar...' : 'Daftar dengan Email' }}
          </button>

          <Divider />

          <button type="button"
            @click="firebaseAuth.loginWithGoogle()"
            :disabled="firebaseAuth.loading.value || !isFirebaseConfigured"
            class="btn-google w-full">
            <GoogleIcon class="w-4 h-4 mr-2 shrink-0" />
            Daftar dengan Google
          </button>
        </form>

        <!-- Guest mode -->
        <div class="mt-5 pt-4 border-t border-slate-100 text-center">
          <button @click="handleGuestMode" class="text-xs text-slate-400 hover:text-slate-600 transition-colors active:opacity-60">
            Lanjutkan sebagai Tamu →
          </button>
        </div>

      </div>
    </div>

    <!-- Guest mode info & offline notice -->
    <div class="mt-4 max-w-sm w-full">
      <!-- Offline notice -->
      <div v-if="!isOnline" class="text-center px-4 py-3 rounded-2xl bg-amber-500/20 border border-amber-400/30">
        <p class="text-xs text-amber-100">
          📶 Tidak ada koneksi. Mode tamu masih bisa diakses.
        </p>
      </div>

      <!-- Firebase not configured notice (dev mode) -->
      <div v-else-if="!isFirebaseConfigured" class="text-center px-4 py-3 rounded-2xl bg-white/10">
        <p class="text-xs text-primary-200">
          ⚙️ Firebase belum dikonfigurasi. Gunakan mode tamu untuk mencoba aplikasi.
        </p>
      </div>
    </div>

    <!-- Forgot password modal -->
    <ModalBase v-model="showForgotModal" title="Reset Password">
      <div class="p-5 space-y-4">
        <p class="text-sm text-slate-500 leading-relaxed">
          Masukkan email terdaftar. Kami akan kirim link untuk reset password.
        </p>
        <input v-model="forgotEmail" type="email" placeholder="email@contoh.com" class="input-base" />
        <div v-if="forgotSuccess" class="p-3 rounded-xl bg-emerald-50 text-xs text-emerald-600 font-medium">
          ✉️ Email reset password telah dikirim!
        </div>
        <button @click="sendReset"
          :disabled="!forgotEmail || firebaseAuth.loading.value"
          class="btn-primary w-full">
          Kirim Link Reset
        </button>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, Eye, EyeOff } from 'lucide-vue-next'

import ModalBase from '@/components/ui/ModalBase.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

import { useFirebaseAuth } from '@/composables/useFirebaseAuth'
import { useAuthStore } from '@/stores/auth'
import { isFirebaseConfigured } from '@/firebase'

const router = useRouter()
const authStore = useAuthStore()
const firebaseAuth = useFirebaseAuth()

const activeTab = ref('masuk')
const showPassword = ref(false)
const isOnline = ref(navigator.onLine)
window.addEventListener('online',  () => { isOnline.value = true  })
window.addEventListener('offline', () => { isOnline.value = false })

// ─── Form state ───
const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ name: '', email: '', password: '', confirm: '', agree: false })
const passwordMismatch = computed(() =>
  registerForm.value.confirm && registerForm.value.password !== registerForm.value.confirm
)

// ─── Forgot password ───
const showForgotModal = ref(false)
const forgotEmail = ref('')
const forgotSuccess = ref(false)

async function handleLogin() {
  await firebaseAuth.loginWithEmail(loginForm.value.email, loginForm.value.password)
}

async function handleRegister() {
  if (passwordMismatch.value || !registerForm.value.agree) return
  await firebaseAuth.registerWithEmail(
    registerForm.value.email,
    registerForm.value.password,
    registerForm.value.name,
  )
}

function handleGuestMode() {
  authStore.continueAsGuest()
  navigateAfterAuth()
}

function handleForgotPassword() {
  forgotEmail.value = loginForm.value.email || ''
  forgotSuccess.value = false
  showForgotModal.value = true
}

async function sendReset() {
  const ok = await firebaseAuth.resetPassword(forgotEmail.value)
  if (ok) forgotSuccess.value = true
}

function navigateAfterAuth() {
  if (authStore.needsOnboarding) {
    router.replace('/onboarding')
  } else {
    router.replace('/')
  }
}

// ─── Inline sub-components ───
const Divider = {
  template: `
    <div class="flex items-center gap-3">
      <div class="flex-1 h-px bg-slate-100" />
      <span class="text-xs text-slate-300 font-medium">atau</span>
      <div class="flex-1 h-px bg-slate-100" />
    </div>
  `,
}

const GoogleIcon = {
  template: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" :class="$attrs.class">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  `,
}
</script>

<style scoped>
.input-base {
  @apply w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
         text-sm text-slate-800 outline-none
         focus:ring-2 focus:ring-primary-300 focus:border-primary-400 focus:bg-white
         transition-all;
}

.btn-primary {
  @apply flex items-center justify-center py-3.5 rounded-xl font-semibold text-sm text-white
         bg-primary-600 hover:bg-primary-700 active:scale-95
         disabled:opacity-40 disabled:cursor-not-allowed transition-all;
}

.btn-google {
  @apply flex items-center justify-center py-3.5 rounded-xl font-semibold text-sm text-slate-700
         bg-white border border-slate-200 hover:bg-slate-50 active:scale-95
         disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm;
}

/* Shake animation for error */
.shake-enter-active {
  animation: shake 0.4s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
</style>
