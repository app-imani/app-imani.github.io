<template>
  <!-- ════════════════════════════════════════════
       PWA Install Banner — "Tambahkan ke Layar Utama"
       Muncul sebagai bottom sheet yang bisa di-swipe dismiss
  ════════════════════════════════════════════ -->

  <!-- Overlay backdrop (mobile) -->
  <Transition name="backdrop">
    <div
      v-if="show"
      class="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
      @click="handleDismiss"
    />
  </Transition>

  <!-- Bottom Sheet -->
  <Transition name="slide-up">
    <div
      v-if="show"
      class="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);"
    >
      <div class="max-w-md mx-auto rounded-3xl bg-white shadow-2xl shadow-purple-200/60 overflow-hidden">

        <!-- Gradient header strip -->
        <div class="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400" />

        <div class="p-5">
          <!-- App identity row -->
          <div class="flex items-center gap-4 mb-4">
            <!-- App icon -->
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200 flex-shrink-0 overflow-hidden">
              <img
                src="/pwa-192x192.png"
                alt="Imani icon"
                class="w-full h-full object-cover"
                @error="iconError = true"
              />
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-800 text-base leading-tight">Imani</p>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Muslimah Daily Tracker
              </p>
              <!-- Stars -->
              <div class="flex items-center gap-0.5 mt-1">
                <span v-for="i in 5" :key="i" class="text-amber-400 text-xs">★</span>
                <span class="text-xs text-slate-400 ml-1">Gratis</span>
              </div>
            </div>

            <!-- Close button -->
            <button
              @click="handleDismiss"
              class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 active:bg-slate-200 transition-colors flex-shrink-0"
              aria-label="Tutup"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Feature highlights -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div
              v-for="feature in features"
              :key="feature.icon"
              class="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl bg-slate-50"
            >
              <span class="text-xl">{{ feature.icon }}</span>
              <span class="text-[10px] text-slate-600 text-center font-medium leading-tight">{{ feature.label }}</span>
            </div>
          </div>

          <!-- Benefits text -->
          <div class="flex items-start gap-2.5 mb-4 bg-purple-50 rounded-2xl p-3">
            <span class="text-purple-500 mt-0.5 flex-shrink-0">✦</span>
            <p class="text-xs text-purple-700 leading-relaxed">
              Akses <strong>lebih cepat</strong> langsung dari layar utama — tanpa buka browser, bekerja <strong>offline</strong>!
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-3">
            <button
              @click="handleDismiss"
              class="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium active:bg-slate-50 transition-colors"
            >
              Nanti saja
            </button>
            <button
              @click="handleInstall"
              :disabled="installing"
              class="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-md shadow-purple-200 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <span v-if="!installing">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="inline -mt-0.5 mr-1">
                  <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Tambahkan
              </span>
              <span v-else class="flex items-center gap-1.5">
                <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Menambahkan…
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePWAInstall } from '@/composables/usePWAInstall'

const { canInstall, triggerInstall, dismissInstall } = usePWAInstall()

const iconError = ref(false)
const installing = ref(false)
const showDelay = ref(false)

// Tunda tampilan 3 detik setelah mount agar tidak langsung mengganggu
onMounted(() => {
  setTimeout(() => { showDelay.value = true }, 3000)
})

const show = computed(() => canInstall.value && showDelay.value)

const features = [
  { icon: '🌙', label: 'Jadwal\nSholat' },
  { icon: '📿', label: 'Amalan\nHarian' },
  { icon: '📵', label: 'Bekerja\nOffline' },
]

async function handleInstall() {
  installing.value = true
  await triggerInstall()
  installing.value = false
}

function handleDismiss() {
  dismissInstall()
}
</script>

<style scoped>
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 16px); }

.slide-up-enter-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
}
.slide-up-leave-active {
  transition: transform 0.25s ease-in, opacity 0.2s ease;
}
.slide-up-enter-from { transform: translateY(100%); opacity: 0; }
.slide-up-leave-to { transform: translateY(100%); opacity: 0; }

.backdrop-enter-active { transition: opacity 0.25s ease; }
.backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }
</style>
