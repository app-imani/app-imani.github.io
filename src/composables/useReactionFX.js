/**
 * useReactionFX — Floating emoji burst + real audio chimes from Pixabay
 * Primary: HTMLAudioElement with MP3 files (royalty-free, Pixabay license)
 * Fallback: Web Audio API synthesis if file fails to load/play
 */
import { ref } from 'vue'

// ── File-based Audio ──────────────────────────────────────────
const AUDIO_SOURCES = {
  aamiin:      '/sounds/reactions/aamiin.mp3',
  masya_allah: '/sounds/reactions/masya_allah.mp3',
  barakallah:  '/sounds/reactions/barakallah.mp3',
  semangat:    '/sounds/reactions/semangat.mp3',
}

const AUDIO_VOLUMES = {
  aamiin:      0.70,
  masya_allah: 0.65,
  barakallah:  0.75,
  semangat:    0.85,
}

// Preload pool: { [key]: HTMLAudioElement }
const audioPool = {}
let poolReady = false

function preloadAudio() {
  if (poolReady) return
  poolReady = true
  for (const [key, src] of Object.entries(AUDIO_SOURCES)) {
    const a = new Audio(src)
    a.preload = 'auto'
    a.volume = AUDIO_VOLUMES[key] ?? 0.75
    audioPool[key] = a
  }
}

function playFileAudio(key) {
  preloadAudio()
  const base = audioPool[key]
  if (!base) return false
  try {
    // Clone so rapid taps don't cut off the previous play
    const clone = base.cloneNode()
    clone.volume = AUDIO_VOLUMES[key] ?? 0.75
    clone.play().catch(() => playSynthFallback(key))
    return true
  } catch (_) {
    return false
  }
}

// ── Synth Fallback (Web Audio API) ───────────────────────────
let audioCtx = null

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

const SYNTH_PROFILES = {
  aamiin:      { freqs: [523.25, 261.63], duration: 0.95, gainPeak: 0.24, attackMs: 30,  releaseMs: 500 },
  masya_allah: { freqs: [659.25],         duration: 0.75, gainPeak: 0.22, attackMs: 40,  releaseMs: 350, vibrato: { depth: 0.08, rate: 5 } },
  barakallah:  { freqs: [523.25, 659.25, 783.99], duration: 1.0, gainPeak: 0.28, attackMs: 20, releaseMs: 420, arpeggio: true },
  semangat:    { freqs: [880.0, 1046.5],  duration: 0.7,  gainPeak: 0.30, attackMs: 15,  releaseMs: 280 },
}

function playSynthFallback(reactionKey) {
  try {
    const profile = SYNTH_PROFILES[reactionKey] || SYNTH_PROFILES.aamiin
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    if (profile.arpeggio) {
      profile.freqs.forEach((freq, idx) => {
        const offset = idx * (profile.duration * 0.25)
        playOscTone(ctx, freq, profile.duration - offset, profile.gainPeak * 0.7, profile.attackMs, profile.releaseMs, now + offset)
      })
    } else if (profile.vibrato) {
      playOscToneWithVibrato(ctx, profile.freqs[0], profile.duration, profile.gainPeak, profile.attackMs, profile.releaseMs, profile.vibrato, now)
    } else {
      profile.freqs.forEach((freq, idx) => {
        playOscTone(ctx, freq, profile.duration, profile.gainPeak * (idx === 0 ? 1.0 : 0.4), profile.attackMs, profile.releaseMs, now)
      })
    }
  } catch (_) { /* AudioContext blocked — skip silently */ }
}

function playOscTone(ctx, freq, duration, gainPeak, attackMs, releaseMs, startTime) {
  const now = startTime || ctx.currentTime
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'; osc.frequency.value = freq
  const a = attackMs / 1000, r = releaseMs / 1000
  const s = Math.max(0, duration - a - r)
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(gainPeak, now + a)
  if (s > 0) gain.gain.setValueAtTime(gainPeak, now + a + s)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.start(now); osc.stop(now + duration)
}

function playOscToneWithVibrato(ctx, freq, duration, gainPeak, attackMs, releaseMs, vibrato, now) {
  const osc = ctx.createOscillator(), gain = ctx.createGain()
  const vOsc = ctx.createOscillator(), vGain = ctx.createGain()
  osc.connect(vGain); vGain.connect(gain); gain.connect(ctx.destination)
  vOsc.type = 'sine'; vOsc.frequency.value = vibrato.rate
  vGain.gain.setValueAtTime(freq * vibrato.depth, now)
  vOsc.connect(osc.frequency)
  osc.type = 'sine'; osc.frequency.value = freq
  const a = attackMs / 1000, r = releaseMs / 1000, s = Math.max(0, duration - a - r)
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(gainPeak, now + a)
  if (s > 0) gain.gain.setValueAtTime(gainPeak, now + a + s)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.start(now); vOsc.start(now); osc.stop(now + duration); vOsc.stop(now + duration)
}

// ── Composable ────────────────────────────────────────────────
export function useReactionFX() {
  const particles = ref([])

  /**
   * @param {MouseEvent} event  — click event from the reaction button
   * @param {string}     emoji  — emoji to burst
   * @param {string}     reactionKey — key for sound profile lookup
   */
  function triggerBurst(event, emoji, reactionKey) {
    // Try file-based audio first; synth fallback is called internally on error
    const ok = playFileAudio(reactionKey)
    if (!ok) playSynthFallback(reactionKey)

    const el   = event.currentTarget
    const rect = el.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    const batch = Date.now()

    const COUNT = 6
    for (let i = 0; i < COUNT; i++) {
      particles.value.push({
        id:      `${batch}-${i}`,
        batchId: batch,
        emoji,
        // slight horizontal scatter around button centre
        x:     cx + (Math.random() - 0.5) * 28,
        y:     cy,
        // random drift left / right
        vx:    (Math.random() - 0.5) * 70,
        delay: i * 55,
        scale: 0.75 + Math.random() * 0.6,
      })
    }

    // Remove particles after animation completes
    setTimeout(() => {
      particles.value = particles.value.filter(p => p.batchId !== batch)
    }, 950)
  }

  return { particles, triggerBurst }
}

