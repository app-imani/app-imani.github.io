/**
 * useAudioPlayer.js
 * Global audio player state — module-level singleton agar satu instance
 * Supports: play/pause, playback rate, auto-play next
 */
import { ref, computed } from 'vue'

// ─── Module-level singleton state ──────────────────────────────────────
const audio = ref(null)           // HTMLAudioElement
const currentUrl = ref(null)
const currentLabel = ref('')
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1.0)
const error = ref(null)

function _attach(el) {
  if (audio.value) {
    audio.value.pause()
    audio.value.onended = null
    audio.value.ontimeupdate = null
    audio.value.onloadedmetadata = null
    audio.value.onerror = null
  }
  audio.value = el
  el.playbackRate = playbackRate.value

  el.ontimeupdate = () => { currentTime.value = el.currentTime }
  el.onloadedmetadata = () => { duration.value = el.duration; isLoading.value = false }
  el.onended = () => { isPlaying.value = false; currentTime.value = 0 }
  el.onerror = () => { error.value = 'Gagal memuat audio'; isPlaying.value = false; isLoading.value = false }
}

// ─── Public API ─────────────────────────────────────────────────────────
export function useAudioPlayer() {
  /**
   * Play audio from a URL. If same URL → toggle play/pause.
   */
  async function play(url, label = '') {
    error.value = null

    if (currentUrl.value === url && audio.value) {
      if (isPlaying.value) {
        audio.value.pause()
        isPlaying.value = false
      } else {
        await audio.value.play()
        isPlaying.value = true
      }
      return
    }

    // New URL
    currentUrl.value = url
    currentLabel.value = label
    isLoading.value = true
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0

    const el = new Audio(url)
    _attach(el)

    try {
      await el.play()
      isPlaying.value = true
    } catch (e) {
      error.value = 'Gagal memutar audio'
      isLoading.value = false
    }
  }

  function pause() {
    if (audio.value && isPlaying.value) {
      audio.value.pause()
      isPlaying.value = false
    }
  }

  function stop() {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
    }
    isPlaying.value = false
    currentTime.value = 0
    currentUrl.value = null
    currentLabel.value = ''
  }

  function setRate(rate) {
    playbackRate.value = rate
    if (audio.value) audio.value.playbackRate = rate
  }

  function seek(time) {
    if (audio.value) {
      audio.value.currentTime = time
      currentTime.value = time
    }
  }

  const progress = computed(() => {
    if (!duration.value) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedTime = computed(() => {
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
    return `${fmt(currentTime.value)} / ${fmt(duration.value)}`
  })

  return {
    currentUrl, currentLabel, isPlaying, isLoading, error,
    currentTime, duration, playbackRate, progress, formattedTime,
    play, pause, stop, setRate, seek,
  }
}
