<template>
  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
    <div class="flex items-center gap-3 mb-3">
      <!-- Thumbnail / Icon -->
      <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
        <Music :size="18" class="text-primary-600" />
      </div>
      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-800 truncate">{{ title }}</p>
        <p class="text-xs text-slate-400 truncate">{{ subtitle }}</p>
      </div>
    </div>

    <!-- HTML5 Audio Player native -->
    <audio
      ref="audioRef"
      :src="src"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @error="onError"
      preload="none"
      class="hidden"
    />

    <!-- Custom controls -->
    <div class="flex items-center gap-3">
      <!-- Play/Pause button -->
      <button
        @click="togglePlay"
        :disabled="isError"
        class="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
        :class="isError ? 'bg-slate-200 text-slate-400' : 'bg-primary-600 text-white active:bg-primary-700'"
      >
        <Loader v-if="isLoading" :size="16" class="animate-spin" />
        <Pause v-else-if="isPlaying" :size="16" />
        <Play v-else :size="16" />
      </button>

      <!-- Progress bar -->
      <div class="flex-1">
        <input
          type="range"
          :min="0"
          :max="duration || 100"
          :value="currentTime"
          @input="seek"
          class="w-full h-1.5 rounded-full accent-primary-600"
          :disabled="!duration"
        />
        <div class="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <p v-if="isError" class="text-xs text-rose-500 mt-2 text-center">
      Audio tidak tersedia. Cek koneksi internet.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Play, Pause, Music, Loader } from 'lucide-vue-next'

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: 'Audio Murottal' },
  subtitle: { type: String, default: '' },
})

const audioRef = ref(null)
const isPlaying = ref(false)
const isLoading = ref(false)
const isError = ref(false)
const currentTime = ref(0)
const duration = ref(0)

function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    isLoading.value = true
    audioRef.value.play()
      .then(() => {
        isPlaying.value = true
        isLoading.value = false
      })
      .catch(() => {
        isError.value = true
        isLoading.value = false
      })
  }
}

function seek(e) {
  if (!audioRef.value) return
  audioRef.value.currentTime = e.target.value
}

function onTimeUpdate() {
  currentTime.value = audioRef.value?.currentTime || 0
}

function onLoadedMetadata() {
  duration.value = audioRef.value?.duration || 0
  isLoading.value = false
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

function onError() {
  isError.value = true
  isLoading.value = false
  isPlaying.value = false
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>
