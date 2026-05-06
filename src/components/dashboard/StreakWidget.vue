<template>
  <div class="relative h-full overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-4 py-4 shadow-md shadow-amber-200/50">
    <!-- decorative glow -->
    <div class="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
    <div class="pointer-events-none absolute -bottom-6 -left-2 h-16 w-16 rounded-full bg-white/10 blur-lg" />

    <!-- label -->
    <p class="relative text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Streak Sholat</p>

    <!-- main metric -->
    <div class="relative mt-1.5 flex items-end gap-2">
      <span class="text-3xl font-black leading-none text-white">{{ streak }}</span>
      <span class="mb-0.5 text-sm font-semibold text-white/80">hari</span>
      <Flame :size="20" class="mb-0.5 ml-auto text-white/90" fill="rgba(255,255,255,0.6)" />
    </div>

    <!-- sub text -->
    <p class="relative mt-1 text-[11px] font-medium leading-snug text-white/80">{{ subText }}</p>

    <!-- progress toward 30-day milestone -->
    <div class="relative mt-3">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[9px] font-bold uppercase tracking-wide text-white/60">Menuju 30 hari</span>
        <span class="text-[9px] font-bold text-white/70">{{ Math.min(streak, 30) }}/30</span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <div
          class="h-full rounded-full bg-white/70 transition-all duration-700"
          :style="{ width: `${Math.min(100, (streak / 30) * 100)}%` }"
        />
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

const subText = computed(() => {
  if (streak.value === 0) return 'Mulai sholat lengkap hari ini'
  if (streak.value < 7) return 'Terus semangat! 💪'
  if (streak.value < 30) return 'Luar biasa, tetap istiqomah! 🔥'
  if (streak.value < 100) return 'Masya Allah! Istiqomah sekali!'
  return 'Subhanallah! Luar biasa!'
})
</script>
