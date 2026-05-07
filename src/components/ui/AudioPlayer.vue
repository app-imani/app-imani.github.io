<template>
  <!-- Mini player bar — muncul di bagian bawah layar saat ada audio yang dimuat -->
  <Transition name="slide-up">
    <div
      v-if="currentUrl"
      class="fixed bottom-16 left-0 right-0 z-40 mx-4 mb-1 rounded-2xl bg-slate-900/95 backdrop-blur-sm shadow-lg px-4 py-3"
    >
      <div class="flex items-center gap-3">
        <!-- Play/Pause -->
        <button
          @click="isPlaying ? pause() : play(currentUrl, currentLabel)"
          class="shrink-0 w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Pause v-if="isPlaying" :size="16" class="text-white" />
          <Play v-else :size="16" class="text-white ml-0.5" />
        </button>

        <!-- Info + progress -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-white truncate">{{ currentLabel || 'Audio' }}</p>
          <div class="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
            <div class="h-full bg-primary-400 rounded-full transition-all" :style="{ width: `${progress}%` }" />
          </div>
          <p class="text-xs text-white/40 mt-0.5">{{ formattedTime }}</p>
        </div>

        <!-- Playback rate -->
        <button @click="cycleRate" class="shrink-0 text-xs font-bold text-white/60 active:text-white w-8 text-center">
          {{ playbackRate }}×
        </button>

        <!-- Close -->
        <button @click="stop" class="shrink-0 text-white/40 active:text-white">
          <X :size="18" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { Play, Pause, X } from 'lucide-vue-next'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const { currentUrl, currentLabel, isPlaying, progress, formattedTime, playbackRate, play, pause, stop, setRate } = useAudioPlayer()

const RATES = [0.75, 1.0, 1.25, 1.5, 2.0]

function cycleRate() {
  const idx = RATES.indexOf(playbackRate.value)
  const next = RATES[(idx + 1) % RATES.length]
  setRate(next)
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
