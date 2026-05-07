<template>
  <div>
    <!-- Month navigation (hidden if controlled by parent) -->
    <div v-if="!controlled" class="flex items-center justify-between mb-4 px-1">
      <button @click="prevMonth" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform">
        <ChevronLeft :size="16" class="text-slate-500" />
      </button>
      <p class="text-sm font-bold text-slate-700">{{ monthLabel }}</p>
      <button @click="nextMonth" :disabled="isCurrentMonth" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30">
        <ChevronRight :size="16" class="text-slate-500" />
      </button>
    </div>

    <!-- Day headers -->
    <div class="grid grid-cols-7 mb-1.5">
      <div v-for="d in DAY_LABELS" :key="d" class="text-center text-[10px] font-bold text-slate-400">{{ d }}</div>
    </div>

    <!-- Heatmap grid -->
    <div class="grid grid-cols-7 gap-1">
      <div v-for="n in leadingBlanks" :key="'b'+n" />
      <button
        v-for="day in monthData"
        :key="day.date"
        @click="selectedDay = selectedDay === day.date ? null : day.date"
        class="aspect-square rounded-lg flex items-center justify-center relative transition-all active:scale-90"
        :class="dayClass(day)"
      >
        <span class="text-[11px] font-semibold" :class="dayTextClass(day)">{{ day.day }}</span>
        <span v-if="day.isUdzur" class="absolute bottom-0.5 right-0.5 text-[7px] leading-none">🌸</span>
        <span v-if="day.isToday" class="absolute inset-0 rounded-lg ring-2 ring-rose-400 pointer-events-none" />
      </button>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-3 mt-4 flex-wrap">
      <span class="text-[10px] text-slate-400 font-medium">Level:</span>
      <div v-for="l in LEGEND" :key="l.label" class="flex items-center gap-1">
        <div class="w-4 h-4 rounded-md" :class="l.bg" />
        <span class="text-[10px] text-slate-500">{{ l.label }}</span>
      </div>
    </div>

    <!-- Selected day detail -->
    <Transition name="slide-up">
      <div v-if="selectedDayDetail" class="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-bold text-slate-700">{{ formatSelectedDate }}</p>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full"
            :class="selectedDayDetail.isUdzur ? 'bg-pink-100 text-pink-600' : selectedDayDetail.level >= 3 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'">
            {{ selectedDayDetail.isUdzur ? '🌸 Udzur' : selectedDayDetail.level >= 3 ? '⭐ Aktif' : selectedDayDetail.level > 0 ? '✅ Partial' : '—' }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="text-center bg-amber-50 rounded-xl p-2.5">
            <p class="text-lg font-black text-amber-500">{{ selectedDayDetail.pagiCount }}</p>
            <p class="text-[10px] text-amber-600 font-medium">Pagi</p>
          </div>
          <div class="text-center bg-indigo-50 rounded-xl p-2.5">
            <p class="text-lg font-black text-indigo-500">{{ selectedDayDetail.petangCount }}</p>
            <p class="text-[10px] text-indigo-600 font-medium">Petang</p>
          </div>
          <div class="text-center bg-emerald-50 rounded-xl p-2.5">
            <p class="text-lg font-black text-emerald-500">{{ selectedDayDetail.sunnahCount }}</p>
            <p class="text-[10px] text-emerald-600 font-medium">Sunnah</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'

const props = defineProps({
  // Optional: parent passes 1-indexed month/year to control the heatmap
  year: { type: Number, default: null },
  month: { type: Number, default: null },
})

const amalStore = useAmalStore()

const DAY_LABELS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
const LEGEND = [
  { label: 'Kosong', bg: 'bg-slate-100' },
  { label: 'Sedikit', bg: 'bg-rose-100' },
  { label: 'Cukup', bg: 'bg-rose-300' },
  { label: 'Lengkap', bg: 'bg-rose-500' },
]

const now = new Date()
// viewMonth is 1-indexed (Jan=1) to match getMonthHeatmap's expectation
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth() + 1)
const selectedDay = ref(null)

const controlled = computed(() => props.year !== null && props.month !== null)
const activeYear = computed(() => controlled.value ? props.year : viewYear.value)
const activeMonth = computed(() => controlled.value ? props.month : viewMonth.value)

watch(() => [props.year, props.month], ([y, m]) => {
  if (y !== null && m !== null) { viewYear.value = y; viewMonth.value = m; selectedDay.value = null }
})

const isCurrentMonth = computed(() =>
  activeYear.value === now.getFullYear() && activeMonth.value === now.getMonth() + 1
)

function prevMonth() {
  if (controlled.value) return
  if (viewMonth.value === 1) { viewMonth.value = 12; viewYear.value-- }
  else viewMonth.value--
  selectedDay.value = null
}
function nextMonth() {
  if (controlled.value || isCurrentMonth.value) return
  if (viewMonth.value === 12) { viewMonth.value = 1; viewYear.value++ }
  else viewMonth.value++
  selectedDay.value = null
}

// activeMonth is 1-indexed → JS Date constructor uses 0-indexed → subtract 1
const monthLabel = computed(() =>
  new Date(activeYear.value, activeMonth.value - 1, 1)
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
)
const monthData = computed(() => amalStore.getMonthHeatmap(activeYear.value, activeMonth.value))
const leadingBlanks = computed(() => new Date(activeYear.value, activeMonth.value - 1, 1).getDay())

function dayClass(day) {
  if (day.isToday && !day.hasData) return 'bg-rose-50'
  if (!day.hasData) return 'bg-slate-100'
  if (day.isUdzur) return 'bg-pink-200'
  const l = day.level
  if (l <= 1) return 'bg-rose-100'
  if (l === 2) return 'bg-rose-100'
  if (l === 3) return 'bg-rose-300'
  return 'bg-rose-500'
}

function dayTextClass(day) {
  if (day.isToday) return 'text-rose-600 font-black'
  if (!day.hasData) return 'text-slate-400'
  return day.level >= 3 ? 'text-white' : 'text-slate-600'
}

const selectedDayDetail = computed(() => {
  if (!selectedDay.value) return null
  return monthData.value.find(d => d.date === selectedDay.value) || null
})
const formatSelectedDate = computed(() => {
  if (!selectedDay.value) return ''
  return new Date(selectedDay.value + 'T12:00:00')
    .toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
})
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
