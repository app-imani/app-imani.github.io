<template>
  <!-- Banner hanya muncul jika ada momen aktif -->
  <Transition name="slide-down">
    <div v-if="activeMoment" class="mx-4 mb-3 rounded-2xl overflow-hidden shadow-sm">
      <div :class="activeMoment.gradient" class="p-4">
        <div class="flex items-start gap-3">
          <span class="text-2xl mt-0.5">{{ activeMoment.icon }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-white">{{ activeMoment.title }}</p>
            <p class="text-xs text-white/80 mt-0.5 leading-relaxed">{{ activeMoment.desc }}</p>
          </div>
          <button @click="dismissed = true" class="text-white/60 active:text-white p-1">
            <X :size="16" />
          </button>
        </div>
        <RouterLink
          v-if="activeMoment.route"
          :to="activeMoment.route"
          class="mt-3 block text-center py-2 rounded-xl bg-white/20 text-white text-xs font-semibold active:bg-white/30 transition-colors"
        >
          {{ activeMoment.cta }}
        </RouterLink>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { X } from 'lucide-vue-next'
import { useIslamicCalendar } from '@/composables/useIslamicCalendar'

const { isMalamJumat, isSeninaKamis, isAyyamulBidh, isAsyaraDzulhijjah, isNisfuSyaban, loadToday } = useIslamicCalendar()

const dismissed = ref(false)

onMounted(() => loadToday())

const MOMENTS = computed(() => [
  {
    id: 'malam_jumat',
    active: isMalamJumat.value,
    icon: '🌙',
    title: 'Malam Jum\'at — Perbanyak Sholawat',
    desc: 'Perbanyak membaca Surat Al-Kahfi & sholawat malam ini.',
    gradient: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    route: '/amal',
    cta: 'Buka Amalan Sunnah →',
  },
  {
    id: 'ayyamul_bidh',
    active: isAyyamulBidh.value,
    icon: '🌕',
    title: 'Ayyamul Bidh — Puasa Sunnah',
    desc: 'Hari-hari bulan purnama, sunnah untuk berpuasa hari ini.',
    gradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
    route: '/fasting',
    cta: 'Catat Puasa →',
  },
  {
    id: 'asyradzulhijjah',
    active: isAsyaraDzulhijjah.value,
    icon: '🐑',
    title: '10 Hari Dzulhijjah — Hari Terbaik',
    desc: 'Perbanyak amal sholeh, dzikir, dan takbir di hari-hari mulia ini.',
    gradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    route: '/amal',
    cta: 'Perbanyak Dzikir →',
  },
  {
    id: 'nisfu_syaban',
    active: isNisfuSyaban.value,
    icon: '⭐',
    title: 'Nisfu Sya\'ban — Malam Pengampunan',
    desc: 'Malam istimewa untuk memperbanyak doa dan istighfar.',
    gradient: 'bg-gradient-to-r from-pink-600 to-rose-600',
    route: '/amal',
    cta: 'Buka Dzikir & Doa →',
  },
  {
    id: 'senin_kamis',
    active: isSeninaKamis.value,
    icon: '📅',
    title: 'Hari Senin/Kamis — Puasa Sunnah',
    desc: 'Nabi ﷺ senantiasa berpuasa di hari ini. Yuk ikut!',
    gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    route: '/fasting',
    cta: 'Catat Puasa →',
  },
])

const activeMoment = computed(() => {
  if (dismissed.value) return null
  return MOMENTS.value.find(m => m.active) || null
})
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
