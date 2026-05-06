<template>
  <!-- Streak widget gamifikasi -->
  <div class="h-full rounded-[1.4rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-amber-50 to-white px-3.5 py-3 shadow-sm">
    <div class="flex items-start gap-3 min-w-0">
      <div class="relative shrink-0 rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-amber-100">
        <Flame :size="22" class="text-amber-500" fill="#f59e0b" />
        <span v-if="streak > 0" class="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-amber-500 text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none">
        {{ streak > 99 ? '99+' : streak }}
      </span>
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-500/90">Streak Sholat</p>
        <p class="mt-1 text-sm leading-tight font-bold text-amber-900 break-words">{{ streakText }}</p>
        <p class="mt-1 text-[11px] leading-snug text-amber-600/90">{{ subText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Flame } from 'lucide-vue-next'
import { usePrayerStore } from '@/stores/prayer'

const prayerStore = usePrayerStore()
const streak = computed(() => prayerStore.streak)

const streakText = computed(() => {
  if (streak.value === 0) return 'Mulai hari ini'
  if (streak.value === 1) return '1 hari konsisten'
  return `${streak.value} hari konsisten`
})

const subText = computed(() => {
  if (streak.value === 0) return 'Sholat lengkap setiap hari'
  if (streak.value < 7) return 'Terus semangat!'
  if (streak.value < 30) return 'Luar biasa! 🔥'
  if (streak.value < 100) return 'Masya Allah! Istiqomah!'
  return 'Subhanallah! Luar biasa!'
})
</script>
