<template>
  <RouterLink to="/cycle" class="block h-full">
    <div class="relative h-full overflow-hidden rounded-3xl border px-4 py-4 shadow-md transition-all" :class="cardClass">
      <!-- decorative circle -->
      <div class="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-20" :class="glowClass" />

      <!-- label -->
      <p class="relative text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
        {{ cycleStore.isHaidActive ? 'Mode Haid' : 'Info Siklus' }}
      </p>

      <!-- main metric -->
      <div class="relative mt-1.5 flex items-end gap-1.5">
        <span class="text-3xl font-black leading-none">{{ metricNumber }}</span>
        <span class="mb-0.5 text-sm font-semibold opacity-70">{{ metricUnit }}</span>
        <component :is="badgeIcon" :size="18" class="mb-0.5 ml-auto opacity-70" />
      </div>

      <!-- sub text -->
      <p class="relative mt-1 text-[11px] font-medium leading-snug opacity-75">{{ secondaryText }}</p>

      <!-- tap hint -->
      <div class="relative mt-3 flex items-center gap-1 opacity-60">
        <span class="text-[9px] font-bold uppercase tracking-wide">Lihat detail</span>
        <span class="text-[9px]">→</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { Moon, Heart, Circle, Sparkles } from 'lucide-vue-next'
import { useCycleStore } from '@/stores/cycle'

const cycleStore = useCycleStore()

const cardClass = computed(() => {
  if (cycleStore.isHaidActive) return 'border-rose-200 bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 text-white shadow-rose-200/50'
  const days = cycleStore.daysUntilNext
  if (days !== null && days <= 3) return 'border-rose-100 bg-gradient-to-br from-rose-50 via-pink-50 to-white text-rose-600 shadow-rose-100/60'
  if (days !== null && days <= 7) return 'border-amber-100 bg-gradient-to-br from-amber-50 via-yellow-50 to-white text-amber-700 shadow-amber-100/60'
  return 'border-primary-100 bg-gradient-to-br from-primary-50 via-teal-50 to-white text-primary-700 shadow-primary-100/60'
})

const glowClass = computed(() => {
  if (cycleStore.isHaidActive) return 'bg-white'
  const days = cycleStore.daysUntilNext
  if (days !== null && days <= 3) return 'bg-rose-400'
  if (days !== null && days <= 7) return 'bg-amber-400'
  return 'bg-primary-400'
})

const badgeIcon = computed(() => {
  if (cycleStore.isHaidActive) return Heart
  const days = cycleStore.daysUntilNext
  if (days !== null && days <= 5) return Moon
  return Sparkles
})

const metricNumber = computed(() => {
  if (cycleStore.isHaidActive) return cycleStore.currentHaidDay ?? '–'
  const days = cycleStore.daysUntilNext
  if (days === null) return '–'
  if (days <= 0) return '!'
  return days
})

const metricUnit = computed(() => {
  if (cycleStore.isHaidActive) return 'hari haid'
  const days = cycleStore.daysUntilNext
  if (days === null || days <= 0) return ''
  return 'hari lagi'
})

const secondaryText = computed(() => {
  if (cycleStore.isHaidActive) return 'Tetap semangat, sayang 💕'
  const days = cycleStore.daysUntilNext
  if (days === null) return 'Isi data siklus dulu ya'
  if (days <= 0) return 'Perhatikan kondisi tubuh'
  if (days <= 5) return 'Masa transisi mendekat'
  return cycleStore.cycleStatusText
})
</script>
