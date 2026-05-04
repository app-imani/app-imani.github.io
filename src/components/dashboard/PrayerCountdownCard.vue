<template>
  <!-- Countdown card ke sholat berikutnya -->
  <div class="card relative overflow-hidden" :class="isHaidActive ? 'border-haid-200 bg-haid-50' : 'border-primary-100 bg-gradient-to-br from-primary-50 to-white'">
    <!-- Background pattern -->
    <div class="absolute top-0 right-0 opacity-5 pointer-events-none">
      <Building2 :size="120" />
    </div>

    <div class="relative z-10">
      <!-- Nama sholat berikutnya -->
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Waktu Sholat Berikutnya</p>
          <h3 class="text-xl font-bold" :class="isHaidActive ? 'text-haid-600' : 'text-primary-700'">
            {{ nextPrayer?.name || '—' }}
          </h3>
        </div>
        <div class="text-right">
          <p class="text-sm text-slate-400">{{ nextPrayer?.time || '—' }}</p>
          <p class="text-xs text-slate-300">{{ todayDate }}</p>
        </div>
      </div>

      <!-- Countdown timer -->
      <div v-if="secondsLeft !== null" class="flex items-center gap-2">
        <div class="flex gap-1.5">
          <TimeUnit :value="hours" label="Jam" />
          <span class="text-xl font-bold text-slate-300 self-center">:</span>
          <TimeUnit :value="minutes" label="Mnt" />
          <span class="text-xl font-bold text-slate-300 self-center">:</span>
          <TimeUnit :value="secs" label="Dtk" />
        </div>
        <span class="text-xs text-slate-400 ml-1">lagi</span>
      </div>

      <div v-else class="text-sm text-slate-400">
        Memuat jadwal sholat...
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="mt-2">
        <div class="skeleton h-8 w-40 rounded-lg" />
      </div>

      <!-- Error / tidak ada lokasi -->
      <div v-if="error" class="mt-2 text-xs text-rose-500 flex items-center gap-1">
        <AlertCircle :size="12" />
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Building2, AlertCircle } from 'lucide-vue-next'
import { usePrayerTimes } from '@/composables/usePrayerTimes'
import { useCycleStore } from '@/stores/cycle'
import { useSettingsStore } from '@/stores/settings'
import dayjs from 'dayjs'

// Sub-komponen TimeUnit
const TimeUnit = {
  props: ['value', 'label'],
  template: `
    <div class="flex flex-col items-center">
      <span class="text-2xl font-bold leading-none tabular-nums text-slate-800">{{ String(value).padStart(2, '0') }}</span>
      <span class="text-[9px] text-slate-400 uppercase tracking-wide">{{ label }}</span>
    </div>
  `,
}

const cycleStore = useCycleStore()
const settingsStore = useSettingsStore()
const { prayerTimes, isLoading, error, fetchByCoords, fetchByCity, getNextPrayer } = usePrayerTimes()

const isHaidActive = computed(() => cycleStore.isHaidActive)
const todayDate = computed(() => dayjs().format('ddd, D MMM'))

const nextPrayer = ref(null)
const secondsLeft = ref(null)

const hours = computed(() => Math.floor((secondsLeft.value || 0) / 3600))
const minutes = computed(() => Math.floor(((secondsLeft.value || 0) % 3600) / 60))
const secs = computed(() => (secondsLeft.value || 0) % 60)

let countdownInterval = null

onMounted(async () => {
  // Fetch jadwal sholat
  const loc = settingsStore.location
  if (loc?.latitude && loc?.longitude) {
    await fetchByCoords(loc.latitude, loc.longitude)
  } else if (loc?.city) {
    await fetchByCity(loc.city)
  }

  if (prayerTimes.value) {
    startCountdown()
  }
})

onUnmounted(() => {
  clearInterval(countdownInterval)
})

function startCountdown() {
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
}

function updateCountdown() {
  if (!prayerTimes.value) return
  const next = getNextPrayer(prayerTimes.value)
  nextPrayer.value = next
  secondsLeft.value = next?.secondsLeft || null
}
</script>
