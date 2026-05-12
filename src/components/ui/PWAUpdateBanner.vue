<template>
  <!-- ════════════════════════════════════════════
       PWA Update Banner — notifikasi ada versi baru
  ════════════════════════════════════════════ -->
  <Transition name="slide-down">
    <div
      v-if="needRefresh"
      class="fixed top-0 left-0 right-0 z-[60] px-3 pt-safe"
      style="padding-top: max(env(safe-area-inset-top, 0px), 8px);"
    >
      <div class="max-w-md mx-auto rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-300/50 px-4 py-3 flex items-center gap-3">
        <!-- Icon -->
        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <span class="text-base">✨</span>
        </div>

        <!-- Text -->
        <div class="flex-1 min-w-0">
          <p class="text-white font-bold text-xs leading-tight">Versi Terbaru Tersedia</p>
          <p class="text-white/70 text-[11px] mt-0.5">Perbarui untuk mendapatkan fitur terbaru</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            @click="dismissUpdate"
            class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white/70 active:bg-white/30 transition-colors"
            aria-label="Tutup"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button
            @click="applyUpdate"
            class="px-3 py-1.5 rounded-xl bg-white text-purple-600 text-xs font-bold active:scale-95 transition-transform"
          >
            Perbarui
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Offline ready toast (sekali tampil) -->
  <Transition name="slide-down">
    <div
      v-if="showOfflineReady"
      class="fixed top-0 left-0 right-0 z-[60] px-3 pt-safe"
      style="padding-top: max(env(safe-area-inset-top, 0px), 8px);"
    >
      <div class="max-w-md mx-auto rounded-2xl bg-emerald-500 shadow-lg px-4 py-3 flex items-center gap-3">
        <span class="text-base flex-shrink-0">✅</span>
        <p class="text-white text-xs font-semibold flex-1">Imani siap digunakan offline!</p>
        <button
          @click="showOfflineReady = false"
          class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePWAInstall } from '@/composables/usePWAInstall'

const { needRefresh, offlineReady, applyUpdate, dismissUpdate } = usePWAInstall()

const showOfflineReady = ref(false)

// Tampilkan toast "siap offline" hanya sekali, auto-dismiss setelah 4 detik
watch(offlineReady, (ready) => {
  if (ready) {
    showOfflineReady.value = true
    setTimeout(() => { showOfflineReady.value = false }, 4000)
  }
})
</script>

<style scoped>
.pt-safe { padding-top: env(safe-area-inset-top, 0px); }

.slide-down-enter-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
}
.slide-down-leave-active {
  transition: transform 0.25s ease-in, opacity 0.2s ease;
}
.slide-down-enter-from { transform: translateY(-100%); opacity: 0; }
.slide-down-leave-to { transform: translateY(-100%); opacity: 0; }
</style>
