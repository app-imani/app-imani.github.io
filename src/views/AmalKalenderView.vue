<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Gradient header -->
    <div class="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 px-4 pt-safe pt-4 pb-6 relative overflow-hidden">
      <!-- Orbs -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
      <div class="absolute bottom-0 left-4 w-20 h-20 bg-white/10 rounded-full translate-y-8 pointer-events-none" />

      <!-- Nav row -->
      <div class="flex items-center gap-3 relative">
        <RouterLink to="/amal" class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30">
          <ArrowLeft :size="18" class="text-white" />
        </RouterLink>
        <div class="flex-1">
          <p class="text-base font-bold text-white">Kalender Amalan</p>
          <p class="text-white/70 text-xs">{{ monthLabel }}</p>
        </div>
      </div>

      <!-- Mini stats in header -->
      <div class="grid grid-cols-3 gap-2 mt-4 relative">
        <div class="bg-white/20 rounded-2xl p-3 text-center">
          <p class="text-xl font-black text-white">{{ summary.activeDays }}</p>
          <p class="text-[10px] text-white/80 font-medium">Hari Aktif</p>
        </div>
        <div class="bg-white/20 rounded-2xl p-3 text-center">
          <p class="text-xl font-black text-white">{{ summary.percentActive }}%</p>
          <p class="text-[10px] text-white/80 font-medium">Konsistensi</p>
        </div>
        <div class="bg-white/20 rounded-2xl p-3 text-center">
          <p class="text-xl font-black text-white">{{ amalStore.currentStreak }}</p>
          <p class="text-[10px] text-white/80 font-medium">🔥 Streak</p>
        </div>
      </div>
    </div>

    <div class="px-4 py-4 space-y-4 pb-24">
      <!-- Heatmap card -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-4">
        <!-- AmalHeatmap controlled by parent: month nav below header -->
        <div class="flex items-center justify-between mb-4 px-1">
          <button @click="prevMonth" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft :size="16" class="text-slate-500" />
          </button>
          <p class="text-sm font-bold text-slate-700">{{ monthLabel }}</p>
          <button @click="nextMonth" :disabled="isCurrentMonth" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30">
            <ChevronRight :size="16" class="text-slate-500" />
          </button>
        </div>
        <AmalHeatmap :year="currentYear" :month="currentMonth" />
      </div>

      <!-- Summary insight card -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-4">
        <p class="text-sm font-bold text-slate-800 mb-1">📊 Ringkasan {{ monthLabel }}</p>
        <p class="text-xs text-slate-500 mb-4">{{ summary.totalDays }} hari dalam bulan ini</p>

        <!-- Progress bar -->
        <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            class="h-full rounded-full transition-all duration-700"
            :class="summary.percentActive >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : summary.percentActive >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-rose-400 to-pink-500'"
            :style="{ width: summary.percentActive + '%' }"
          />
        </div>

        <!-- Insight row -->
        <div v-if="summary.mostConsistent" class="space-y-2">
          <div class="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl">
            <span class="text-base">✅</span>
            <div>
              <p class="text-xs font-bold text-emerald-700">Paling Konsisten</p>
              <p class="text-xs text-emerald-600">{{ formatAmalLabel(summary.mostConsistent) }}</p>
            </div>
          </div>
          <div v-if="summary.leastConsistent && summary.leastConsistent !== summary.mostConsistent" class="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl">
            <span class="text-base">⚠️</span>
            <div>
              <p class="text-xs font-bold text-amber-700">Perlu Ditingkatkan</p>
              <p class="text-xs text-amber-600">{{ formatAmalLabel(summary.leastConsistent) }}</p>
            </div>
          </div>
        </div>

        <!-- Motivasi -->
        <div
          class="mt-4 rounded-2xl p-4 text-center"
          :class="summary.percentActive >= 80 ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : summary.percentActive >= 50 ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gradient-to-r from-rose-50 to-pink-50'"
        >
          <p class="text-sm font-bold mb-0.5" :class="summary.percentActive >= 80 ? 'text-emerald-700' : summary.percentActive >= 50 ? 'text-amber-700' : 'text-rose-700'">
            {{ summaryMessage }}
          </p>
        </div>
      </div>

      <!-- Streak achievement card -->
      <StreakBadge />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'
import StreakBadge from '@/components/amal/StreakBadge.vue'
import AmalHeatmap from '@/components/amal/AmalHeatmap.vue'

const amalStore = useAmalStore()
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)

const isCurrentMonth = computed(() => {
  const now = new Date()
  return currentYear.value === now.getFullYear() && currentMonth.value === now.getMonth() + 1
})

const monthLabel = computed(() => new Date(currentYear.value, currentMonth.value - 1, 1)
  .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))

function prevMonth() {
  if (currentMonth.value === 1) { currentMonth.value = 12; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (isCurrentMonth.value) return
  if (currentMonth.value === 12) { currentMonth.value = 1; currentYear.value++ }
  else currentMonth.value++
}

const summary = computed(() => amalStore.getMonthSummary(currentYear.value, currentMonth.value))

const summaryMessage = computed(() => {
  const p = summary.value.percentActive
  if (p >= 80) return 'MasyaAllah! Konsistensimu luar biasa bulan ini 🌟'
  if (p >= 50) return 'Alhamdulillah! Terus semangat tingkatkan amalmu 💚'
  return 'Yuk tingkatkan lagi — setiap amalan sangat bernilai 💪'
})

const AMAL_LABELS = {
  dzikir_pagi: 'Dzikir Pagi', dzikir_petang: 'Dzikir Petang',
  al_mulk: 'Al-Mulk', al_kahfi: 'Al-Kahfi', al_waqiah: "Al-Waqi'ah",
  sunnah_sholat_dhuha: 'Sholat Dhuha', sunnah_sedekah_harian: 'Sedekah',
  sunnah_tilawah_pages: 'Tilawah', sunnah_sholat_tahajud: 'Tahajud',
}
function formatAmalLabel(key) {
  return AMAL_LABELS[key] || key.replace(/_/g, ' ')
}
</script>
