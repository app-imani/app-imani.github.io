/**
 * useReactionFX — Floating emoji burst + soft Web Audio chime
 * Lazy-initialises AudioContext on first interaction (no file loading).
 */
import { ref } from 'vue'

// ── Audio ────────────────────────────────────────────────────
let audioCtx = null

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// C5, E5, G5, A5 — soft Islamic chime scale
const FREQS = {
  aamiin:      523.25,
  masya_allah: 659.25,
  barakallah:  783.99,
  semangat:    880.00,
}

function playChime(reactionKey) {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime

    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = FREQS[reactionKey] ?? 523.25

    // Soft attack, smooth exponential release
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.13, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.start(now)
    osc.stop(now + 0.45)
  } catch (_) {
    // AudioContext blocked (autoplay policy) — skip silently
  }
}

// ── Composable ────────────────────────────────────────────────
export function useReactionFX() {
  const particles = ref([])

  /**
   * @param {MouseEvent} event  — click event from the reaction button
   * @param {string}     emoji  — emoji to burst
   * @param {string}     reactionKey — key for pitch lookup
   */
  function triggerBurst(event, emoji, reactionKey) {
    playChime(reactionKey)

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
