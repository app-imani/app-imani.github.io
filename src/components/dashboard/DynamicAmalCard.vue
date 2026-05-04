<template>
  <!-- Card amalan dinamis berdasarkan waktu -->
  <RouterLink :to="cardData.to" class="block">
    <div
      class="card flex items-center gap-4 active:scale-98 transition-transform"
      :class="cardData.bgClass"
    >
      <div class="rounded-2xl p-3 shrink-0" :class="cardData.iconBg">
        <component :is="cardData.icon" :size="24" :class="cardData.iconColor" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">{{ cardData.label }}</p>
        <h3 class="text-base font-bold text-slate-800 leading-tight">{{ cardData.title }}</h3>
        <p class="text-xs text-slate-400 mt-0.5 truncate">{{ cardData.desc }}</p>
      </div>
      <ChevronRight :size="18" class="text-slate-300 shrink-0" />
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronRight, Sun, BookOpen, Moon, Star, Sunset } from 'lucide-vue-next'

const CARDS = [
  {
    startHour: 5, endHour: 8,
    label: 'Pagi Hari',
    title: 'Dzikir Pagi + Al-Waqi\'ah',
    desc: 'Mulai hari dengan dzikir dan tilawah',
    icon: Sun,
    to: '/amal',
    bgClass: 'border-amber-100',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    startHour: 12, endHour: 14,
    label: 'Siang Hari',
    title: 'Target Tilawah Hari Ini',
    desc: 'Cek progress bacaan Al-Qur\'anmu',
    icon: BookOpen,
    to: '/quran',
    bgClass: 'border-emerald-100',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    startHour: 15, endHour: 18,
    label: 'Sore Hari',
    title: 'Al-Kahfi (Hari Jumat)',
    desc: 'Dianjurkan setiap Jumat',
    icon: Star,
    to: '/amal',
    bgClass: 'border-sky-100',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
  },
  {
    startHour: 18, endHour: 21,
    label: 'Petang Hari',
    title: 'Dzikir Petang',
    desc: 'Perlindungan dari sore hingga malam',
    icon: Sunset,
    to: '/amal',
    bgClass: 'border-orange-100',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    startHour: 21, endHour: 24,
    label: 'Malam Hari',
    title: 'Al-Mulk Sebelum Tidur',
    desc: 'Pelindung dari azab kubur',
    icon: Moon,
    to: '/amal',
    bgClass: 'border-violet-100',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
]

const DEFAULT_CARD = {
  label: 'Ibadah Harian',
  title: 'Yuk Mulai Ibadah Hari Ini',
  desc: 'Cek semua amalan harianmu',
  icon: Star,
  to: '/amal',
  bgClass: 'border-slate-100',
  iconBg: 'bg-slate-50',
  iconColor: 'text-slate-500',
}

const cardData = computed(() => {
  const hour = new Date().getHours()
  const matched = CARDS.find((c) => hour >= c.startHour && hour < c.endHour)
  return matched || DEFAULT_CARD
})
</script>
