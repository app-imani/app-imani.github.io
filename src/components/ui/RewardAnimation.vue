<template>
  <!-- Overlay animasi reward — muncul saat trigger -->
  <Teleport to="body">
    <Transition name="reward-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <!-- Lingkaran burst -->
        <div class="relative flex items-center justify-center">
          <!-- Partikel emoji -->
          <div
            v-for="(particle, i) in particles"
            :key="i"
            class="absolute text-2xl animate-particle"
            :style="particle.style"
          >{{ particle.emoji }}</div>

          <!-- Icon center -->
          <div class="animate-bounce-in bg-amber-400 rounded-full p-5 shadow-2xl">
            <Star class="text-white" :size="40" fill="white" />
          </div>
        </div>

        <!-- Teks reward -->
        <div class="absolute mt-36 text-center animate-fade-up">
          <p class="text-2xl font-bold text-slate-800">{{ rewardText }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ rewardSubtext }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Star } from 'lucide-vue-next'

const isVisible = ref(false)
const rewardText = ref('Alhamdulillah! 🌟')
const rewardSubtext = ref('')

const REWARD_MESSAGES = [
  { text: 'Alhamdulillah! 🌟', sub: 'Ibadahmu tercatat!' },
  { text: 'Masya Allah! ✨', sub: 'Teruskan istiqomahmu!' },
  { text: 'Subhanallah! 💚', sub: 'Setiap amal ada pahalanya' },
  { text: 'Barakallah! 🤲', sub: 'Semoga diterima Allah' },
]

const EMOJIS = ['⭐', '✨', '💚', '🌟', '🤲', '💫', '🌙', '📿']

const particles = computed(() =>
  Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 360) / 8
    const distance = 80 + Math.random() * 40
    const x = Math.cos((angle * Math.PI) / 180) * distance
    const y = Math.sin((angle * Math.PI) / 180) * distance
    return {
      emoji: EMOJIS[i % EMOJIS.length],
      style: {
        transform: `translate(${x}px, ${y}px)`,
        animation: `particleFly 0.6s ease-out ${i * 0.05}s both`,
      },
    }
  })
)

/**
 * Trigger animasi reward
 * @param {string} text - override teks (opsional)
 */
function trigger(text = null, subtext = null) {
  const randomMsg = REWARD_MESSAGES[Math.floor(Math.random() * REWARD_MESSAGES.length)]
  rewardText.value = text || randomMsg.text
  rewardSubtext.value = subtext || randomMsg.sub
  isVisible.value = true

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate([10, 50, 10])
  }

  setTimeout(() => {
    isVisible.value = false
  }, 1800)
}

defineExpose({ trigger })

// Expose globally
if (typeof window !== 'undefined') {
  window.$reward = trigger
}
</script>

<style scoped>
.reward-fade-enter-active,
.reward-fade-leave-active {
  transition: opacity 0.3s ease;
}
.reward-fade-enter-from,
.reward-fade-leave-to {
  opacity: 0;
}

@keyframes particleFly {
  0% { transform: translate(0, 0) scale(0); opacity: 1; }
  100% { opacity: 0; }
}
</style>
