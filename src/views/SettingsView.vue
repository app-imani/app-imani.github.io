<template>
  <PageWrapper>
    <template #topbar>
      <TopBar title="Pengaturan" />
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
          <button @click="detectLocation" :disabled="geoLoading" class="text-xs text-primary-600 font-medium active:opacity-60 disabled:opacity-40">
            {{ geoLoading ? 'Mendeteksi...' : '🔍 Auto' }}
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-500 mb-1 block">Kota</label>
            <input v-model="form.city" type="text" placeholder="Jakarta" class="input-base" />
          </div>
          <div>
            <label class="text-xs text-slate-500 mb-1 block">Negara</label>
            <input v-model="form.country" type="text" placeholder="Indonesia" class="input-base" />
          </div>
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
          <button @click="showResetConfirm = true" class="w-full py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 text-sm font-medium active:scale-95 transition-transform">
            🗑️ Reset Semua Data
          </button>
        </div>
      </div>

      <!-- App info -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-2">ℹ️ Tentang Imani</h2>
        <p class="text-xs text-slate-400 leading-relaxed">
          Imani v1.0 — Muslimah Daily Habit & Cycle Tracker<br/>
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
import { ref, reactive, onMounted } from 'vue'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import TopBar from '@/components/layout/TopBar.vue'
import ModalBase from '@/components/ui/ModalBase.vue'

import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'
import { useGeolocation } from '@/composables/useGeolocation'
import { useRouter } from 'vue-router'

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { signOut } = useFirebaseAuth()
const { getLocation } = useGeolocation()

const geoLoading = ref(false)
const showResetConfirm = ref(false)
const notifPermission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'default')

const CALC_METHODS = [
  { value: 2, label: 'Islamic Society of North America (ISNA)' },
  { value: 4, label: 'Umm Al-Qura University, Makkah' },
  { value: 5, label: 'Egyptian General Authority of Survey' },
  { value: 11, label: 'Majlis Ugama Islam Singapura (MUIS)' },
  { value: 20, label: 'Kementerian Agama RI (Indonesia)' },
]

const form = reactive({
  name: '',
  city: '',
  country: '',
  calcMethod: 20,
  notifPrayer: true,
  notifAmal: true,
  notifFasting: false,
})

onMounted(() => {
  form.name = settingsStore.displayName || ''
  form.city = settingsStore.city || ''
  form.country = settingsStore.country || 'Indonesia'
  form.calcMethod = settingsStore.calcMethod || 20
  form.notifPrayer = settingsStore.notifPrayer ?? true
  form.notifAmal = settingsStore.notifAmal ?? true
  form.notifFasting = settingsStore.notifFasting ?? false
})

async function detectLocation() {
  geoLoading.value = true
  try {
    const loc = await getLocation()
    if (loc) {
      form.city = loc.city || form.city
      form.country = loc.country || form.country
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
  settingsStore.displayName = form.name.trim()
  settingsStore.city = form.city.trim()
  settingsStore.country = form.country.trim()
  settingsStore.calcMethod = form.calcMethod
  settingsStore.notifPrayer = form.notifPrayer
  settingsStore.notifAmal = form.notifAmal
  settingsStore.notifFasting = form.notifFasting
  settingsStore.save()
  window.$toast?.('Pengaturan disimpan ✨', 'success')
}

async function handleLogout() {
  try { await signOut() } catch (e) { /* ignore */ }
  authStore.clearSession()
  router.replace('/auth')
}

function exportData() {
  const data = {
    exported: new Date().toISOString(),
    settings: { ...settingsStore.$state },
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `imani-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
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
</style>
