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
          <div class="mb-6 text-center">
            <!-- Animated illustration: welcome moon -->
            <div class="relative mx-auto mb-4 w-44 h-44 flex items-center justify-center">
              <!-- Outer orbit ring -->
              <div class="absolute inset-0 rounded-full border-2 border-dashed border-primary-200/60 anim-spin-slow" />
              <!-- Glow bg -->
              <div class="absolute inset-4 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 anim-pulse-soft" />
              <!-- Moon -->
              <svg class="relative z-10 w-20 h-20 anim-float" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="32" fill="#d1fae5"/>
                <path d="M50 20 C38 20 28 30 28 42 C28 56 40 66 54 64 C42 62 34 54 34 42 C34 30 41 22 52 20 C51.3 20 50.7 20 50 20Z" fill="#059669" opacity="0.85"/>
              </svg>
              <!-- Orbiting star 1 -->
              <div class="absolute top-3 right-6 w-4 h-4 anim-orbit-a">
                <svg viewBox="0 0 20 20" fill="none"><polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="#fbbf24"/></svg>
              </div>
              <!-- Orbiting dot 2 -->
              <div class="absolute bottom-5 left-4 w-3 h-3 rounded-full bg-violet-400/70 anim-orbit-b" />
              <!-- Sparkle dot -->
              <div class="absolute top-7 left-9 w-2 h-2 rounded-full bg-emerald-400 anim-twinkle" />
            </div>
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
          <div class="mb-6">
            <!-- Animated illustration: location pin with pulse rings -->
            <div class="relative mx-auto mb-4 w-44 h-44 flex items-center justify-center">
              <!-- Pulse rings -->
              <div class="absolute w-28 h-28 rounded-full border-2 border-blue-300/50 anim-ping-slow" />
              <div class="absolute w-20 h-20 rounded-full border-2 border-blue-300/70 anim-ping-slow" style="animation-delay:0.4s" />
              <!-- Base circle -->
              <div class="absolute inset-6 rounded-full bg-gradient-to-br from-blue-100 to-sky-100" />
              <!-- Pin SVG -->
              <svg class="relative z-10 w-16 h-16" :class="geoLoading ? 'anim-pulse-soft' : 'anim-bounce-gentle'" viewBox="0 0 64 64" fill="none">
                <path d="M32 6C21 6 12 15 12 26C12 41 32 58 32 58C32 58 52 41 52 26C52 15 43 6 32 6Z" :fill="geoSuccess ? '#22c55e' : '#3b82f6'"/>
                <circle cx="32" cy="26" r="8" fill="white"/>
                <circle cx="32" cy="26" r="4" :fill="geoSuccess ? '#22c55e' : '#3b82f6'"/>
              </svg>
              <!-- Floating dots -->
              <div class="absolute top-4 left-8 w-2.5 h-2.5 rounded-full bg-sky-400 anim-float" style="animation-delay:0.3s"/>
              <div class="absolute bottom-7 right-7 w-2 h-2 rounded-full bg-blue-300 anim-float" style="animation-delay:0.7s"/>
              <!-- Success checkmark -->
              <Transition name="pop">
                <div v-if="geoSuccess" class="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 16 16" class="w-4 h-4" fill="none"><path d="M3 8 L6.5 11.5 L13 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </Transition>
            </div>
            <h2 class="text-xl font-bold text-slate-800">Kota domisili</h2>
            <p class="text-slate-500 text-sm mt-1">Untuk jadwal sholat & puasa yang akurat.</p>
          </div>

          <!-- GPS detect button -->
          <button
            @click="detectLocation"
            :disabled="geoLoading"
            class="mb-2 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
            :class="geoSuccess
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-primary-50 text-primary-700 border border-primary-200'"
          >
            <span v-if="geoLoading" class="flex gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-500 dot-bounce" style="animation-delay:0ms"/>
              <span class="w-1.5 h-1.5 rounded-full bg-primary-500 dot-bounce" style="animation-delay:150ms"/>
              <span class="w-1.5 h-1.5 rounded-full bg-primary-500 dot-bounce" style="animation-delay:300ms"/>
            </span>
            <MapPin v-else :size="16" />
            {{ geoLoading ? 'Mendeteksi lokasi...' : geoSuccess ? '✓ Lokasi terdeteksi' : 'Gunakan lokasi GPS saat ini' }}
          </button>

          <!-- Accuracy badge -->
          <Transition name="fade-slide">
            <div v-if="geoSuccess && geoAccuracy" class="mb-3 flex items-center justify-center gap-1.5">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                :class="geoAccuracy <= 50 ? 'bg-green-100 text-green-700' : geoAccuracy <= 200 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'">
                <span class="w-1.5 h-1.5 rounded-full"
                  :class="geoAccuracy <= 50 ? 'bg-green-500' : geoAccuracy <= 200 ? 'bg-amber-500' : 'bg-slate-400'"/>
                Akurasi ±{{ geoAccuracy }} m
                {{ geoAccuracy <= 50 ? '· Sangat akurat' : geoAccuracy <= 200 ? '· Cukup akurat' : '· Akurasi rendah' }}
              </span>
            </div>
          </Transition>

          <!-- Geo error -->
          <Transition name="shake">
            <div v-if="geoError" class="mb-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-2">
              <span>⚠️</span> {{ geoError }}
            </div>
          </Transition>

          <!-- Separator -->
          <div class="flex items-center gap-2 mb-3">
            <div class="flex-1 h-px bg-slate-200"/>
            <span class="text-xs text-slate-400 font-medium">atau ketik / pilih dari daftar</span>
            <div class="flex-1 h-px bg-slate-200"/>
          </div>

          <!-- Searchable city picker -->
          <label class="block mb-1.5 text-sm font-medium text-slate-700">Nama kota</label>
          <div class="relative" ref="cityPickerRef">
            <input
              v-model="citySearch"
              @input="showCityDropdown = true"
              @focus="showCityDropdown = citySearch.length >= 1"
              @blur="hideCityDropdownDelayed"
              type="text"
              placeholder="Ketik nama kota..."
              class="input-base pr-10"
              :class="showCityHint ? 'ring-2 ring-primary-300 border-primary-400' : ''"
              autocomplete="off"
            />
            <span v-if="citySearch" @click="clearCity" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer active:text-slate-500 text-lg leading-none select-none">×</span>

            <!-- Dropdown list -->
            <Transition name="dropdown">
              <div
                v-if="showCityDropdown && filteredCities.length > 0"
                class="absolute z-30 top-full mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-52 overflow-y-auto"
              >
                <button
                  v-for="c in filteredCities"
                  :key="c.city"
                  @mousedown.prevent="selectCity(c)"
                  class="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 active:bg-primary-100 border-b border-slate-50 last:border-0 flex items-center justify-between"
                >
                  <span class="font-medium">{{ c.city }}</span>
                  <span class="text-[11px] text-slate-400 ml-2 shrink-0">{{ c.province }}</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Animated hint: GPS got coords but city unknown -->
          <Transition name="fade-slide">
            <div v-if="showCityHint" class="mt-3 p-3 rounded-2xl bg-primary-50 border border-primary-100 flex items-center gap-3">
              <span class="text-2xl anim-bounce-gentle shrink-0">👆</span>
              <div>
                <p class="text-xs font-semibold text-primary-700">Koordinat GPS berhasil!</p>
                <p class="text-xs text-primary-600 mt-0.5">Nama kota tidak terdeteksi otomatis. Pilih kotamu dari daftar di atas.</p>
              </div>
            </div>
          </Transition>

          <label class="block mt-4 mb-1.5 text-sm font-medium text-slate-700">Negara</label>
          <input
            v-model="form.country"
            type="text"
            placeholder="Indonesia"
            class="input-base"
          />
        </div>

        <!-- Step 2: Info Siklus (opsional) -->
        <div v-else-if="step === 2" key="s2" class="flex flex-col flex-1">
          <div class="mb-6">
            <!-- Animated illustration: flower cycle -->
            <div class="relative mx-auto mb-4 w-44 h-44 flex items-center justify-center">
              <!-- Rotating ring -->
              <div class="absolute inset-2 rounded-full border-4 border-dashed border-rose-200/70 anim-spin-slow" />
              <!-- Glow bg -->
              <div class="absolute inset-8 rounded-full bg-gradient-to-br from-rose-100 to-pink-50 anim-pulse-soft" />
              <!-- Flower petals spinning -->
              <svg class="absolute inset-0 w-full h-full anim-spin-reverse-slow" viewBox="0 0 176 176" fill="none">
                <ellipse cx="88" cy="50" rx="12" ry="22" fill="#fda4af" opacity="0.5" transform="rotate(0 88 88)"/>
                <ellipse cx="88" cy="50" rx="12" ry="22" fill="#fda4af" opacity="0.5" transform="rotate(60 88 88)"/>
                <ellipse cx="88" cy="50" rx="12" ry="22" fill="#fda4af" opacity="0.5" transform="rotate(120 88 88)"/>
                <ellipse cx="88" cy="50" rx="12" ry="22" fill="#fda4af" opacity="0.5" transform="rotate(180 88 88)"/>
                <ellipse cx="88" cy="50" rx="12" ry="22" fill="#fda4af" opacity="0.5" transform="rotate(240 88 88)"/>
                <ellipse cx="88" cy="50" rx="12" ry="22" fill="#fda4af" opacity="0.5" transform="rotate(300 88 88)"/>
              </svg>
              <!-- Center emoji -->
              <span class="relative z-10 text-3xl anim-float">🌸</span>
              <!-- Orbiting dot -->
              <div class="absolute top-4 right-10 w-3 h-3 rounded-full bg-rose-400 anim-orbit-a"/>
              <div class="absolute bottom-5 left-8 w-2 h-2 rounded-full bg-pink-300 anim-orbit-b"/>
            </div>
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
            <!-- Animated illustration: ringing bell -->
            <div class="relative mx-auto mb-4 w-44 h-44 flex items-center justify-center">
              <!-- Glow bg -->
              <div class="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 anim-pulse-soft" />
              <!-- Bell SVG with ring animation -->
              <svg class="relative z-10 w-20 h-20 anim-bell-ring" viewBox="0 0 80 80" fill="none">
                <path d="M40 8C38.3 8 37 9.3 37 11V13.5C28.2 15.2 22 23 22 32V50L16 56V59H64V56L58 50V32C58 23 51.8 15.2 43 13.5V11C43 9.3 41.7 8 40 8Z" fill="#f59e0b"/>
                <ellipse cx="40" cy="60" rx="7" ry="4" fill="#d97706"/>
                <circle cx="40" cy="64" r="5" fill="#fbbf24"/>
              </svg>
              <!-- Wave rings -->
              <svg class="absolute inset-0 w-full h-full" viewBox="0 0 176 176" fill="none">
                <path d="M55 70 Q44 76 44 88" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" class="anim-wave-l"/>
                <path d="M48 58 Q30 68 30 88" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" opacity="0.6" class="anim-wave-l" style="animation-delay:0.2s"/>
                <path d="M121 70 Q132 76 132 88" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" class="anim-wave-r"/>
                <path d="M128 58 Q146 68 146 88" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" opacity="0.6" class="anim-wave-r" style="animation-delay:0.2s"/>
              </svg>
              <!-- Sparkle dots -->
              <div class="absolute top-5 right-8 w-3 h-3 rounded-full bg-amber-400 anim-twinkle"/>
              <div class="absolute bottom-8 left-7 w-2 h-2 rounded-full bg-yellow-300 anim-twinkle" style="animation-delay:0.5s"/>
              <div class="absolute top-10 left-6 w-2 h-2 rounded-full bg-amber-300 anim-twinkle" style="animation-delay:1s"/>
            </div>
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
        v-if="step === 2 || step === 3"
        @click="nextStep"
        class="w-full mt-3 text-sm text-slate-400 active:opacity-70"
      >
        Lewati untuk sekarang
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, MapPin } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useGeolocation } from '@/composables/useGeolocation'
import { useGasApi } from '@/composables/useGasApi'
import { useCycleStore } from '@/stores/cycle'
import { INDONESIA_CITIES } from '@/data/indonesiaCities'
import dayjs from 'dayjs'

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const cycleStore = useCycleStore()
const { getLocation, error: geoErrorRef, accuracy: geoAccuracy } = useGeolocation()
const { post: gasPost } = useGasApi()

// Match detected city name to Indonesia cities list for accurate lat/lng
function matchCityFromList(cityNameStr) {
  if (!cityNameStr) return null
  const q = cityNameStr.toLowerCase()
  return INDONESIA_CITIES.find(c => c.city.toLowerCase() === q) ||
    INDONESIA_CITIES.find(c => q.includes(c.city.toLowerCase()) || c.city.toLowerCase().includes(q)) ||
    null
}
const TOTAL_STEPS = 4
const step = ref(0)
const transitionName = ref('slide-left')
const geoLoading = ref(false)
const geoSuccess = ref(false)
const geoError = ref('')
const showCityHint = ref(false)

// City picker state
const citySearch = ref('')
const showCityDropdown = ref(false)

const filteredCities = computed(() => {
  const q = citySearch.value.trim().toLowerCase()
  if (!q || q.length < 1) return []
  return INDONESIA_CITIES.filter(c =>
    c.city.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
  ).slice(0, 8)
})

function selectCity(c) {
  form.value.city = c.city
  form.value.country = 'Indonesia'
  form.value.latitude = c.lat
  form.value.longitude = c.lng
  citySearch.value = c.city
  showCityDropdown.value = false
  showCityHint.value = false
}

function clearCity() {
  citySearch.value = ''
  form.value.city = ''
  form.value.latitude = null
  form.value.longitude = null
  showCityHint.value = false
}

function hideCityDropdownDelayed() {
  setTimeout(() => { showCityDropdown.value = false }, 150)
}

const todayStr = dayjs().format('YYYY-MM-DD')

const form = ref({
  name: '',
  city: '',
  country: 'Indonesia',
  latitude: null,
  longitude: null,
  avgCycle: 28,
  avgPeriod: 6,
  lastPeriodDate: '',
  notifPrayer: true,
  notifAmal: true,
  notifFasting: false,
})

// Sync citySearch with form.value.city
// (so when GPS fills it, the input also shows the value)
function syncCitySearch(city) {
  citySearch.value = city || ''
}

// Pre-fill nama dari displayName Google / akun yang sudah login
onMounted(() => {
  const savedName = authStore.user?.displayName || settingsStore.displayName || ''
  if (savedName && !form.value.name) {
    form.value.name = savedName
  }
  // Pre-fill location if already set
  if (settingsStore.city) {
    form.value.city = settingsStore.city
    citySearch.value = settingsStore.city
    form.value.country = settingsStore.country || 'Indonesia'
    form.value.latitude = settingsStore.location?.latitude || null
    form.value.longitude = settingsStore.location?.longitude || null
  }
})

const canProceed = computed(() => {
  if (step.value === 0) return form.value.name.trim().length >= 2
  if (step.value === 1) return form.value.city.trim().length >= 2
  return true
})

async function detectLocation() {
  geoLoading.value = true
  geoSuccess.value = false
  geoError.value = ''
  showCityHint.value = false

  try {
    const loc = await getLocation()
    if (loc) {
      form.value.latitude = loc.latitude
      form.value.longitude = loc.longitude
      geoSuccess.value = true

      if (loc.city) {
        // Try to match city to Indonesia list for precise lat/lng
        const matched = matchCityFromList(loc.city)
        if (matched) {
          form.value.city = matched.city
          form.value.latitude = matched.lat
          form.value.longitude = matched.lng
          syncCitySearch(matched.city)
        } else {
          form.value.city = loc.city
          form.value.latitude = loc.latitude
          form.value.longitude = loc.longitude
          syncCitySearch(loc.city)
        }
        showCityHint.value = false
      } else {
        // GPS ok but reverse geocode couldn't find city → show picker hint
        showCityHint.value = true
      }

      // Background send lat/lng to GAS — fire & forget, non-blocking
      gasPost('logLocation', {
        lat: loc.latitude,
        lng: loc.longitude,
        city: loc.city || '',
        ts: new Date().toISOString(),
      }).catch(() => { /* silently ignore */ })
    } else {
      geoError.value = geoErrorRef.value || 'Gagal mendapatkan lokasi. Pilih kota manual.'
    }
  } catch {
    geoError.value = 'Gagal mendapatkan lokasi. Pilih kota manual.'
  } finally {
    geoLoading.value = false
  }
}

async function nextStep() {
  if (!canProceed.value) return
  // Sync city from search input if user typed manually
  if (step.value === 1 && citySearch.value.trim()) {
    form.value.city = citySearch.value.trim()
  }
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
  settingsStore.setLocation(
    form.value.city.trim(),
    form.value.latitude,
    form.value.longitude,
    form.value.country.trim(),
  )
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
    try { await Notification.requestPermission() } catch { /* */ }
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

/* ── Lottie-style CSS animations ── */

/* Slow spin */
.anim-spin-slow { animation: spin-slow 12s linear infinite; }
@keyframes spin-slow { to { transform: rotate(360deg); } }

/* Reverse slow spin */
.anim-spin-reverse-slow { animation: spin-slow 18s linear infinite reverse; }

/* Gentle float up-down */
.anim-float { animation: float 3s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Soft pulse scale */
.anim-pulse-soft { animation: pulse-soft 2.5s ease-in-out infinite; }
@keyframes pulse-soft {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.06); opacity: 1; }
}

/* Expanding ping ring */
.anim-ping-slow { animation: ping-slow 2.4s ease-out infinite; }
@keyframes ping-slow {
  0% { transform: scale(0.85); opacity: 0.7; }
  80%, 100% { transform: scale(1.3); opacity: 0; }
}

/* Gentle bounce */
.anim-bounce-gentle { animation: bounce-gentle 1.8s ease-in-out infinite; }
@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-6px); }
}

/* Orbit A (top-right arc) */
.anim-orbit-a { animation: orbit-a 4s ease-in-out infinite; }
@keyframes orbit-a {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(6px, 4px); }
  50% { transform: translate(2px, 8px); }
  75% { transform: translate(-4px, 4px); }
}

/* Orbit B (bottom-left arc) */
.anim-orbit-b { animation: orbit-b 5s ease-in-out infinite; }
@keyframes orbit-b {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(-5px, -5px); }
  66% { transform: translate(5px, -3px); }
}

/* Twinkle opacity */
.anim-twinkle { animation: twinkle 1.8s ease-in-out infinite; }
@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(0.6); }
}

/* Bell ring (rotation) */
.anim-bell-ring { animation: bell-ring 1.4s ease-in-out infinite; transform-origin: top center; }
@keyframes bell-ring {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-12deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-8deg); }
  50% { transform: rotate(0deg); }
}

/* Sound wave left */
.anim-wave-l { animation: wave-fade 1.4s ease-in-out infinite; }
/* Sound wave right */
.anim-wave-r { animation: wave-fade 1.4s ease-in-out infinite 0.1s; }
@keyframes wave-fade {
  0%, 100% { opacity: 0; }
  40%, 60% { opacity: 1; }
}

/* Dot bounce (loading indicator) */
.dot-bounce { animation: dot-bounce 0.9s ease-in-out infinite; }
@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-5px); opacity: 1; }
}

/* Dropdown slide-down */
.dropdown-enter-active { transition: all 0.18s ease-out; }
.dropdown-leave-active { transition: all 0.12s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-6px); }
.dropdown-leave-to   { opacity: 0; transform: translateY(-4px); }

/* Fade slide up (hint) */
.fade-slide-enter-active { transition: all 0.3s ease-out; }
.fade-slide-leave-active { transition: all 0.2s ease-in; }
.fade-slide-enter-from { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to   { opacity: 0; transform: translateY(4px); }

/* Pop scale (success checkmark) */
.pop-enter-active { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.pop-leave-active { transition: all 0.15s ease-in; }
.pop-enter-from { opacity: 0; transform: scale(0.4); }
.pop-leave-to   { opacity: 0; transform: scale(0.4); }

/* Shake (error) */
.shake-enter-active { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
</style>
