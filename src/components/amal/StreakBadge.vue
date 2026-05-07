<template>
  <div class="px-4">
    <!-- Hero streak card -->
    <div
      class="relative overflow-hidden rounded-3xl p-5 shadow-lg"
      :class="streak > 0
        ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500'
        : 'bg-gradient-to-br from-slate-200 to-slate-300'"
    >
      <!-- Decorative circles -->
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/15 rounded-full pointer-events-none" />
      <div class="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />

      <div class="relative flex items-center justify-between">
        <div>
          <div class="flex items-end gap-2">
            <span class="text-5xl font-black" :class="streak > 0 ? 'text-white' : 'text-slate-500'">
              {{ streak }}
            </span>
            <div class="pb-1.5">
              <p class="text-white/90 font-bold text-sm leading-tight">hari</p>
              <p class="text-white/70 text-xs">berturut-turut</p>
            </div>
          </div>

          <p v-if="streak === 0" class="text-white/70 text-xs mt-1">Yuk mulai amalkan hari ini! 💪</p>
          <p v-else class="text-white/80 text-xs mt-1 max-w-36 leading-relaxed">{{ motivasiText }}</p>
        </div>

        <!-- Streak icon / milestone -->
        <div class="flex flex-col items-center gap-2">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            :class="streak > 0 ? 'bg-white/25' : 'bg-white/30'"
          >
            <span class="text-3xl">{{ streak > 0 ? (milestoneBadge?.icon || '🔥') : '⭐' }}</span>
          </div>
          <span v-if="milestoneBadge" class="text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
            {{ milestoneBadge.label }}
          </span>
        </div>
      </div>

      <!-- 7-day mini bars -->
      <div class="relative mt-4">
        <div class="flex items-end gap-1">
          <div
            v-for="item in last7Days"
            :key="item.key"
            class="flex-1 rounded-t-sm transition-all duration-300"
            :class="[
              item.isUdzur ? 'bg-pink-200' :
              item.level >= 4 ? 'bg-white' :
              item.level >= 3 ? 'bg-white/70' :
              item.level >= 2 ? 'bg-white/40' :
              item.level >= 1 ? 'bg-white/20' : 'bg-white/10',
            ]"
            :style="{ height: item.level > 0 ? `${10 + item.level * 5}px` : '6px' }"
          />
        </div>
        <div class="flex justify-between mt-1.5">
          <span
            v-for="item in last7Days"
            :key="item.key + '_l'"
            class="flex-1 text-center text-[10px] font-medium"
            :class="item.isToday ? 'text-white font-bold' : 'text-white/50'"
          >{{ item.dayLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Achievement badges row -->
    <div v-if="unlockedBadges.length > 0" class="mt-3 flex gap-2 overflow-x-auto pb-1">
      <div
        v-for="badge in unlockedBadges"
        :key="badge.days"
        class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        :class="badge.unlocked ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-slate-100 text-slate-400'"
      >
        <span>{{ badge.icon }}</span>
        <span>{{ badge.label }}</span>
        <span v-if="badge.unlocked" class="text-amber-400">✓</span>
      </div>
    </div>

    <!-- Calendar link -->
    <RouterLink
      to="/amal/kalender"
      class="mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-xs font-semibold text-slate-600 active:bg-slate-50 transition-colors"
    >
      <Calendar :size="14" class="text-rose-400" />
      Lihat Kalender Amalan
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Calendar } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'

const amalStore = useAmalStore()
const streak = computed(() => amalStore.currentStreak)
const today = new Date().toISOString().split('T')[0]

const ALL_BADGES = [
  { days: 3, icon: '🌱', label: '3 Hari' },
  { days: 7, icon: '⭐', label: '7 Hari' },
  { days: 30, icon: '🌙', label: '30 Hari' },
  { days: 100, icon: '🏆', label: '100 Hari' },
]

const milestoneBadge = computed(() => {
  return [...ALL_BADGES].reverse().find(m => streak.value >= m.days) || null
})

const unlockedBadges = computed(() => {
  return ALL_BADGES.map(b => ({ ...b, unlocked: streak.value >= b.days }))
})

const MOTIVASI = [
  'Istiqomah adalah kunci! 🌸',
  'Amalan kecil tapi rutin lebih dicintai Allah 💚',
  'MasyaAllah, terus pertahankan! 🌟',
  'Kamu luar biasa! Terus semangat 🤗',
  'Subhanallah, konsistensimu menginspirasi! ✨',
]
const motivasiText = computed(() => MOTIVASI[streak.value % MOTIVASI.length])

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const last7Days = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const log = amalStore.logs[key]
    let level = 0; let isUdzur = false
    if (log) {
      isUdzur = !!log.is_udzur
      const done = ['dzikir_pagi', 'dzikir_petang', 'al_mulk', 'al_kahfi', 'al_waqiah'].filter(k => log[k]).length
        + Object.values(log.sunnah || {}).filter(v => v === true || (typeof v === 'number' && v > 0)).length
      level = isUdzur ? 5 : done >= 5 ? 4 : done >= 3 ? 3 : done >= 1 ? 2 : 1
    }
    return { key, dayLabel: DAY_LABELS[d.getDay()], level, isUdzur, isToday: key === today }
  })
})
</script>
