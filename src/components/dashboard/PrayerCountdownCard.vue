<template>
  <div
    class="card relative overflow-hidden px-5 py-5 md:px-6"
    :class="isHaidActive
      ? 'border-haid-200 bg-gradient-to-br from-haid-50 via-white to-haid-50/70 shadow-[0_16px_40px_-24px_rgba(244,63,94,0.55)]'
      : 'border-primary-100 bg-gradient-to-br from-primary-50 via-white to-emerald-50/60 shadow-[0_18px_45px_-26px_rgba(5,150,105,0.45)]'"
  >
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-16 -right-10 h-40 w-40 rounded-full blur-3xl opacity-40"
        :class="isHaidActive ? 'bg-haid-200/80' : 'bg-primary-200/70'"
      />
      <div class="absolute bottom-3 right-3 opacity-[0.06]">
        <Building2 :size="126" />
      </div>
    </div>

    <div class="relative z-10 text-center">
      <div class="flex items-center justify-center gap-2 mb-2">
        <span
          class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
          :class="isHaidActive ? 'bg-haid-100 text-haid-700' : 'bg-primary-100 text-primary-700'"
        >
          Waktu Sholat Berikutnya
        </span>
      </div>

      <h3 class="text-3xl font-extrabold tracking-tight" :class="isHaidActive ? 'text-haid-700' : 'text-primary-700'">
        {{ nextPrayer?.name || '—' }}
      </h3>
      <p class="mt-1 text-sm text-slate-500">
        Pukul <span class="font-semibold text-slate-700">{{ nextPrayer?.time || '—' }}</span> · {{ todayDate }}
      </p>

      <div v-if="secondsLeft !== null" class="mt-5">
        <div class="flex items-center justify-center gap-2 sm:gap-3">
          <div class="time-box">
            <span class="time-value">{{ formattedHours }}</span>
            <span class="time-label">Jam</span>
          </div>

          <span class="time-separator">:</span>

          <div class="time-box">
            <span class="time-value">{{ formattedMinutes }}</span>
            <span class="time-label">Menit</span>
          </div>

          <span class="time-separator">:</span>

          <div class="time-box time-box-seconds">
            <transition name="tick" mode="out-in">
              <span :key="secs" class="time-value seconds-value">{{ formattedSeconds }}</span>
            </transition>
            <span class="time-label">Detik</span>
          </div>
        </div>

        <p class="mt-3 text-sm font-medium text-slate-500">
          <span class="font-semibold" :class="isHaidActive ? 'text-haid-600' : 'text-primary-600'">{{ nextPrayer?.name || 'Waktu sholat' }}</span>
          akan tiba sebentar lagi
        </p>
      </div>

      <div v-else class="mt-5 text-sm text-slate-400">
        Memuat jadwal sholat...
      </div>

      <div class="mt-5 grid grid-cols-2 gap-2 text-left">
        <div class="rounded-2xl border border-white/70 bg-white/75 backdrop-blur px-3.5 py-3 shadow-sm">
          <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</p>
          <p class="mt-1 text-sm font-bold text-slate-700">{{ isHaidActive ? 'Mode Haid Aktif' : 'Masa Suci  ✨' }}</p>
        </div>
        <div class="rounded-2xl border border-white/70 bg-white/75 backdrop-blur px-3.5 py-3 shadow-sm">
          <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Hitung Mundur</p>
          <p class="mt-1 text-sm font-bold text-slate-700 tabular-nums">{{ compactCountdown }}</p>
        </div>
      </div>

      <div v-if="isLoading" class="mt-4 flex justify-center">
        <div class="skeleton h-9 w-44 rounded-2xl" />
      </div>

      <div v-if="error" class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs text-rose-500">
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
const formattedHours = computed(() => String(hours.value).padStart(2, '0'))
const formattedMinutes = computed(() => String(minutes.value).padStart(2, '0'))
const formattedSeconds = computed(() => String(secs.value).padStart(2, '0'))
const compactCountdown = computed(() => `${formattedHours.value}:${formattedMinutes.value}:${formattedSeconds.value}`)

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

<style scoped>
.time-box {
  @apply min-w-[78px] rounded-[1.4rem] border border-white/80 bg-white/85 px-3 py-3 shadow-sm backdrop-blur;
}

.time-box-seconds {
  @apply ring-2 ring-primary-100/80 shadow-[0_10px_24px_-16px_rgba(5,150,105,0.5)];
}

.time-value {
  @apply block text-center text-[2rem] sm:text-[2.4rem] font-extrabold leading-none tabular-nums tracking-tight text-slate-800;
}

.seconds-value {
  @apply text-primary-600;
}

.time-label {
  @apply mt-1.5 block text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400;
}

.time-separator {
  @apply text-2xl sm:text-3xl font-bold text-slate-300 self-center -mt-5;
}

.tick-enter-active,
.tick-leave-active {
  transition: all 180ms ease;
}

.tick-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}

.tick-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(1.06);
}
</style>
