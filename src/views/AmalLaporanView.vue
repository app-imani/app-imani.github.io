<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <div class="bg-white border-b border-slate-100 px-4 pt-safe pt-4 pb-4 flex items-center gap-3">
      <RouterLink to="/amal" class="p-2 rounded-xl text-slate-500 active:bg-slate-100">
        <ArrowLeft :size="20" />
      </RouterLink>
      <div class="flex-1">
        <p class="text-base font-bold text-slate-800">Laporan Amalan</p>
        <p class="text-xs text-slate-400">{{ activeTab === 'mingguan' ? '7 hari terakhir' : 'Ringkasan bulanan' }}</p>
      </div>
    </div>

    <!-- IMPR-14: Tab switcher -->
    <div class="flex gap-1 mx-4 mt-4 p-1 rounded-2xl bg-slate-100">
      <button
        v-for="tab in TABS" :key="tab.value"
        @click="activeTab = tab.value"
        class="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
        :class="activeTab === tab.value ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'"
      >{{ tab.label }}</button>
    </div>

    <div class="px-4 py-4 space-y-4 pb-24">

      <!-- ── MINGGUAN TAB ── -->
      <template v-if="activeTab === 'mingguan'">
        <div class="card bg-gradient-to-br from-primary-600 to-primary-800 text-white text-center py-5">
          <p class="text-xs uppercase tracking-wider text-primary-200 mb-1">Streak Saat Ini</p>
          <p class="text-5xl font-bold">{{ weekly.streak }}</p>
          <p class="text-primary-200 text-sm mt-1">hari berturut-turut 🔥</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="card text-center">
            <p class="text-3xl font-bold text-primary-700">{{ weekly.activeDays }}/7</p>
            <p class="text-xs text-slate-500 mt-1">Hari Aktif Beramal</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-emerald-600">{{ report.muhasabahDone }}/7</p>
            <p class="text-xs text-slate-500 mt-1">Muhasabah Diisi</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-sky-600">{{ report.dzikirPagiDone }}/7</p>
            <p class="text-xs text-slate-500 mt-1">Dzikir Pagi</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-orange-600">{{ report.totalTasbih }}</p>
            <p class="text-xs text-slate-500 mt-1">Total Tasbih</p>
          </div>
        </div>
        <div class="card">
          <p class="text-sm font-bold text-slate-800 mb-3">Aktivitas 7 Hari</p>
          <div class="flex items-end gap-1.5 h-24">
            <div v-for="(count, idx) in weekly.amalCounts" :key="idx" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full rounded-t-lg transition-all"
                :class="count === -1 ? 'bg-pink-200' : count >= 5 ? 'bg-primary-500' : count >= 1 ? 'bg-primary-200' : 'bg-slate-100'"
                :style="{ height: count === -1 ? '40px' : `${Math.max(8, Math.min(96, count * 12))}px` }" />
              <span class="text-xs text-slate-400">{{ getDayLabel(weekly.days[idx].key) }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ── BULANAN TAB ── -->
      <template v-else>
        <div class="flex items-center justify-between">
          <button @click="prevMonth" class="p-2 rounded-xl bg-white border border-slate-200 active:scale-95 transition-transform">
            <ChevronLeft :size="16" class="text-slate-500" />
          </button>
          <p class="text-sm font-bold text-slate-800">{{ monthLabel }}</p>
          <button @click="nextMonth" :disabled="isCurrentMonth" class="p-2 rounded-xl bg-white border border-slate-200 active:scale-95 disabled:opacity-30">
            <ChevronRight :size="16" class="text-slate-500" />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="card text-center">
            <p class="text-3xl font-bold text-primary-700">{{ monthly.activeDays }}/{{ monthly.daysInMonth }}</p>
            <p class="text-xs text-slate-500 mt-1">Hari Aktif</p>
          </div>
          <div class="card text-center">
            <p class="text-2xl font-bold" :class="monthPct >= 80 ? 'text-emerald-600' : monthPct >= 50 ? 'text-amber-500' : 'text-rose-400'">{{ monthPct }}%</p>
            <p class="text-xs text-slate-500 mt-1">Konsistensi</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-sky-600">{{ monthly.dzikirPagiDone }}</p>
            <p class="text-xs text-slate-500 mt-1">Dzikir Pagi</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-violet-600">{{ monthly.muhasabahDone }}</p>
            <p class="text-xs text-slate-500 mt-1">Muhasabah</p>
          </div>
        </div>
        <div class="card">
          <p class="text-sm font-bold text-slate-800 mb-3">Hari Aktif per Pekan</p>
          <div class="flex items-end gap-3 h-20">
            <div v-for="(count, idx) in monthly.weeks" :key="idx" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full rounded-t-lg transition-all"
                :class="count >= 6 ? 'bg-emerald-500' : count >= 4 ? 'bg-primary-400' : count >= 2 ? 'bg-amber-400' : 'bg-slate-200'"
                :style="{ height: `${Math.max(8, count * 10)}px` }" />
              <span class="text-[10px] text-slate-400">P{{ idx + 1 }}</span>
            </div>
          </div>
        </div>
        <div class="card border-primary-100 bg-primary-50 space-y-2">
          <p class="text-sm font-bold text-primary-800 mb-1">💡 Insight Bulan Ini</p>
          <p v-for="(ins, i) in monthly.insights" :key="i" class="text-xs text-primary-700 leading-relaxed">{{ ins }}</p>
        </div>
      </template>

      <!-- Motivasi -->
      <div class="card border-primary-100 bg-primary-50 text-center py-4">
        <p class="font-arabic text-lg text-primary-800 leading-loose mb-1">{{ motivasiQuote.arabic }}</p>
        <p class="text-sm text-primary-700 italic leading-relaxed">{{ motivasiQuote.text }}</p>
        <p class="text-xs text-primary-500 mt-1">{{ motivasiQuote.source }}</p>
      </div>

      <button @click="shareReport" class="w-full py-3.5 rounded-2xl bg-primary-600 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
        <Share2 :size="18" />
        Bagikan Pencapaian
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Share2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'
import quotesData from '@/assets/data/islamic_quotes.json'

const amalStore = useAmalStore()

const TABS = [
  { value: 'mingguan', label: '📅 Mingguan' },
  { value: 'bulanan', label: '📊 Bulanan' },
]
const activeTab = ref('mingguan')

const report = computed(() => amalStore.weeklyReport)
const weekly = computed(() => amalStore.getWeeklySummary())

const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth() + 1)
const isCurrentMonth = computed(() => viewYear.value === now.getFullYear() && viewMonth.value === now.getMonth() + 1)
const monthLabel = computed(() => new Date(viewYear.value, viewMonth.value - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))
const monthly = computed(() => amalStore.getMonthlyReport(viewYear.value, viewMonth.value))
const monthPct = computed(() => {
  if (!monthly.value.daysInMonth) return 0
  const pastDays = isCurrentMonth.value ? now.getDate() : monthly.value.daysInMonth
  return Math.round((monthly.value.activeDays / pastDays) * 100)
})

function prevMonth() {
  if (viewMonth.value === 1) { viewMonth.value = 12; viewYear.value-- }
  else viewMonth.value--
}
function nextMonth() {
  if (isCurrentMonth.value) return
  if (viewMonth.value === 12) { viewMonth.value = 1; viewYear.value++ }
  else viewMonth.value++
}

const DAY_LABELS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
function getDayLabel(key) {
  const d = new Date(key + 'T00:00:00')
  return DAY_LABELS_SHORT[d.getDay()]
}

const motivasiQuote = computed(() => {
  const regular = quotesData.filter(q => q.category !== 'motivasi' && q.arabic)
  const idx = new Date().getDay()
  return regular[idx % regular.length]
})

async function shareReport() {
  const text = activeTab.value === 'mingguan'
    ? `Alhamdulillah, pekan ini aku beramal ${weekly.value.activeDays}/7 hari 🌙 Streak: ${weekly.value.streak} hari. #Imani`
    : `Alhamdulillah, ${monthLabel.value} aktif ${monthly.value.activeDays}/${monthly.value.daysInMonth} hari (${monthPct.value}%) 🌙 #Imani`
  try {
    if (navigator.share) await navigator.share({ title: 'Laporan Amalku — Imani', text })
    else { await navigator.clipboard.writeText(text); window.$toast?.('Teks disalin ✓', 'success') }
  } catch {}
}
</script>
