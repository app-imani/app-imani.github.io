<template>
  <RouterLink to="/cycle" class="block h-full">
    <div
      class="h-full rounded-[1.4rem] border px-3.5 py-3 transition-all shadow-sm"
      :class="badgeClass"
    >
      <div class="flex items-start gap-3 min-w-0">
        <div class="shrink-0 rounded-2xl p-2.5" :class="iconWrapClass">
          <component :is="badgeIcon" :size="16" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">
            {{ cycleStore.isHaidActive ? 'Mode Haid' : 'Info Siklus' }}
          </p>
          <p class="mt-1 text-sm font-bold leading-tight break-words">
            {{ primaryText }}
          </p>
          <p class="mt-1 text-[11px] leading-snug opacity-80">
            {{ secondaryText }}
          </p>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { Moon, Heart, Circle } from 'lucide-vue-next'
import { useCycleStore } from '@/stores/cycle'

const cycleStore = useCycleStore()

const badgeClass = computed(() => {
  if (cycleStore.isHaidActive) return 'border-haid-100 bg-gradient-to-br from-haid-50 to-white text-haid-700'
  const days = cycleStore.daysUntilNext
  if (days !== null && days <= 3) return 'border-rose-100 bg-gradient-to-br from-rose-50 to-white text-rose-600'
  if (days !== null && days <= 7) return 'border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-600'
  return 'border-primary-100 bg-gradient-to-br from-primary-50 to-white text-primary-600'
})

const iconWrapClass = computed(() => {
  if (cycleStore.isHaidActive) return 'bg-haid-100 text-haid-700 ring-1 ring-haid-200'
  const days = cycleStore.daysUntilNext
  if (days !== null && days <= 3) return 'bg-rose-100 text-rose-600 ring-1 ring-rose-200'
  if (days !== null && days <= 7) return 'bg-amber-100 text-amber-600 ring-1 ring-amber-200'
  return 'bg-primary-100 text-primary-600 ring-1 ring-primary-200'
})

const badgeIcon = computed(() => {
  if (cycleStore.isHaidActive) return Heart
  const days = cycleStore.daysUntilNext
  if (days !== null && days <= 5) return Moon
  return Circle
})

const primaryText = computed(() => {
  if (cycleStore.isHaidActive) return `Hari ke-${cycleStore.currentHaidDay}`
  return cycleStore.cycleStatusText
})

const secondaryText = computed(() => {
  if (cycleStore.isHaidActive) return 'Sholat di-pause, fokus ibadah yang diperbolehkan'

  const days = cycleStore.daysUntilNext
  if (days === null) return 'Isi data siklus agar prediksi makin akurat'
  if (days <= 0) return 'Perhatikan kondisi tubuh hari ini'
  if (days <= 5) return 'Masa transisi, siapkan kebutuhan harian'
  return 'Tap untuk lihat catatan dan prediksi lengkap'
})
</script>
