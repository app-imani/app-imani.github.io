<template>
  <!-- Streak widget gamifikasi -->
  <div class="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
    <div class="relative">
      <Flame :size="28" class="text-amber-500" fill="#f59e0b" />
      <span v-if="streak > 0" class="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center leading-none">
        {{ streak > 99 ? '99+' : streak }}
      </span>
    </div>
    <div>
      <p class="text-sm font-bold text-amber-800">{{ streakText }}</p>
      <p class="text-xs text-amber-500">{{ subText }}</p>
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
  if (streak.value === 0) return 'Mulai Streak Sholat!'
  return `${streak.value} Hari Berturut-turut`
})

const subText = computed(() => {
  if (streak.value === 0) return 'Sholat lengkap setiap hari'
  if (streak.value < 7) return 'Terus semangat!'
  if (streak.value < 30) return 'Luar biasa! 🔥'
  if (streak.value < 100) return 'Masya Allah! Istiqomah!'
  return 'Subhanallah! Luar biasa!'
})
</script>
