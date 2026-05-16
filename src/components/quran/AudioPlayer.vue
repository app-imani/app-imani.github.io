<template>
  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
    <!-- Header info -->
    <div class="flex items-center gap-3 mb-3">
      <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
        <Music :size="18" class="text-primary-600" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-800 truncate">{{ title }}</p>
        <p class="text-xs text-slate-400 truncate">{{ subtitle }}</p>
      </div>
      <!-- Ayat badge -->
      <div class="shrink-0 text-right">
        <p class="text-xs font-semibold text-primary-600">Ayat {{ currentAyah }} / {{ totalAyahs }}</p>
        <p class="text-[10px] text-slate-400">{{ completedAyahs }} selesai</p>
      </div>
    </div>

    <!-- Surah overall progress bar -->
    <div class="mb-3">
      <div class="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          class="h-full rounded-full bg-emerald-400 transition-all duration-300"
          :style="{ width: surahProgressPercent + '%' }"
        />
      </div>
      <p class="text-[10px] text-slate-400 mt-1 text-right">{{ surahProgressPercent }}% surah</p>
    </div>

    <!-- Hidden audio element — src set manually for iOS compatibility -->
    <audio
      ref="audioRef"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onAyahEnded"
      @error="onError"
      @waiting="isLoading = true"
      @canplay="isLoading = false"
      playsinline
      preload="metadata"
      class="hidden"
    />

    <!-- Controls -->
    <div class="flex items-center gap-3">
      <!-- Prev ayah -->
      <button
        @click="prevAyah"
        :disabled="currentAyah <= 1 || isLoading"
        class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 active:bg-slate-200 disabled:opacity-30 transition-all"
      >
        <SkipBack :size="14" />
      </button>

      <!-- Play/Pause -->
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

      <!-- Next ayah -->
      <button
        @click="nextAyah"
        :disabled="currentAyah >= totalAyahs || isLoading"
        class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 active:bg-slate-200 disabled:opacity-30 transition-all"
      >
        <SkipForward :size="14" />
      </button>

      <!-- Current ayah progress -->
      <div class="flex-1">
        <input
          type="range"
          :min="0"
          :max="duration || 100"
          :value="currentTime"
          @input="seek"
          class="w-full h-1.5 rounded-full accent-primary-600"
          :disabled="!duration || isLoading"
        />
        <div class="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Repeat toggle: none → ayah → surah → none -->
      <button
        @click="cycleRepeat"
        class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all active:scale-90"
        :class="repeatMode !== 'none' ? 'bg-primary-100 text-primary-600' : 'text-slate-300'"
        :title="repeatLabels[repeatMode]"
      >
        <Repeat :size="14" />
      </button>

      <!-- Preview toggle -->
      <button
        @click="togglePreview"
        class="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        :class="showPreview ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300'"
        title="Tampilkan teks ayat"
      >
        <BookOpen :size="14" />
      </button>
    </div>

    <!-- Repeat label -->
    <p v-if="repeatMode !== 'none'" class="text-[10px] text-primary-500 text-center mt-1">
      🔁 {{ repeatLabels[repeatMode] }}
    </p>

    <!-- ── Ayah preview panel ─────────────────────────────── -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="showPreview" class="mt-3 overflow-hidden">
        <!-- Loading -->
        <div v-if="isFetchingAyah" class="flex items-center justify-center gap-2 py-4 text-slate-400 text-xs">
          <Loader :size="14" class="animate-spin" /> Memuat teks ayat…
        </div>

        <!-- Error -->
        <div v-else-if="fetchError" class="text-xs text-rose-500 text-center py-3">
          Gagal memuat teks.
          <button @click="fetchSurahAyahs" class="underline font-medium ml-1">Coba lagi</button>
        </div>

        <!-- Ayah list -->
        <div
          v-else-if="ayahCache[surahNumber]"
          ref="ayahListRef"
          class="max-h-64 overflow-y-auto rounded-xl bg-white border border-slate-100 divide-y divide-slate-50"
        >
          <div
            v-for="(arabicText, idx) in ayahCache[surahNumber]?.arabic"
            :key="idx + 1"
            :data-ayah="idx + 1"
            class="px-3 py-2.5 transition-colors"
            :class="currentAyah === idx + 1
              ? 'bg-emerald-50 border-l-2 border-emerald-400'
              : 'bg-white border-l-2 border-transparent'"
            @click="jumpToAyah(idx + 1)"
          >
            <!-- Ayah number + Arabic -->
            <div class="flex items-start gap-2">
              <span
                class="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                :class="currentAyah === idx + 1 ? 'bg-emerald-400 text-white' : 'bg-slate-100 text-slate-400'"
              >{{ idx + 1 }}</span>
              <p
                class="flex-1 text-right text-base leading-loose font-arabic"
                :class="currentAyah === idx + 1 ? 'text-emerald-800' : 'text-slate-700'"
                dir="rtl"
              >{{ arabicText }}</p>
            </div>
            <!-- Translation -->
            <p class="text-[11px] text-slate-500 mt-1 pl-7 leading-relaxed">
              {{ ayahCache[surahNumber]?.translation[idx] }}
            </p>
          </div>
        </div>
      </div>
    </transition>

    <!-- Error state -->
    <p v-if="isError" class="text-xs text-rose-500 mt-2 text-center">
      Audio tidak tersedia. <button @click="retryLoad" class="underline font-medium">Coba lagi</button>
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Play, Pause, Music, Loader, SkipBack, SkipForward, Repeat, ChevronDown, ChevronUp, BookOpen } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
// IMPR-11: Dynamic BASE_URL based on preferredQari setting
const BASE_URL = computed(() => `https://everyayah.com/data/${settingsStore.preferredQari || 'Alafasy_64kbps'}`)

const props = defineProps({
  surahNumber: { type: Number, required: true },
  totalAyahs:  { type: Number, required: true },
  title:       { type: String, default: 'Audio Murottal' },
  subtitle:    { type: String, default: '' },
})

const audioRef       = ref(null)
const isPlaying      = ref(false)
const isLoading      = ref(false)
const isError        = ref(false)
const currentTime    = ref(0)
const duration       = ref(0)
const currentAyah    = ref(1)
const completedAyahs = ref(0)
const repeatMode     = ref('none') // 'none' | 'ayah' | 'surah'

const repeatLabels = { none: 'Tidak ulang', ayah: 'Ulang ayat ini', surah: 'Ulang surah' }

// ── Ayah preview ─────────────────────────────────────────────
const showPreview    = ref(false)
const ayahCache      = ref({}) // { [surahNumber]: { arabic: [], translation: [] } }
const isFetchingAyah = ref(false)
const fetchError     = ref(false)
const ayahListRef    = ref(null)

const currentAyahData = computed(() => {
  const cache = ayahCache.value[props.surahNumber]
  if (!cache) return null
  const idx = currentAyah.value - 1
  return {
    arabic:      cache.arabic[idx]      || '',
    translation: cache.translation[idx] || '',
  }
})

async function fetchSurahAyahs() {
  if (ayahCache.value[props.surahNumber]) return
  isFetchingAyah.value = true
  fetchError.value     = false
  try {
    const res  = await fetch(`https://api.alquran.cloud/v1/surah/${props.surahNumber}/editions/quran-uthmani,id.indonesian`)
    const json = await res.json()
    if (json.code !== 200) throw new Error('API error')
    const [arabicEdition, transEdition] = json.data
    ayahCache.value[props.surahNumber] = {
      arabic:      arabicEdition.ayahs.map(a => a.text),
      translation: transEdition.ayahs.map(a => a.text),
    }
  } catch {
    fetchError.value = true
  } finally {
    isFetchingAyah.value = false
  }
}

async function togglePreview() {
  showPreview.value = !showPreview.value
  if (showPreview.value) {
    await fetchSurahAyahs()
    await nextTick()
    scrollToCurrentAyah()
  }
}

function scrollToCurrentAyah() {
  const el = ayahListRef.value?.querySelector(`[data-ayah="${currentAyah.value}"]`)
  el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

// Scroll to active ayah whenever it changes while preview is open
watch(currentAyah, () => {
  if (showPreview.value) nextTick(scrollToCurrentAyah)
})

// Clear cache & close preview on surah change
watch(() => props.surahNumber, () => { showPreview.value = false })
// ─────────────────────────────────────────────────────────────

// Build URL for any ayah
function buildAyahUrl(surahNum, ayahNum) {
  const s = String(surahNum).padStart(3, '0')
  const a = String(ayahNum).padStart(3, '0')
  return `${BASE_URL.value}/${s}${a}.mp3`
}

/**
 * Load (and optionally play) an ayah.
 * MUST be called directly from user-gesture handlers or ended/onAyahEnded
 * so iOS still considers it part of the media session.
 */
function loadAyah(ayahNum, autoPlay = false) {
  if (!audioRef.value) return
  currentAyah.value = ayahNum
  currentTime.value = 0
  duration.value    = 0
  isError.value     = false
  isLoading.value   = true

  const url = buildAyahUrl(props.surahNumber, ayahNum)
  audioRef.value.src  = url
  audioRef.value.load()

  if (autoPlay) {
    // iOS: play() called synchronously after .load() while still in event context
    audioRef.value.play()
      .then(() => { isPlaying.value = true })
      .catch(() => { isError.value = true; isLoading.value = false })
  }
}

// Set up initial src on mount
onMounted(() => {
  if (audioRef.value && props.surahNumber && props.totalAyahs) {
    audioRef.value.src = buildAyahUrl(props.surahNumber, 1)
  }
})

// Overall surah progress (0–100)
const surahProgressPercent = computed(() => {
  if (!props.totalAyahs) return 0
  const ayahFrac = duration.value > 0 ? currentTime.value / duration.value : 0
  return Math.min(100, Math.round(((completedAyahs.value + ayahFrac) / props.totalAyahs) * 100))
})

// Reset everything when surah changes
watch(() => [props.surahNumber, props.totalAyahs], stopAndReset)

function stopAndReset() {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = buildAyahUrl(props.surahNumber, 1)
    audioRef.value.load()
  }
  isPlaying.value      = false
  isLoading.value      = false
  isError.value        = false
  currentTime.value    = 0
  duration.value       = 0
  currentAyah.value    = 1
  completedAyahs.value = 0
}

function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    isError.value   = false
    isLoading.value = true
    audioRef.value.play()
      .then(() => { isPlaying.value = true; isLoading.value = false })
      .catch(() => { isError.value = true; isLoading.value = false })
  }
}

function seek(e) {
  if (!audioRef.value) return
  audioRef.value.currentTime = Number(e.target.value)
}

function onTimeUpdate() {
  currentTime.value = audioRef.value?.currentTime || 0
}

function onLoadedMetadata() {
  duration.value  = audioRef.value?.duration || 0
  isLoading.value = false
  isError.value   = false
  // Note: auto-play on ayah advance is handled directly in onAyahEnded,
  // nextAyah, prevAyah — NOT here — so iOS user-gesture context is preserved.
}

function onAyahEnded() {
  currentTime.value = 0
  duration.value    = 0

  if (repeatMode.value === 'ayah') {
    // Repeat same ayah — still in ended handler context, iOS allows this
    audioRef.value.currentTime = 0
    audioRef.value.play().catch(() => { isError.value = true })
    return
  }

  completedAyahs.value++

  if (currentAyah.value < props.totalAyahs) {
    // iOS: loadAyah called synchronously inside ended handler — media session still active
    loadAyah(currentAyah.value + 1, true)
  } else {
    // Surah finished
    if (repeatMode.value === 'surah') {
      completedAyahs.value = 0
      loadAyah(1, true)
    } else {
      isPlaying.value      = false
      currentAyah.value    = 1
      completedAyahs.value = 0
      if (audioRef.value) {
        audioRef.value.src = buildAyahUrl(props.surahNumber, 1)
        audioRef.value.load()
      }
    }
  }
}

function nextAyah() {
  if (currentAyah.value >= props.totalAyahs) return
  completedAyahs.value = Math.max(completedAyahs.value, currentAyah.value - 1)
  // iOS: user tapped button — direct call, gesture context is active
  loadAyah(currentAyah.value + 1, true)
}

function prevAyah() {
  if (currentAyah.value <= 1) return
  // iOS: user tapped button — direct call, gesture context is active
  loadAyah(currentAyah.value - 1, true)
  completedAyahs.value = Math.max(0, currentAyah.value - 2)
}

function cycleRepeat() {
  const modes = ['none', 'ayah', 'surah']
  const idx = modes.indexOf(repeatMode.value)
  repeatMode.value = modes[(idx + 1) % modes.length]
}

function onError() {
  isError.value   = true
  isLoading.value = false
}

function retryLoad() {
  loadAyah(currentAyah.value, isPlaying.value)
}

function jumpToAyah(n) {
  if (n < 1 || n > props.totalAyahs) return
  completedAyahs.value = Math.max(0, n - 1)
  // iOS: user tapped ayah row — direct call, gesture context is active
  loadAyah(n, true)
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>
