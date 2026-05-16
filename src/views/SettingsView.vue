<template>
  <PageWrapper>
    <template #topbar>
      <TopBar title="Pengaturan" :showBack="true" />
    </template>

    <div class="pb-10 space-y-4">
      <!-- Profile -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">👤 Profil</h2>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-slate-500 mb-1 block">Nama Panggilan</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Nama kamu..."
              class="input-base"
              maxlength="30"
            />
          </div>
        </div>
      </div>

      <!-- Lokasi -->
      <div class="mx-4 card">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-slate-700">📍 Lokasi Sholat</h2>
          <button @click="detectLocation" :disabled="geoLoading" class="text-xs text-primary-600 font-medium active:opacity-60 disabled:opacity-40 flex items-center gap-1">
            <span v-if="geoLoading" class="flex gap-0.5">
              <span class="w-1 h-1 rounded-full bg-primary-500 dot-bounce" style="animation-delay:0ms"/>
              <span class="w-1 h-1 rounded-full bg-primary-500 dot-bounce" style="animation-delay:150ms"/>
              <span class="w-1 h-1 rounded-full bg-primary-500 dot-bounce" style="animation-delay:300ms"/>
            </span>
            <template v-else>🔍 Auto GPS</template>
          </button>
        </div>

        <!-- Geo error/success feedback -->
        <Transition name="shake">
          <div v-if="geoFeedback" class="mb-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2"
            :class="geoFeedbackType === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'">
            {{ geoFeedbackType === 'error' ? '⚠️' : '✓' }} {{ geoFeedback }}
          </div>
        </Transition>

        <!-- Searchable city picker -->
        <div class="mb-3">
          <label class="text-xs text-slate-500 mb-1 block">Kota</label>
          <div class="relative">
            <input
              v-model="citySearch"
              @input="showCityDropdown = true"
              @focus="showCityDropdown = citySearch.length >= 1"
              @blur="hideCityDropdownDelayed"
              type="text"
              placeholder="Ketik atau pilih kota..."
              class="input-base"
              autocomplete="off"
            />
            <span v-if="citySearch" @click="citySearch = ''; form.city = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer text-lg leading-none select-none">×</span>
            <Transition name="dropdown">
              <div v-if="showCityDropdown && filteredCities.length > 0"
                class="absolute z-30 top-full mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto">
                <button v-for="c in filteredCities" :key="c.city"
                  @mousedown.prevent="selectSettingsCity(c)"
                  class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 border-b border-slate-50 last:border-0 flex items-center justify-between">
                  <span class="font-medium">{{ c.city }}</span>
                  <span class="text-[11px] text-slate-400 ml-2 shrink-0">{{ c.province }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <div>
          <label class="text-xs text-slate-500 mb-1 block">Negara</label>
          <input v-model="form.country" type="text" placeholder="Indonesia" class="input-base" />
        </div>

        <div class="mt-3">
          <label class="text-xs text-slate-500 mb-1 block">Metode Kalkulasi Sholat</label>
          <select v-model="form.calcMethod" class="w-full input-base bg-white">
            <option v-for="m in CALC_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
      </div>

      <!-- Notifikasi -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">🔔 Notifikasi</h2>
        <div class="space-y-3">
          <ToggleRow v-model="form.notifPrayer" label="Pengingat Sholat" desc="5 menit sebelum waktu sholat" />
          <ToggleRow v-model="form.notifAmal" label="Dzikir Pagi & Petang" desc="Setelah Subuh & Ashar" />
          <ToggleRow v-model="form.notifFasting" label="Puasa Sunnah" desc="Hari Senin, Kamis & Ayyamul Bidh" />
        </div>
        <button
          v-if="notifPermission !== 'granted'"
          @click="requestNotifPermission"
          class="mt-3 w-full py-2.5 rounded-xl bg-primary-50 text-primary-600 text-xs font-semibold active:scale-95 transition-transform"
        >
          Izinkan Notifikasi Browser
        </button>
        <p v-else class="mt-2 text-xs text-emerald-500 font-medium">✓ Izin notifikasi diberikan</p>
        <!-- IMPR-01 AC-05: PWA education banner -->
        <div class="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed">
          💡 Agar notifikasi berjalan di latar belakang, install Imani ke Home Screen melalui menu browser → <strong>Tambah ke Layar Utama</strong>.
        </div>
      </div>

      <!-- Notifikasi Momen Spesial (F-06) -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">✨ Notifikasi Momen Istimewa</h2>
        <div class="space-y-3">
          <ToggleRow v-model="form.notifMalamJumat" label="Malam Jum'at" desc="Pengingat amalan malam Jum'at" />
          <ToggleRow v-model="form.notifAyyamulBidh" label="Ayyamul Bidh" desc="13, 14, 15 setiap bulan Hijriah" />
          <ToggleRow v-model="form.notifSeninaKamis" label="Senin & Kamis" desc="Pengingat puasa sunnah" />
          <ToggleRow v-model="form.notifSpecialMoment" label="Momen Istimewa Lainnya" desc="10 Dzulhijjah, Nisfu Sya'ban, dll" />
        </div>
      </div>

      <!-- IMPR-03: Tampilan / Dark Mode -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">🌗 Tampilan</h2>
        <label class="text-xs text-slate-500 mb-1 block">Tema Warna</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opt in COLOR_SCHEME_OPTIONS" :key="opt.value"
            @click="form.colorScheme = opt.value"
            class="py-2 rounded-xl text-xs font-medium border transition-all"
            :class="form.colorScheme === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'"
          >{{ opt.label }}</button>
        </div>
      </div>

      <!-- IMPR-11: Qari Al-Quran -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">🎙️ Qari Al-Quran</h2>
        <label class="text-xs text-slate-500 mb-1 block">Pilih Qari Murottal</label>
        <select v-model="form.preferredQari" class="w-full input-base bg-white">
          <option v-for="q in QARI_OPTIONS" :key="q.value" :value="q.value">{{ q.label }}</option>
        </select>
      </div>

      <!-- Mode Udzur (F-01) -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-1">🌸 Mode Udzur (Haid)</h2>
        <p class="text-xs text-slate-400 mb-3 leading-relaxed">Aktifkan saat haid. Tampilkan amalan alternatif (dzikir, doa, sedekah) yang tetap bernilai ibadah.</p>
        <RouterLink to="/amal" class="block w-full py-2.5 rounded-xl bg-pink-50 text-pink-600 text-xs font-semibold text-center active:scale-95 transition-transform">
          🌸 Kelola Mode Udzur di Halaman Amalan
        </RouterLink>
      </div>

      <!-- IMPR-02: Guest backup reminder banner -->
      <div
        v-if="authStore.isGuest && !settingsStore.lastExportDate"
        class="mx-4 p-4 rounded-2xl bg-amber-50 border border-amber-200"
      >
        <p class="text-sm font-semibold text-amber-800 mb-1">⚠️ Backup Data Kamu</p>
        <p class="text-xs text-amber-700 leading-relaxed mb-3">Kamu menggunakan mode tamu. Data hanya tersimpan di perangkat ini. Export sekarang agar tidak hilang saat uninstall atau ganti HP!</p>
        <button @click="exportData" class="w-full py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold active:scale-95 transition-transform">
          📤 Export Sekarang
        </button>
      </div>

      <!-- Data & Privacy -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">🔒 Data & Privasi</h2>
        <p class="text-xs text-slate-400 mb-4 leading-relaxed">
          Semua data disimpan lokal di perangkatmu. Data tidak dikirim ke server tanpa persetujuanmu.
        </p>
        <div class="space-y-2">
          <button @click="exportData" class="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 active:scale-95 transition-transform">
            📤 Ekspor Data (JSON)
          </button>
          <button @click="triggerImport" class="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 active:scale-95 transition-transform">
            📥 Impor Data (JSON)
          </button>
          <input id="imani-import-file" type="file" accept=".json" class="hidden" @change="importData" />
          <button @click="showResetConfirm = true" class="w-full py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 text-sm font-medium active:scale-95 transition-transform">
            🗑️ Reset Semua Data
          </button>
        </div>
      </div>

      <!-- App info -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-2">ℹ️ Tentang Imani</h2>
        <p class="text-xs text-slate-400 leading-relaxed">
          Imani v1.0 — Muslimah Daily Habit & Haid Tracker<br/>
          Dibuat dengan ❤️ untuk muslimah di seluruh dunia.<br/>
          <span class="text-primary-500">Open source · Privacy first</span>
        </p>
      </div>

      <!-- Keluar / Logout -->
      <div class="mx-4">
        <button
          @click="handleLogout"
          class="w-full py-3.5 rounded-2xl border-2 border-red-100 bg-red-50 text-red-500 font-semibold text-sm active:scale-95 transition-all"
        >
          🚪 Keluar dari Akun
        </button>
      </div>

      <!-- Save button -->
      <div class="mx-4">
        <button
          @click="saveSettings"
          class="w-full py-4 rounded-2xl bg-primary-600 text-white font-semibold text-sm active:scale-95 transition-all"
        >
          💾 Simpan Pengaturan
        </button>
      </div>
    </div>

    <!-- Reset confirm modal -->
    <ModalBase v-model="showResetConfirm" title="Reset Semua Data?">
      <div class="p-5 space-y-4">
        <p class="text-sm text-slate-600 leading-relaxed">
          Semua data (sholat, puasa, qur'an, siklus, amalan) akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div class="flex gap-2">
          <button @click="showResetConfirm = false" class="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">
            Batal
          </button>
          <button @click="resetAllData" class="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold">
            Ya, Hapus Semua
          </button>
        </div>
      </div>
    </ModalBase>
  </PageWrapper>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import TopBar from '@/components/layout/TopBar.vue'
import ModalBase from '@/components/ui/ModalBase.vue'

import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'
import { useGeolocation } from '@/composables/useGeolocation'
import { useGasApi } from '@/composables/useGasApi'
import { usePrayerTimes } from '@/composables/usePrayerTimes'
import { INDONESIA_CITIES } from '@/data/indonesiaCities'
import { useRouter } from 'vue-router'

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { logout: signOut } = useFirebaseAuth()
const { getLocation, error: geoErrorRef, accuracy: geoAccuracy } = useGeolocation()
const { post: gasPost } = useGasApi()
const { clearTodayCache } = usePrayerTimes()

// Match detected city to Indonesia list for precise coordinates
function matchCityFromList(cityNameStr) {
  if (!cityNameStr) return null
  const q = cityNameStr.toLowerCase()
  return INDONESIA_CITIES.find(c => c.city.toLowerCase() === q) ||
    INDONESIA_CITIES.find(c => q.includes(c.city.toLowerCase()) || c.city.toLowerCase().includes(q)) ||
    null
}

const geoLoading = ref(false)
const geoFeedback = ref('')
const geoFeedbackType = ref('success') // 'success' | 'error'
const showResetConfirm = ref(false)
const notifPermission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'default')

// City picker
const citySearch = ref('')
const showCityDropdown = ref(false)

const filteredCities = computed(() => {
  const q = citySearch.value.trim().toLowerCase()
  if (!q || q.length < 1) return []
  return INDONESIA_CITIES.filter(c =>
    c.city.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
  ).slice(0, 8)
})

function selectSettingsCity(c) {
  form.city = c.city
  form.country = 'Indonesia'
  form.latitude = c.lat
  form.longitude = c.lng
  citySearch.value = c.city
  showCityDropdown.value = false
}

function hideCityDropdownDelayed() {
  setTimeout(() => { showCityDropdown.value = false }, 150)
}

const CALC_METHODS = [
  { value: 2, label: 'Islamic Society of North America (ISNA)' },
  { value: 4, label: 'Umm Al-Qura University, Makkah' },
  { value: 5, label: 'Egyptian General Authority of Survey' },
  { value: 11, label: 'Majlis Ugama Islam Singapura (MUIS)' },
  { value: 20, label: 'Kementerian Agama RI (Indonesia)' },
]

const COLOR_SCHEME_OPTIONS = [
  { value: 'light', label: '☀️ Terang' },
  { value: 'dark', label: '🌙 Gelap' },
  { value: 'system', label: '⚙️ Sistem' },
]

const QARI_OPTIONS = [
  { value: 'Alafasy_64kbps', label: 'Mishary Alafasy (64kbps)' },
  { value: 'Husary_64kbps', label: 'Mahmoud Al-Hussary (64kbps)' },
  { value: 'Abdul_Basit_Murattal_64kbps', label: 'Abdul Basit Murattal (64kbps)' },
]

const form = reactive({
  name: '',
  city: '',
  country: '',
  latitude: null,
  longitude: null,
  calcMethod: 20,
  notifPrayer: true,
  notifAmal: true,
  notifFasting: false,
  notifMalamJumat: true,
  notifAyyamulBidh: true,
  notifSeninaKamis: false,
  notifSpecialMoment: true,
  colorScheme: 'light',
  preferredQari: 'Alafasy_64kbps',
})

onMounted(() => {
  form.name = settingsStore.displayName || ''
  form.city = settingsStore.city || ''
  form.country = settingsStore.country || 'Indonesia'
  form.latitude = settingsStore.location?.latitude || null
  form.longitude = settingsStore.location?.longitude || null
  form.calcMethod = settingsStore.calcMethod || 20
  form.notifPrayer = settingsStore.notifPrayer ?? true
  form.notifAmal = settingsStore.notifAmal ?? true
  form.notifFasting = settingsStore.notifFasting ?? false
  form.notifMalamJumat = settingsStore.notifMalamJumat ?? true
  form.notifAyyamulBidh = settingsStore.notifAyyamulBidh ?? true
  form.notifSeninaKamis = settingsStore.notifSeninaKamis ?? false
  form.notifSpecialMoment = settingsStore.notifSpecialMoment ?? true
  form.colorScheme = settingsStore.colorScheme || 'light'
  form.preferredQari = settingsStore.preferredQari || 'Alafasy_64kbps'
  citySearch.value = form.city
})

async function detectLocation() {
  geoLoading.value = true
  geoFeedback.value = ''
  try {
    const loc = await getLocation()
    if (loc) {
      form.latitude = loc.latitude
      form.longitude = loc.longitude
      if (loc.city) {
        const matched = matchCityFromList(loc.city)
        if (matched) {
          form.city = matched.city
          form.latitude = matched.lat
          form.longitude = matched.lng
          citySearch.value = matched.city
        } else {
          form.city = loc.city
          citySearch.value = loc.city
        }
        form.country = 'Indonesia'
        const accText = loc.accuracy ? ` (±${loc.accuracy}m)` : ''
        geoFeedback.value = `Lokasi terdeteksi: ${form.city}${accText}`
        geoFeedbackType.value = 'success'
      } else {
        geoFeedback.value = 'Koordinat GPS didapat! Pilih nama kota dari daftar.'
        geoFeedbackType.value = 'success'
      }
      // Background send to GAS — fire & forget
      gasPost('logLocation', {
        lat: loc.latitude,
        lng: loc.longitude,
        city: loc.city || '',
        ts: new Date().toISOString(),
      }).catch(() => {})
    } else {
      geoFeedback.value = geoErrorRef.value || 'Gagal mendapatkan lokasi.'
      geoFeedbackType.value = 'error'
    }
  } finally {
    geoLoading.value = false
  }
}

async function requestNotifPermission() {
  const perm = await Notification.requestPermission()
  notifPermission.value = perm
}

function saveSettings() {
  const methodChanged = form.calcMethod !== settingsStore.calcMethod

  settingsStore.displayName = form.name.trim()
  // Sync citySearch manual input → form.city
  if (citySearch.value.trim() && !form.city) {
    form.city = citySearch.value.trim()
  }
  settingsStore.setLocation(
    form.city.trim(),
    form.latitude,
    form.longitude,
    form.country.trim(),
  )
  settingsStore.calcMethod = form.calcMethod
  settingsStore.notifPrayer = form.notifPrayer
  settingsStore.notifAmal = form.notifAmal
  settingsStore.notifFasting = form.notifFasting
  settingsStore.notifMalamJumat = form.notifMalamJumat
  settingsStore.notifAyyamulBidh = form.notifAyyamulBidh
  settingsStore.notifSeninaKamis = form.notifSeninaKamis
  settingsStore.notifSpecialMoment = form.notifSpecialMoment
  settingsStore.setColorScheme(form.colorScheme)
  settingsStore.setPreferredQari(form.preferredQari)
  settingsStore.save()

  // IMPR-04: jika metode kalkulasi berubah, hapus cache jadwal sholat hari ini
  if (methodChanged) {
    clearTodayCache()
  }

  window.$toast?.('Pengaturan disimpan ✨', 'success')
}

async function handleLogout() {
  try { await signOut() } catch (e) { /* ignore */ }
  authStore.clearSession()
  router.replace('/auth')
}

function exportData() {
  // IMPR-02: export ALL imani_* keys, not just settings
  const payload = { exported: new Date().toISOString(), version: 1, data: {} }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('imani_')) {
      try { payload.data[key] = JSON.parse(localStorage.getItem(key)) }
      catch { payload.data[key] = localStorage.getItem(key) }
    }
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `imani-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  // IMPR-02: Track last export date
  settingsStore.setLastExportDate(new Date().toISOString().slice(0, 10))
  window.$toast?.('Data berhasil diekspor ✨', 'success')
}

function triggerImport() {
  document.getElementById('imani-import-file').click()
}

function importData(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const payload = JSON.parse(e.target.result)
      if (!payload.data || typeof payload.data !== 'object') throw new Error('Format tidak valid')
      const keys = Object.keys(payload.data).filter(k => k.startsWith('imani_'))
      if (!keys.length) throw new Error('Tidak ada data imani_* ditemukan')
      // IMPR-02 AC-04: Validate at least one core key exists
      const REQUIRED_KEYS = ['imani_prayer_logs', 'imani_amal_logs', 'imani_fasting_logs']
      const hasCore = REQUIRED_KEYS.some(k => payload.data[k] !== undefined)
      if (!hasCore) throw new Error('File backup tidak valid atau bukan dari Imani')
      if (!confirm(`Impor ${keys.length} kunci data? Data saat ini akan ditimpa.`)) return
      keys.forEach(key => {
        const val = payload.data[key]
        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val))
      })
      window.location.reload()
    } catch (err) {
      alert('Gagal mengimpor: ' + err.message)
    }
  }
  reader.readAsText(file)
  event.target.value = '' // reset input
}

function resetAllData() {
  localStorage.clear()
  showResetConfirm.value = false
  window.location.reload()
}

// Inline ToggleRow component
const ToggleRow = {
  props: ['modelValue', 'label', 'desc'],
  emits: ['update:modelValue'],
  template: `
    <div class="flex items-center justify-between gap-3 py-1">
      <div>
        <p class="text-sm text-slate-700 font-medium">{{ label }}</p>
        <p v-if="desc" class="text-xs text-slate-400">{{ desc }}</p>
      </div>
      <button
        @click="$emit('update:modelValue', !modelValue)"
        :class="modelValue ? 'bg-primary-500' : 'bg-slate-200'"
        class="relative w-11 h-6 rounded-full transition-colors shrink-0"
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
  @apply w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary-300 transition-all;
}
.dot-bounce { animation: dot-bounce 0.9s ease-in-out infinite; }
@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-4px); opacity: 1; }
}
.dropdown-enter-active { transition: all 0.18s ease-out; }
.dropdown-leave-active { transition: all 0.12s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-6px); }
.dropdown-leave-to   { opacity: 0; transform: translateY(-4px); }
.shake-enter-active { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
</style>
