<template>
  <RouterLink to="/cycle" class="block">
    <div
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
      :class="badgeClass"
    >
      <component :is="badgeIcon" :size="12" />
      {{ cycleStore.cycleStatusText }}
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { Moon, Heart, Circle } from 'lucide-vue-next'
import { useCycleStore } from '@/stores/cycle'

const cycleStore = useCycleStore()

const badgeClass = computed(() => {
  if (cycleStore.isHaidActive) return 'bg-haid-100 text-haid-700'
  const days = cycleStore.daysUntilNext
  if (days !== null && days <= 3) return 'bg-rose-50 text-rose-600'
  if (days !== null && days <= 7) return 'bg-amber-50 text-amber-600'
  return 'bg-primary-50 text-primary-600'
})

const badgeIcon = computed(() => {
  if (cycleStore.isHaidActive) return Heart
  const days = cycleStore.daysUntilNext
  if (days !== null && days <= 5) return Moon
  return Circle
})
</script>
