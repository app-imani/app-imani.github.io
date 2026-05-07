<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <div class="bg-white border-b border-slate-100 px-4 pt-safe pt-4 pb-4 flex items-center gap-3">
      <RouterLink to="/amal" class="p-2 rounded-xl text-slate-500 active:bg-slate-100">
        <ArrowLeft :size="20" />
      </RouterLink>
      <div class="flex-1">
        <p class="text-base font-bold text-slate-800">Laporan Amalan</p>
        <p class="text-xs text-slate-400">7 hari terakhir</p>
      </div>
    </div>

    <div class="px-4 py-4 space-y-4 pb-24">
      <!-- Streak hero -->
      <div class="card bg-gradient-to-br from-primary-600 to-primary-800 text-white text-center py-5">
        <p class="text-xs uppercase tracking-wider text-primary-200 mb-1">Streak Saat Ini</p>
        <p class="text-5xl font-bold">{{ report.streak }}</p>
        <p class="text-primary-200 text-sm mt-1">hari berturut-turut 🔥</p>
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-2 gap-3">
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary-700">{{ report.activeDays }}/7</p>
          <p class="text-xs text-slate-500 mt-1">Hari Aktif Beramal</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-emerald-600">{{ report.muhasabahDone }}/7</p>
          <p class="text-xs text-slate-500 mt-1">Muhasabah Diisi</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-sky-600">{{ report.dzikirPagiDone }}/7</p>
          <p class="text-xs text-slate-500 mt-1">Dzikir Pagi Selesai</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-orange-600">{{ report.totalTasbih }}</p>
          <p class="text-xs text-slate-500 mt-1">Total Tasbih</p>
        </div>
      </div>

      <!-- 7-day bar chart -->
      <div class="card">
        <p class="text-sm font-bold text-slate-800 mb-3">Aktivitas 7 Hari</p>
        <div class="flex items-end gap-1.5 h-24">
          <div
            v-for="day in report.days"
            :key="day.key"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <div
              class="w-full rounded-t-lg transition-all"
              :class="getDayBarClass(day)"
              :style="{ height: getDayBarHeight(day) }"
            />
            <span class="text-xs text-slate-400">{{ getDayLabel(day.key) }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-2 flex-wrap">
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-primary-500" /><span class="text-xs text-slate-500">5+ amal</span></div>
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-primary-200" /><span class="text-xs text-slate-500">1-4 amal</span></div>
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-pink-200" /><span class="text-xs text-slate-500">udzur</span></div>
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-slate-100" /><span class="text-xs text-slate-500">kosong</span></div>
        </div>
      </div>

      <!-- Motivasi -->
      <div class="card border-primary-100 bg-primary-50 text-center py-4">
        <p class="font-arabic text-lg text-primary-800 leading-loose mb-1">{{ motivasiQuote.arabic }}</p>
        <p class="text-sm text-primary-700 italic leading-relaxed">{{ motivasiQuote.text }}</p>
        <p class="text-xs text-primary-500 mt-1">{{ motivasiQuote.source }}</p>
      </div>

      <!-- Share button -->
      <button
        @click="shareReport"
        class="w-full py-3.5 rounded-2xl bg-primary-600 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <Share2 :size="18" />
        Bagikan Pencapaian
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Share2 } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'
import quotesData from '@/assets/data/islamic_quotes.json'

const amalStore = useAmalStore()
const report = computed(() => amalStore.weeklyReport)

const DAY_LABELS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function getDayLabel(key) {
  const d = new Date(key + 'T00:00:00')
  return DAY_LABELS_SHORT[d.getDay()]
}

function getDayBarClass(day) {
  if (!day.log) return 'bg-slate-100'
  if (day.log.is_udzur) return 'bg-pink-200'
  const done = ['dzikir_pagi', 'dzikir_petang', 'al_mulk', 'al_kahfi', 'al_waqiah'].filter(k => day.log[k]).length
    + Object.values(day.log.sunnah || {}).filter(v => v === true || (typeof v === 'number' && v > 0)).length
  return done >= 5 ? 'bg-primary-500' : done >= 1 ? 'bg-primary-200' : 'bg-slate-100'
}

function getDayBarHeight(day) {
  if (!day.log) return '8px'
  if (day.log.is_udzur) return '40px'
  const done = ['dzikir_pagi', 'dzikir_petang', 'al_mulk', 'al_kahfi', 'al_waqiah'].filter(k => day.log[k]).length
    + Object.values(day.log.sunnah || {}).filter(v => v === true || (typeof v === 'number' && v > 0)).length
  return `${Math.max(8, Math.min(96, done * 16))}px`
}

const motivasiQuote = computed(() => {
  const regular = quotesData.filter(q => q.category !== 'motivasi' && q.arabic)
  const idx = new Date().getDay()
  return regular[idx % regular.length]
})

async function shareReport() {
  const text = `Alhamdulillah, pekan ini aku beramal ${report.value.activeDays}/7 hari penuh 🌙 Streak: ${report.value.streak} hari. #Imani #AmalanHarian`
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Laporan Amalku — Imani', text })
    } else {
      await navigator.clipboard.writeText(text)
      window.$toast?.('Teks laporan disalin ke clipboard ✓', 'success')
    }
  } catch (e) {
    console.debug('Share gagal:', e.message)
  }
}
</script>
