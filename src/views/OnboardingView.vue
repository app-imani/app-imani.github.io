<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 flex flex-col">
    <!-- Progress bar -->
    <div class="h-1 bg-slate-200">
      <div
        class="h-full bg-primary-500 transition-all duration-500 ease-out"
        :style="{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }"
      />
    </div>

    <!-- Step counter -->
    <div class="flex justify-between items-center px-5 pt-5">
      <button
        v-if="step > 0"
        @click="step--"
        class="flex items-center gap-1 text-sm text-slate-500 active:opacity-70"
      >
        <ChevronLeft :size="18" />
        Kembali
      </button>
      <div v-else class="w-16" />
      <span class="text-xs text-slate-400 font-medium">{{ step + 1 }} / {{ TOTAL_STEPS }}</span>
    </div>

    <!-- Step content -->
    <div class="flex-1 flex flex-col px-6 pt-6 pb-10">
      <Transition :name="transitionName" mode="out-in">

        <!-- Step 0: Salam & Nama -->
        <div v-if="step === 0" key="s0" class="flex flex-col flex-1">
          <div class="mb-8 text-center">
            <div class="text-5xl mb-4">🌙</div>
            <h1 class="text-2xl font-bold text-slate-800">Assalamu'alaikum!</h1>
            <p class="text-slate-500 mt-2 text-sm leading-relaxed">
              Selamat datang di <span class="font-semibold text-primary-600">Imani</span> — teman harianmu untuk ibadah, puasa & siklus.
            </p>
          </div>
          <label class="block mb-2 text-sm font-medium text-slate-700">Siapa namamu? 😊</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Nama panggilanmu..."
            maxlength="30"
            class="input-base"
            @keyup.enter="nextStep"
          />
          <p class="text-xs text-slate-400 mt-2">Nama hanya tersimpan di perangkatmu.</p>
        </div>

        <!-- Step 1: Lokasi -->
        <div v-else-if="step === 1" key="s1" class="flex flex-col flex-1">
          <div class="mb-8">
            <div class="text-4xl mb-3">📍</div>
            <h2 class="text-xl font-bold text-slate-800">Kota domisili</h2>
            <p class="text-slate-500 text-sm mt-1">Untuk jadwal sholat & puasa yang akurat.</p>
          </div>
          <label class="block mb-2 text-sm font-medium text-slate-700">Nama kota</label>
          <input
            v-model="form.city"
            type="text"
            placeholder="Contoh: Jakarta, Surabaya..."
            class="input-base"
          />
          <label class="block mt-4 mb-2 text-sm font-medium text-slate-700">Negara</label>
          <input
            v-model="form.country"
            type="text"
            placeholder="Indonesia"
            class="input-base"
          />

          <button
            @click="detectLocation"
            :disabled="geoLoading"
            class="mt-4 flex items-center gap-2 text-sm text-primary-600 font-medium active:opacity-70 disabled:opacity-40"
          >
            <MapPin :size="16" />
            {{ geoLoading ? 'Mendeteksi...' : 'Gunakan lokasi saat ini' }}
          </button>
        </div>

        <!-- Step 2: Info Siklus (opsional) -->
        <div v-else-if="step === 2" key="s2" class="flex flex-col flex-1">
          <div class="mb-6">
            <div class="text-4xl mb-3">🌸</div>
            <h2 class="text-xl font-bold text-slate-800">Info siklus awal</h2>
            <p class="text-slate-500 text-sm mt-1">
              Opsional — bantu prediksi siklus lebih akurat. Bisa diisi nanti.
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block mb-1.5 text-sm font-medium text-slate-700">
                Rata-rata panjang siklus (hari)
              </label>
              <div class="flex items-center gap-3">
                <button @click="form.avgCycle = Math.max(21, form.avgCycle - 1)" class="btn-stepper">−</button>
                <span class="text-2xl font-bold text-primary-600 w-10 text-center">{{ form.avgCycle }}</span>
                <button @click="form.avgCycle = Math.min(45, form.avgCycle + 1)" class="btn-stepper">+</button>
              </div>
              <p class="text-xs text-slate-400 mt-1">Normal: 21–35 hari</p>
            </div>

            <div>
              <label class="block mb-1.5 text-sm font-medium text-slate-700">
                Rata-rata durasi haid (hari)
              </label>
              <div class="flex items-center gap-3">
                <button @click="form.avgPeriod = Math.max(1, form.avgPeriod - 1)" class="btn-stepper">−</button>
                <span class="text-2xl font-bold text-rose-500 w-10 text-center">{{ form.avgPeriod }}</span>
                <button @click="form.avgPeriod = Math.min(15, form.avgPeriod + 1)" class="btn-stepper">+</button>
              </div>
            </div>

            <div>
              <label class="block mb-1.5 text-sm font-medium text-slate-700">
                Mulai haid terakhir
              </label>
              <input
                v-model="form.lastPeriodDate"
                type="date"
                class="input-base"
                :max="todayStr"
              />
            </div>
          </div>
        </div>

        <!-- Step 3: Notifikasi -->
        <div v-else-if="step === 3" key="s3" class="flex flex-col flex-1">
          <div class="mb-8">
            <div class="text-4xl mb-3">🔔</div>
            <h2 class="text-xl font-bold text-slate-800">Pengingat ibadah</h2>
            <p class="text-slate-500 text-sm mt-1">Aktifkan untuk reminder sholat & amalan harian.</p>
          </div>

          <div class="space-y-3">
            <ToggleRow
              v-model="form.notifPrayer"
              label="Pengingat Sholat"
              desc="Notifikasi 5 menit sebelum waktu sholat"
              emoji="🕌"
            />
            <ToggleRow
              v-model="form.notifAmal"
              label="Dzikir Pagi & Petang"
              desc="Reminder setelah Subuh & Ashar"
              emoji="📿"
            />
            <ToggleRow
              v-model="form.notifFasting"
              label="Pengingat Puasa Sunnah"
              desc="Notifikasi hari puasa Senin-Kamis & Ayyamul Bidh"
              emoji="🌙"
            />
          </div>

          <p class="text-xs text-slate-400 mt-5 leading-relaxed">
            Notifikasi memerlukan izin browser. Kamu bisa mengubah pengaturan kapan saja.
          </p>
        </div>

      </Transition>
    </div>

    <!-- CTA button -->
    <div class="px-6 pb-10">
      <button
        @click="nextStep"
        :disabled="!canProceed"
        class="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-200 active:scale-95
               bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {{ step < TOTAL_STEPS - 1 ? 'Lanjut →' : '✨ Mulai Perjalanan Ibadah' }}
      </button>
      <button
        v-if="step === 2"
        @click="nextStep"
        class="w-full mt-3 text-sm text-slate-400 active:opacity-70"
      >
        Lewati untuk sekarang
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, MapPin } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useGeolocation } from '@/composables/useGeolocation'
import { useCycleStore } from '@/stores/cycle'
import dayjs from 'dayjs'

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const cycleStore = useCycleStore()
const { getLocation } = useGeolocation()

const TOTAL_STEPS = 4
const step = ref(0)
const transitionName = ref('slide-left')
const geoLoading = ref(false)

const todayStr = dayjs().format('YYYY-MM-DD')

const form = ref({
  name: '',
  city: '',
  country: 'Indonesia',
  avgCycle: 28,
  avgPeriod: 6,
  lastPeriodDate: '',
  notifPrayer: true,
  notifAmal: true,
  notifFasting: false,
})

const canProceed = computed(() => {
  if (step.value === 0) return form.value.name.trim().length >= 2
  if (step.value === 1) return form.value.city.trim().length >= 2
  return true
})

async function detectLocation() {
  geoLoading.value = true
  try {
    const loc = await getLocation()
    if (loc) {
      form.value.city = loc.city || ''
      form.value.country = loc.country || 'Indonesia'
    }
  } catch (e) {
    //
  } finally {
    geoLoading.value = false
  }
}

async function nextStep() {
  if (!canProceed.value) return
  if (step.value < TOTAL_STEPS - 1) {
    transitionName.value = 'slide-left'
    step.value++
  } else {
    await finishOnboarding()
  }
}

async function finishOnboarding() {
  // Save settings
  settingsStore.displayName = form.value.name.trim()
  settingsStore.city = form.value.city.trim()
  settingsStore.country = form.value.country.trim()
  settingsStore.notifPrayer = form.value.notifPrayer
  settingsStore.notifAmal = form.value.notifAmal
  settingsStore.notifFasting = form.value.notifFasting

  // Save initial cycle info
  if (form.value.lastPeriodDate) {
    cycleStore.initialAvgCycle = form.value.avgCycle
    cycleStore.initialAvgPeriod = form.value.avgPeriod
    cycleStore.lastPeriodDate = form.value.lastPeriodDate
  }
  cycleStore.saveToStorage()

  // Persist all settings to localStorage
  settingsStore.save()
  settingsStore.setOnboarded(true)

  // Mark onboarding done in auth store (needed for router guard)
  authStore.setOnboardingDone()

  // Request notification permission if any notif enabled
  if (form.value.notifPrayer || form.value.notifAmal || form.value.notifFasting) {
    try { await Notification.requestPermission() } catch (e) { /* */ }
  }

  router.replace('/')
}

// ToggleRow inline component
const ToggleRow = {
  props: ['modelValue', 'label', 'desc', 'emoji'],
  emits: ['update:modelValue'],
  template: `
    <div class="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100">
      <span class="text-xl mt-0.5">{{ emoji }}</span>
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-800">{{ label }}</p>
        <p class="text-xs text-slate-400 mt-0.5">{{ desc }}</p>
      </div>
      <button
        @click="$emit('update:modelValue', !modelValue)"
        :class="modelValue ? 'bg-primary-500' : 'bg-slate-200'"
        class="relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5"
      >
        <span
          :class="modelValue ? 'translate-x-5' : 'translate-x-0.5'"
          class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform"
        />
      </button>
    </div>
  `,
}
</script>

<style scoped>
.input-base {
  @apply w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800
         text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all;
}
.btn-stepper {
  @apply w-10 h-10 rounded-xl border-2 border-slate-200 text-lg font-bold text-slate-600
         flex items-center justify-center active:scale-90 transition-transform;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}
.slide-left-enter-from { opacity: 0; transform: translateX(30px); }
.slide-left-leave-to   { opacity: 0; transform: translateX(-30px); }
</style>
