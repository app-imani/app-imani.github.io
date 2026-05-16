<template>
  <PageWrapper>
    <template #topbar>
      <TopBar title="Sholat" subtitle="Jadwal & Pencatatan">
        <template #actions>
          <RouterLink to="/settings" class="p-2 rounded-xl active:bg-slate-100 transition-colors" aria-label="Pengaturan">
            <Settings :size="20" class="text-slate-400" />
          </RouterLink>
        </template>
      </TopBar>
    </template>

    <div class="pb-8 space-y-4">

      <!-- ── CALENDAR HERO ─────────────────────────────────── -->
      <div class="mx-4 rounded-3xl bg-white border border-rose-100/70 shadow-sm overflow-hidden">

        <!-- Month nav -->
        <div class="flex items-center justify-between px-4 pt-4 pb-2">
          <button @click="prevCalMonth" class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 active:scale-90 transition-all">
            <ChevronLeft :size="16" class="text-rose-400" />
          </button>
          <div class="text-center">
            <p class="text-sm font-bold text-slate-800">{{ calMonthLabel }}</p>
            <p class="text-[11px] text-rose-400 font-medium">{{ calHijriLabel }}</p>
          </div>
          <button @click="nextCalMonth" :disabled="isCalCurrentMonth" class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 active:scale-90 transition-all disabled:opacity-30">
            <ChevronRight :size="16" class="text-rose-400" />
          </button>
        </div>

        <!-- Day-of-week headers -->
        <div class="grid grid-cols-7 px-2">
          <div v-for="dl in DAY_LABELS" :key="dl.label" class="py-1 text-center text-[10px] font-bold tracking-wide" :class="dl.weekend ? 'text-rose-400' : 'text-slate-400'">
            {{ dl.label }}
          </div>
        </div>

        <!-- Calendar cells -->
        <div class="grid grid-cols-7 px-2 pb-3 gap-y-1">
          <div v-for="n in calFirstDayOffset" :key="`e-${n}`" />
          <button
            v-for="cell in calCells"
            :key="cell.dateStr"
            @click="selectCalDate(cell.dateStr)"
            :disabled="cell.isFuture"
            class="relative flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-90 disabled:opacity-30 disabled:cursor-default"
            :class="calCellClass(cell)"
          >
            <span v-if="cell.isToday && cell.dateStr !== selectedDate" class="absolute inset-0.5 rounded-xl ring-2 ring-rose-300/50" />
            <span class="text-[13px] font-bold leading-none" :class="cell.dateStr === selectedDate ? 'text-white' : cell.isToday ? 'text-rose-600' : 'text-slate-700'">{{ cell.day }}</span>
            <div class="mt-1 flex items-center gap-[2px]">
              <template v-if="cell.isUdzur">
                <span class="text-[7px] text-rose-300">🌸</span>
              </template>
              <template v-else-if="cell.count > 0">
                <div v-for="i in 5" :key="i" class="h-[4px] w-[4px] rounded-full transition-all"
                  :class="i <= cell.count
                    ? (cell.dateStr === selectedDate ? 'bg-white/80' : cell.count === 5 ? 'bg-emerald-400' : 'bg-amber-400')
                    : (cell.dateStr === selectedDate ? 'bg-white/25' : 'bg-slate-200')" />
              </template>
              <template v-else>
                <div class="h-[4px] w-[4px] rounded-full bg-slate-200" />
              </template>
            </div>
          </button>
        </div>

        <!-- Selected date bar -->
        <div class="border-t border-rose-50 px-4 py-2.5 flex items-center justify-between bg-gradient-to-r from-rose-50/60 to-pink-50/40">
          <div>
            <p class="text-xs font-bold text-slate-700">{{ isToday ? '✨ Hari Ini' : displayDate }}</p>
            <p class="text-[11px] text-rose-400 mt-0.5">{{ hijriStr }}</p>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="px-2.5 py-1 rounded-full text-[11px] font-bold" :class="dayCompletionCount === 5 ? 'bg-emerald-100 text-emerald-700' : dayCompletionCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'">
              {{ dayCompletionCount }}/5
            </div>
            <span v-if="dayCompletionCount === 5" class="text-base">🏆</span>
          </div>
        </div>
      </div>

      <!-- ── HAID NOTICE ─────────────────────────────────────── -->
      <transition name="slide-down">
        <div v-if="cycleStore.isHaidActive" class="mx-4 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 px-4 py-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-rose-100">
            <span class="text-base">🌸</span>
          </div>
          <p class="text-xs text-rose-600 font-medium leading-relaxed">Mode Haid aktif — sholat tidak diwajibkan. Tetap dzikir dan berdoa ya, sayaang 💕</p>
        </div>
      </transition>

      <!-- ── PRAYER CARDS ────────────────────────────────────── -->
      <PrayerChecklist
        :date="selectedDate"
        :prayer-times="prayerTimes"
        :show-header="false"
      />

      <!-- ── STREAK ─────────────────────────────────────────── -->
      <div class="mx-4 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-100/60 px-5 py-4 flex items-center gap-4">
        <div class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-200/60">
          <Flame :size="28" class="text-white" />
          <div v-if="prayerStore.streak > 0" class="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {{ prayerStore.streak }}
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-slate-800">Streak Sholat</p>
          <p class="text-xs text-slate-500 mt-0.5">Berturut-turut penuh 5 waktu</p>
          <div class="mt-2 h-1.5 rounded-full bg-amber-100 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700" :style="{ width: `${Math.min(100, (prayerStore.streak / 30) * 100)}%` }" />
          </div>
          <p class="text-[10px] text-slate-400 mt-1">{{ prayerStore.streak }} / 30 hari milestone</p>
        </div>
      </div>

      <!-- ── MONTHLY SUMMARY ───────────────────────────────── -->
      <div class="mx-4 rounded-3xl bg-white border border-slate-100 overflow-hidden">
        <!-- IMPR-12 AC-02: Empty state for new users -->
        <div v-if="Object.keys(prayerStore.logs).length === 0" class="p-6">
          <EmptyState
            illustration="🕌"
            title="Belum ada catatan sholat"
            description="Catat sholatmu mulai hari ini untuk melihat ringkasan dan streak di sini."
            cta-label="Catat Sholat Sekarang"
            @cta-click="selectedDate = today.format('YYYY-MM-DD')"
          />
        </div>
        <template v-else>
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-50">
          <div>
            <h2 class="text-sm font-bold text-slate-800">Ringkasan {{ calMonthLabel }}</h2>
            <p class="text-xs text-slate-400 mt-0.5">{{ monthCompleteDays }} hari penuh dari {{ calCells.filter(c => !c.isFuture).length }} hari</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-black" :class="monthPct >= 80 ? 'text-emerald-500' : monthPct >= 50 ? 'text-amber-500' : 'text-rose-400'">{{ monthPct }}%</p>
            <p class="text-[10px] text-slate-400">konsistensi</p>
          </div>
        </div>
        <div class="px-5 py-3 border-b border-slate-50">
          <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000" :class="monthPct >= 80 ? 'bg-gradient-to-r from-emerald-400 to-primary-500' : monthPct >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-rose-400 to-pink-500'" :style="{ width: `${monthPct}%` }" />
          </div>
        </div>
        <div class="px-4 py-3 grid grid-cols-7 gap-1.5">
          <div v-for="cell in calCells" :key="`sum-${cell.dateStr}`" class="flex flex-col items-center gap-0.5">
            <div class="h-7 w-7 rounded-xl flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all active:scale-90" :class="summaryDotClass(cell)" @click="selectCalDate(cell.dateStr)">
              {{ cell.isUdzur ? '🌸' : cell.count === 5 ? '✓' : cell.count > 0 ? cell.count : '' }}
            </div>
            <p class="text-[8px] text-slate-400">{{ dayjs(cell.dateStr).format('D') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4 px-5 pb-4 flex-wrap">
          <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-md bg-emerald-500" /><span class="text-[10px] text-slate-400">Penuh (5/5)</span></div>
          <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-md bg-amber-400" /><span class="text-[10px] text-slate-400">Sebagian</span></div>
          <div class="flex items-center gap-1.5"><div class="text-[10px]">🌸</div><span class="text-[10px] text-slate-400">Haid/Udzur</span></div>
          <div class="flex items-center gap-1.5"><div class="h-3 w-3 rounded-md bg-slate-100 border border-slate-200" /><span class="text-[10px] text-slate-400">Belum</span></div>
        </div>
        </template>
      </div>

    </div>

  </PageWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Flame, Settings } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import TopBar from '@/components/layout/TopBar.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import PrayerChecklist from '@/components/dashboard/PrayerChecklist.vue'

import { usePrayerStore } from '@/stores/prayer'
import { useCycleStore } from '@/stores/cycle'
import { useSettingsStore } from '@/stores/settings'
import { usePrayerTimes } from '@/composables/usePrayerTimes'
import { useHijriDate } from '@/composables/useHijriDate'

import EmptyState from '@/components/ui/EmptyState.vue'

const prayerStore = usePrayerStore()
const cycleStore = useCycleStore()
const settingsStore = useSettingsStore()
const { fetchByCity } = usePrayerTimes()
const { formatHijri, toHijri } = useHijriDate()

const today = dayjs()
const selectedDate = ref(today.format('YYYY-MM-DD'))
const prayerTimes = ref(null)
const prayerTimesLoading = ref(false)

const calMonth = ref(today.startOf('month'))

const isToday = computed(() => selectedDate.value === today.format('YYYY-MM-DD'))
const isCalCurrentMonth = computed(() => calMonth.value.isSame(today.startOf('month'), 'month'))

const displayDate = computed(() => {
  const d = dayjs(selectedDate.value)
  return d.isSame(today, 'day') ? 'Hari Ini' : d.locale('id').format('dddd, D MMMM YYYY')
})
const hijriStr = computed(() => formatHijri(dayjs(selectedDate.value)))
const calMonthLabel = computed(() => calMonth.value.locale('id').format('MMMM YYYY'))
const calHijriLabel = computed(() => {
  const h1 = toHijri(calMonth.value.toDate())
  const h2 = toHijri(calMonth.value.endOf('month').toDate())
  if (h1.month !== h2.month) return `${h1.monthNameId} – ${h2.monthNameId} ${h2.year} H`
  return `${h1.monthNameId} ${h1.year} H`
})

const DAY_LABELS = [
  { label: 'Min', weekend: true }, { label: 'Sen', weekend: false },
  { label: 'Sel', weekend: false }, { label: 'Rab', weekend: false },
  { label: 'Kam', weekend: false }, { label: 'Jum', weekend: true },
  { label: 'Sab', weekend: true },
]

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

const calCells = computed(() => {
  const start = calMonth.value.startOf('month')
  const daysInMonth = calMonth.value.daysInMonth()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = start.add(i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    const log = prayerStore.logs[dateStr]
    const isUdzur = log?.is_udzur || false
    const count = isUdzur ? 5 : PRAYER_KEYS.filter((k) => {
      const s = prayerStore.getStatus(dateStr, k)
      return s && s !== 'skip'
    }).length
    return { day: d.date(), dateStr, dayOfWeek: d.day(), isToday: d.isSame(today, 'day'), isFuture: d.isAfter(today, 'day'), count, isUdzur }
  })
})

const calFirstDayOffset = computed(() => calCells.value[0]?.dayOfWeek ?? 0)

const monthCompleteDays = computed(() => calCells.value.filter((c) => c.count === 5 && !c.isFuture).length)
const monthPct = computed(() => {
  const past = calCells.value.filter((c) => !c.isFuture)
  if (!past.length) return 0
  return Math.round((monthCompleteDays.value / past.length) * 100)
})

function calCellClass(cell) {
  if (cell.dateStr === selectedDate.value) return 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-md shadow-rose-200/60'
  if (cell.isToday) return 'bg-rose-50'
  if (cell.isFuture) return ''
  return 'hover:bg-slate-50'
}

function summaryDotClass(cell) {
  if (cell.dateStr === selectedDate.value) return 'bg-gradient-to-br from-rose-500 to-pink-500 text-white ring-2 ring-rose-300'
  if (cell.isUdzur) return 'bg-rose-50 border border-rose-200'
  if (cell.count === 5) return 'bg-emerald-500 text-white'
  if (cell.count > 0) return 'bg-amber-400 text-white'
  if (cell.isFuture) return 'bg-transparent border border-dashed border-slate-200 text-slate-300'
  return 'bg-slate-100 text-slate-300'
}

const dayCompletionCount = computed(() => {
  const log = prayerStore.logs[selectedDate.value]
  if (log?.is_udzur) return 5
  return PRAYER_KEYS.filter((k) => {
    const s = prayerStore.getStatus(selectedDate.value, k)
    return s && s !== 'skip'
  }).length
})

function prevCalMonth() { calMonth.value = calMonth.value.subtract(1, 'month') }
function nextCalMonth() { if (!isCalCurrentMonth.value) calMonth.value = calMonth.value.add(1, 'month') }
function selectCalDate(dateStr) {
  selectedDate.value = dateStr
  const d = dayjs(dateStr)
  if (!d.isSame(calMonth.value, 'month')) calMonth.value = d.startOf('month')
}

async function loadPrayerTimes() {
  prayerTimesLoading.value = true
  try {
    const city    = settingsStore.city    || 'Jakarta'
    const country = settingsStore.country || 'Indonesia'
    prayerTimes.value = await fetchByCity(city, country, selectedDate.value)
  } catch { prayerTimes.value = null }
  finally { prayerTimesLoading.value = false }
}

watch(selectedDate, loadPrayerTimes)
onMounted(loadPrayerTimes)
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to { opacity: 0; transform: translateY(-4px); }
.badge-pop-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.badge-pop-enter-from { opacity: 0; transform: scale(0.6); }
.badge-pop-leave-active { transition: all 0.15s ease; }
.badge-pop-leave-to { opacity: 0; transform: scale(0.8); }
</style>
