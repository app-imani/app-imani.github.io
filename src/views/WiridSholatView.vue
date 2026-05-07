<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-safe pt-4 pb-4">
      <RouterLink to="/amal" class="p-2 rounded-xl text-slate-400 active:bg-slate-700">
        <ArrowLeft :size="20" />
      </RouterLink>
      <div class="text-center">
        <p class="text-sm font-semibold text-white">Wirid Setelah Sholat</p>
        <p class="text-xs text-slate-400">{{ wirid.sholatName ? `Sholat ${SHOLAT_LABELS[wirid.sholatName]}` : 'Pilih sholat dahulu' }}</p>
      </div>
      <div class="w-10" />
    </div>

    <!-- Pilih sholat (step 0) -->
    <div v-if="!wirid.sholatName" class="flex-1 px-5 flex flex-col justify-center">
      <p class="text-center text-slate-400 text-sm mb-6">Sholat apa yang baru kamu selesaikan?</p>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="s in SHOLAT_LIST"
          :key="s.key"
          @click="amalStore.startWirid(s.key)"
          class="py-4 rounded-2xl text-center transition-all active:scale-95"
          :class="todayWirid[s.key] ? 'bg-primary-500/30 border border-primary-500/50' : 'bg-slate-700 border border-slate-600'"
        >
          <span class="text-2xl block mb-1">{{ s.icon }}</span>
          <span class="text-sm font-semibold text-white">{{ s.label }}</span>
          <span v-if="todayWirid[s.key]" class="block text-xs text-primary-400 mt-0.5">✓ Selesai</span>
        </button>
      </div>

      <!-- Status hari ini -->
      <div class="mt-6 card bg-slate-700 border-slate-600">
        <p class="text-xs text-slate-400 font-semibold mb-2">Wirid Hari Ini</p>
        <div class="flex gap-3 justify-center">
          <div v-for="s in SHOLAT_LIST" :key="s.key + '_dot'" class="flex flex-col items-center gap-1">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              :class="todayWirid[s.key] ? 'bg-primary-500' : 'bg-slate-600'">
              {{ todayWirid[s.key] ? '✓' : s.icon }}
            </div>
            <span class="text-xs text-slate-400">{{ s.short }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Wirid counter (step 1-3) -->
    <div v-else-if="!wirid.isComplete" class="flex-1 flex flex-col items-center justify-center px-5">
      <!-- Step indicator -->
      <div class="flex gap-2 mb-8">
        <div
          v-for="(step, i) in WIRID_STEPS"
          :key="i"
          class="flex items-center gap-1.5"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            :class="i < wirid.currentStep ? 'bg-primary-500 text-white' : i === wirid.currentStep ? 'bg-white text-slate-800 ring-2 ring-primary-400' : 'bg-slate-700 text-slate-400'"
          >
            {{ i < wirid.currentStep ? '✓' : i + 1 }}
          </div>
          <div v-if="i < 2" class="w-6 h-0.5" :class="i < wirid.currentStep ? 'bg-primary-500' : 'bg-slate-700'" />
        </div>
      </div>

      <!-- Current dzikir -->
      <p class="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">
        {{ WIRID_STEPS[wirid.currentStep]?.label }}
      </p>
      <p class="font-arabic text-3xl text-white mb-2 text-center leading-loose">
        {{ WIRID_STEPS[wirid.currentStep]?.arabic }}
      </p>
      <p class="text-slate-400 text-sm mb-8 text-center">{{ WIRID_STEPS[wirid.currentStep]?.latin }}</p>

      <!-- Counter button -->
      <button
        @click="amalStore.tapWirid()"
        class="w-48 h-48 rounded-full bg-primary-600 active:bg-primary-700 active:scale-95 transition-all shadow-2xl shadow-primary-900/50 flex flex-col items-center justify-center"
      >
        <span class="text-5xl font-bold text-white">{{ wirid.counts[wirid.currentStep] }}</span>
        <span class="text-primary-200 text-sm mt-1">/ {{ wirid.targets[wirid.currentStep] }}</span>
      </button>

      <p class="text-slate-500 text-xs mt-6">Ketuk untuk menghitung</p>
    </div>

    <!-- Selesai -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-5 text-center">
      <span class="text-6xl mb-4">🌟</span>
      <p class="text-xl font-bold text-white mb-2">Alhamdulillah!</p>
      <p class="text-slate-400 text-sm mb-6">Wirid Sholat {{ SHOLAT_LABELS[wirid.sholatName] }} selesai</p>

      <!-- Doa setelah sholat (collapsible) -->
      <div class="w-full card bg-slate-700 border-slate-600 mb-6">
        <button @click="showDoa = !showDoa" class="w-full flex items-center justify-between text-left">
          <span class="text-sm font-semibold text-white">Doa Setelah Sholat</span>
          <ChevronDown :size="16" class="text-slate-400 transition-transform" :class="showDoa ? 'rotate-180' : ''" />
        </button>
        <Transition name="expand">
          <div v-if="showDoa" class="mt-3 pt-3 border-t border-slate-600">
            <p class="font-arabic text-right text-base text-white leading-loose mb-2">
              اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ
            </p>
            <p class="text-xs text-slate-400 italic mb-1">Allahumma antassalaam wa minkassalaam tabaarakta yaa dzal jalaali wal ikraam</p>
            <p class="text-xs text-slate-500">Ya Allah, Engkau adalah As-Salaam, dari-Mu keselamatan. Maha Berkah Engkau wahai Dzat yang memiliki keagungan dan kemuliaan.</p>
            <p class="text-xs text-primary-400 mt-1">HR. Muslim no. 592</p>
          </div>
        </Transition>
      </div>

      <div class="flex gap-3">
        <button @click="amalStore.resetWirid()" class="flex-1 py-3 rounded-xl bg-slate-700 text-white text-sm font-semibold active:scale-95 transition-transform">
          Wirid Lagi
        </button>
        <RouterLink to="/amal" class="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold text-center active:scale-95 transition-transform">
          Kembali ke Amal
        </RouterLink>
      </div>
    </div>

    <div class="pb-safe pb-6" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, ChevronDown } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'

const amalStore = useAmalStore()
const wirid = computed(() => amalStore.wiridSession)
const todayWirid = computed(() => amalStore.todayLog.wirid_sholat || {})

const showDoa = ref(false)

const SHOLAT_LIST = [
  { key: 'subuh', label: 'Subuh', short: 'Shb', icon: '🌅' },
  { key: 'dzuhur', label: 'Dzuhur', short: 'Zhh', icon: '☀️' },
  { key: 'ashar', label: 'Ashar', short: 'Ash', icon: '🌤️' },
  { key: 'maghrib', label: 'Maghrib', short: 'Mgb', icon: '🌆' },
  { key: 'isya', label: 'Isya', short: 'Isy', icon: '🌙' },
]

const SHOLAT_LABELS = { subuh: 'Subuh', dzuhur: 'Dzuhur', ashar: 'Ashar', maghrib: 'Maghrib', isya: 'Isya' }

const WIRID_STEPS = [
  { label: 'Subhanallah', arabic: 'سُبْحَانَ اللهِ', latin: 'SubhanAllah', target: 33 },
  { label: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلّهِ', latin: 'Alhamdulillah', target: 33 },
  { label: 'Allahu Akbar', arabic: 'اللهُ أَكْبَرُ', latin: 'Allahu Akbar', target: 34 },
]
</script>

<style scoped>
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 400px; }
</style>
