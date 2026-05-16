<template>
  <Teleport to="body">
    <Transition name="milestone">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click="dismiss"
      >
        <div class="relative bg-white rounded-3xl mx-6 p-8 text-center shadow-2xl max-w-xs w-full" @click.stop>
          <div class="text-6xl mb-3 animate-bounce">{{ milestone.icon }}</div>
          <h2 class="text-xl font-black text-slate-800 mb-1">{{ milestone.title }}</h2>
          <p class="text-sm text-slate-500 mb-2">Streak {{ milestone.days }} hari tercapai! 🎉</p>
          <p class="text-xs text-slate-400 leading-relaxed mb-5">
            Mashaa Allah! Konsistensi beribadah selama {{ milestone.days }} hari berturut-turut. Semoga Allah menerima amalanmu.
          </p>
          <button
            @click="dismiss"
            class="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-emerald-500 text-white font-semibold text-sm active:scale-95 transition-transform"
          >
            Alhamdulillah! 🌙
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAmalStore } from '@/stores/amal'

const amalStore = useAmalStore()

const MILESTONES = [
  { days: 100, icon: '🏆', title: '100 Hari Istiqomah!' },
  { days: 30,  icon: '🌙', title: '30 Hari Konsisten!' },
  { days: 7,   icon: '⭐', title: '7 Hari Streak!' },
]

const SHOWN_KEY = 'imani_milestone_shown'

const visible = ref(false)
const milestone = ref({ days: 0, icon: '🎉', title: '' })

function getShownMilestones() {
  try { return JSON.parse(localStorage.getItem(SHOWN_KEY) || '[]') } catch { return [] }
}

watch(
  () => amalStore.currentStreak,
  (streak) => {
    const shown = getShownMilestones()
    const hit = MILESTONES.find(m => streak >= m.days && !shown.includes(m.days))
    if (hit) {
      milestone.value = hit
      visible.value = true
    }
  },
  { immediate: true }
)

function dismiss() {
  const shown = getShownMilestones()
  shown.push(milestone.value.days)
  localStorage.setItem(SHOWN_KEY, JSON.stringify(shown))
  visible.value = false
}
</script>

<style scoped>
.milestone-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.milestone-leave-active { transition: all 0.2s ease; }
.milestone-enter-from { opacity: 0; transform: scale(0.5); }
.milestone-leave-to { opacity: 0; }
</style>
