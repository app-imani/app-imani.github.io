<template>
  <div class="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50/30 to-white">

    <!-- Top bar -->
    <div class="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-rose-100/60">
      <div class="flex items-center gap-3 px-4 py-3">
        <button @click="$router.back()" class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-50 active:bg-rose-100 transition-colors">
          <ChevronLeft :size="20" class="text-rose-500" />
        </button>
        <div class="flex-1 text-center">
          <h1 class="text-sm font-bold text-slate-800">Kalender Hijriah</h1>
          <p class="text-[11px] text-slate-400">{{ gregorianMonthLabel }}</p>
        </div>
        <div class="w-9" />
      </div>
    </div>

    <!-- Hero: month navigator -->
    <div class="relative px-4 pt-6 pb-5">
      <!-- soft bg blob -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-rose-100/60 via-pink-50/40 to-transparent" />

      <div class="relative flex items-center justify-between">
        <button
          @click="prevMonth"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-rose-100 active:scale-95 transition-all"
        >
          <ChevronLeft :size="18" class="text-rose-400" />
        </button>

        <div class="text-center px-4">
          <p class="text-[28px] leading-tight font-arabic text-rose-600 tracking-wide" style="font-family: 'Scheherazade New', 'Amiri', 'Arial Unicode MS', serif;">
            {{ currentHijriMonthAr }}
          </p>
          <h2 class="text-xl font-bold text-slate-800 mt-0.5">{{ currentHijriMonthId }}</h2>
          <p class="text-sm text-slate-400 mt-0.5">{{ currentHijriYear }} H</p>
        </div>

        <button
          @click="nextMonth"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-rose-100 active:scale-95 transition-all"
        >
          <ChevronRight :size="18" class="text-rose-400" />
        </button>
      </div>

      <!-- Today pill -->
      <div class="mt-4 flex justify-center">
        <button
          @click="goToToday"
          class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-rose-200 bg-white text-xs font-semibold text-rose-500 active:scale-95 transition-all"
        >
          <Sparkles :size="12" />
          Ke Hari Ini
        </button>
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="mx-4 rounded-3xl bg-white shadow-sm border border-rose-100/60 overflow-hidden">
      <!-- Day headers -->
      <div class="grid grid-cols-7 border-b border-rose-50">
        <div
          v-for="d in DAY_LABELS"
          :key="d.label"
          class="py-2.5 text-center text-[10px] font-bold tracking-wide"
          :class="d.weekend ? 'text-rose-400' : 'text-slate-400'"
        >
          {{ d.label }}
        </div>
      </div>

      <!-- Day cells -->
      <div class="grid grid-cols-7 p-2 gap-1">
        <!-- Empty cells before first day -->
        <div v-for="n in firstDayOffset" :key="`empty-${n}`" />

        <!-- Calendar days -->
        <div
          v-for="cell in calendarCells"
          :key="cell.hijriDay"
          @click="selectDay(cell)"
          class="relative flex flex-col items-center justify-center rounded-2xl py-2 px-1 cursor-pointer transition-all active:scale-95 min-h-[52px]"
          :class="dayCellClass(cell)"
        >
          <!-- Special day dot -->
          <div
            v-if="cell.isAyyamulBidh && !cell.isToday"
            class="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400"
          />
          <div
            v-if="cell.isArafah && !cell.isToday"
            class="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-green-500"
          />
          <div
            v-if="cell.isFriday && !cell.isToday && !cell.isAyyamulBidh"
            class="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-300"
          />

          <!-- Hijri day number -->
          <span
            class="text-sm font-bold leading-none"
            :class="cell.isToday ? 'text-white' : (cell.isFriday || cell.isSunday) ? 'text-rose-500' : 'text-slate-700'"
          >{{ cell.hijriDay }}</span>

          <!-- Gregorian day number -->
          <span
            class="mt-0.5 text-[9px] leading-none"
            :class="cell.isToday ? 'text-white/80' : 'text-slate-400'"
          >{{ cell.gregorianDay }}</span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mx-4 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1">
      <div class="flex items-center gap-1.5">
        <div class="h-2 w-2 rounded-full bg-gradient-to-br from-rose-500 to-pink-500" />
        <span class="text-[10px] text-slate-400">Hari ini</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="h-2 w-2 rounded-full bg-amber-400" />
        <span class="text-[10px] text-slate-400">Ayyamul Bidh (13–15)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="h-2 w-2 rounded-full bg-green-500" />
        <span class="text-[10px] text-slate-400">Arafah (9 Dzulhijjah)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="h-2 w-2 rounded-full bg-rose-300" />
        <span class="text-[10px] text-slate-400">Jumat</span>
      </div>
    </div>

    <!-- Selected day detail card -->
    <transition name="slide-up">
      <div v-if="selectedCell" class="mx-4 mt-4 rounded-3xl bg-white border border-rose-100 shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 px-5 py-4 border-b border-rose-100/60">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-400">
                {{ selectedCell.gregorianFull }}
              </p>
              <h3 class="mt-1 text-xl font-bold text-slate-800">
                {{ selectedCell.hijriDay }} {{ selectedCell.monthNameId }}
              </h3>
              <p class="text-sm text-slate-500">{{ selectedCell.hijriYear }} H</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[24px] leading-none font-arabic text-rose-500" style="font-family: 'Scheherazade New', 'Amiri', serif;">
                {{ selectedCell.hijriDay }} {{ selectedCell.monthNameAr }}
              </p>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 space-y-2">
          <div v-if="selectedCell.isToday" class="flex items-center gap-2 text-sm text-primary-700 font-medium">
            <span>🌟</span> Hari ini
          </div>
          <div v-if="selectedCell.isFriday" class="flex items-center gap-2 text-sm text-rose-600 font-medium">
            <span>🕌</span> Hari Jumat — dianjurkan baca Al-Kahfi
          </div>
          <div v-if="selectedCell.isAyyamulBidh" class="flex items-center gap-2 text-sm text-amber-700 font-medium">
            <span>🌕</span> Ayyamul Bidh — puasa sunnah dianjurkan
          </div>
          <div v-if="selectedCell.isArafah" class="flex items-center gap-2 text-sm text-green-700 font-medium">
            <span>🤲</span> Hari Arafah — puasa menghapus dosa 2 tahun
          </div>
          <div v-if="selectedCell.isSenin" class="flex items-center gap-2 text-sm text-indigo-700 font-medium">
            <span>☀️</span> Hari Senin — puasa sunnah Senin-Kamis
          </div>
          <div v-if="selectedCell.isKamis" class="flex items-center gap-2 text-sm text-indigo-700 font-medium">
            <span>☀️</span> Hari Kamis — puasa sunnah Senin-Kamis
          </div>
          <div
            v-if="!selectedCell.isToday && !selectedCell.isFriday && !selectedCell.isAyyamulBidh && !selectedCell.isArafah && !selectedCell.isSenin && !selectedCell.isKamis"
            class="text-sm text-slate-400"
          >
            Tidak ada catatan khusus untuk hari ini.
          </div>
        </div>
      </div>
    </transition>

    <!-- Month summary card -->
    <div class="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-primary-500 p-5 text-white shadow-lg shadow-rose-200/60">
      <p class="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70">Bulan ini</p>
      <h3 class="mt-1 text-lg font-bold">{{ currentHijriMonthId }} {{ currentHijriYear }} H</h3>
      <div class="mt-3 grid grid-cols-3 gap-2">
        <div class="rounded-2xl bg-white/15 px-3 py-2.5 text-center backdrop-blur-sm">
          <p class="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Hari</p>
          <p class="mt-1 text-lg font-bold">{{ calendarCells.length }}</p>
        </div>
        <div class="rounded-2xl bg-white/15 px-3 py-2.5 text-center backdrop-blur-sm">
          <p class="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Ayyamul Bidh</p>
          <p class="mt-1 text-lg font-bold">{{ ayyamulBidhCount }}</p>
        </div>
        <div class="rounded-2xl bg-white/15 px-3 py-2.5 text-center backdrop-blur-sm">
          <p class="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Jumat</p>
          <p class="mt-1 text-lg font-bold">{{ fridayCount }}</p>
        </div>
      </div>
    </div>

    <!-- Upcoming Islamic events -->
    <div v-if="upcomingEvents.length" class="mx-4 mt-4 mb-8 rounded-3xl bg-white border border-rose-100 overflow-hidden">
      <div class="px-5 py-3.5 border-b border-rose-50">
        <h3 class="text-sm font-bold text-slate-800">Peristiwa Bulan Ini</h3>
      </div>
      <div class="divide-y divide-rose-50">
        <div
          v-for="ev in upcomingEvents"
          :key="ev.key"
          class="flex items-center gap-3 px-5 py-3"
        >
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl" :class="ev.bgClass">
            <span class="text-base">{{ ev.emoji }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800">{{ ev.label }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ ev.dateLabel }}</p>
          </div>
          <span
            v-if="ev.isToday"
            class="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700"
          >Hari ini</span>
          <span
            v-else-if="ev.daysLeft >= 0"
            class="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-500"
          >{{ ev.daysLeft === 0 ? 'Hari ini' : `${ev.daysLeft} hari lagi` }}</span>
        </div>
      </div>
    </div>

    <div class="h-8" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useHijriDate } from '@/composables/useHijriDate'

const router = useRouter()
const { toHijri } = useHijriDate()

// Day labels: Sun=0 ... Sat=6  (we show Sun first)
const DAY_LABELS = [
  { label: 'Min', weekend: true },
  { label: 'Sen', weekend: false },
  { label: 'Sel', weekend: false },
  { label: 'Rab', weekend: false },
  { label: 'Kam', weekend: false },
  { label: 'Jum', weekend: true },
  { label: 'Sab', weekend: true },
]

// Reference date — a Gregorian day within the displayed Hijri month
const referenceDate = ref(dayjs())

// Compute current Hijri month from reference
const currentHijri = computed(() => toHijri(referenceDate.value.toDate()))
const currentHijriMonthId = computed(() => currentHijri.value.monthNameId)
const currentHijriMonthAr = computed(() => currentHijri.value.monthNameAr)
const currentHijriYear = computed(() => currentHijri.value.year)
const currentHijriMonth = computed(() => currentHijri.value.month)

const gregorianMonthLabel = computed(() =>
  referenceDate.value.locale('id').format('MMMM YYYY')
)

// ── Build calendar cells ──────────────────────────────────────

function buildCalendarCells(ref) {
  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')

  const refHijri = toHijri(ref.toDate())
  const targetMonth = refHijri.month
  const targetYear = refHijri.year

  // Find the first Gregorian day of this Hijri month
  // Walk back from ref to day 1
  let startGreg = ref.subtract(refHijri.day - 1, 'day')
  // Verify (in case of off-by-one at month boundary)
  for (let adj = -2; adj <= 2; adj++) {
    const candidate = startGreg.add(adj, 'day')
    const h = toHijri(candidate.toDate())
    if (h.day === 1 && h.month === targetMonth && h.year === targetYear) {
      startGreg = candidate
      break
    }
  }

  const cells = []
  for (let i = 0; i < 32; i++) {
    const greg = startGreg.add(i, 'day')
    const h = toHijri(greg.toDate())
    if (h.month !== targetMonth || h.year !== targetYear) break

    const gregStr = greg.format('YYYY-MM-DD')
    const dayOfWeek = greg.day() // 0=Sun … 6=Sat

    cells.push({
      hijriDay: h.day,
      hijriYear: h.year,
      monthNameId: h.monthNameId,
      monthNameAr: h.monthNameAr,
      gregorianDay: greg.date(),
      gregorianFull: greg.locale('id').format('dddd, D MMMM YYYY'),
      gregorianStr: gregStr,
      isToday: gregStr === todayStr,
      isFriday: dayOfWeek === 5,
      isSunday: dayOfWeek === 0,
      isSenin: dayOfWeek === 1,
      isKamis: dayOfWeek === 4,
      isAyyamulBidh: [13, 14, 15].includes(h.day),
      isArafah: h.month === 12 && h.day === 9,
      dayOfWeek,
    })
  }
  return cells
}

const calendarCells = computed(() => buildCalendarCells(referenceDate.value))

// Offset for first cell (day of week of hijri day 1)
const firstDayOffset = computed(() => calendarCells.value[0]?.dayOfWeek ?? 0)

// Stats
const ayyamulBidhCount = computed(() => calendarCells.value.filter((c) => c.isAyyamulBidh).length)
const fridayCount = computed(() => calendarCells.value.filter((c) => c.isFriday).length)

// Gregorian month label for header
const gregorianMonthLabelHeader = computed(() => {
  if (!calendarCells.value.length) return ''
  const first = calendarCells.value[0].gregorianFull
  return first
})

// ── Navigation ─────────────────────────────────────────────
function prevMonth() {
  // Move back ~30 days and land in previous Hijri month
  const newRef = referenceDate.value.subtract(30, 'day')
  const h = toHijri(newRef.toDate())
  // Adjust to middle of that month
  referenceDate.value = newRef.subtract(h.day - 15, 'day')
}

function nextMonth() {
  const newRef = referenceDate.value.add(30, 'day')
  const h = toHijri(newRef.toDate())
  referenceDate.value = newRef.subtract(h.day - 15, 'day')
}

function goToToday() {
  referenceDate.value = dayjs()
  selectedCell.value = todayCell.value
}

// ── Selected day ────────────────────────────────────────────
const todayCell = computed(() => calendarCells.value.find((c) => c.isToday) ?? null)
const selectedCell = ref(null)

// auto-select today on load if in current month
import { onMounted } from 'vue'
onMounted(() => {
  selectedCell.value = todayCell.value
})

function selectDay(cell) {
  selectedCell.value = cell
}

function dayCellClass(cell) {
  if (cell.isToday) {
    return 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-md shadow-rose-300/50 scale-105'
  }
  if (cell.isAyyamulBidh) {
    return 'bg-amber-50 ring-1 ring-amber-200'
  }
  if (cell.isArafah) {
    return 'bg-green-50 ring-1 ring-green-200'
  }
  if (cell.isFriday || cell.isSunday) {
    return 'bg-rose-50/60'
  }
  return 'hover:bg-slate-50'
}

// ── Upcoming events ──────────────────────────────────────────
const upcomingEvents = computed(() => {
  const today = dayjs()
  const events = []

  // Ayyamul Bidh in this month
  const bidhDays = calendarCells.value.filter((c) => c.isAyyamulBidh)
  if (bidhDays.length) {
    const first = bidhDays[0]
    const daysLeft = dayjs(first.gregorianStr).diff(today, 'day')
    events.push({
      key: 'ayyamul_bidh',
      emoji: '🌕',
      label: 'Ayyamul Bidh',
      dateLabel: `${first.hijriDay}–${bidhDays[bidhDays.length - 1].hijriDay} ${currentHijriMonthId.value} ${currentHijriYear.value} H`,
      bgClass: 'bg-amber-100',
      isToday: bidhDays.some((c) => c.isToday),
      daysLeft: Math.max(0, daysLeft),
    })
  }

  // Arafah
  const arafahDay = calendarCells.value.find((c) => c.isArafah)
  if (arafahDay) {
    const daysLeft = dayjs(arafahDay.gregorianStr).diff(today, 'day')
    events.push({
      key: 'arafah',
      emoji: '🤲',
      label: 'Hari Arafah',
      dateLabel: `9 Dzulhijjah ${arafahDay.hijriYear} H — ${arafahDay.gregorianFull}`,
      bgClass: 'bg-green-100',
      isToday: arafahDay.isToday,
      daysLeft: Math.max(0, daysLeft),
    })
  }

  // Fridays in this month
  const fridays = calendarCells.value.filter((c) => c.isFriday)
  fridays.forEach((f, idx) => {
    const daysLeft = dayjs(f.gregorianStr).diff(today, 'day')
    if (daysLeft >= 0 || f.isToday) {
      events.push({
        key: `friday_${idx}`,
        emoji: '🕌',
        label: `Jumat, ${f.gregorianFull.split(',')[1]?.trim() ?? ''}`,
        dateLabel: `${f.hijriDay} ${currentHijriMonthId.value} ${currentHijriYear.value} H`,
        bgClass: 'bg-rose-100',
        isToday: f.isToday,
        daysLeft: Math.max(0, daysLeft),
      })
    }
  })

  return events.sort((a, b) => a.daysLeft - b.daysLeft)
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
