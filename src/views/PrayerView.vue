<template>
  <PageWrapper>
    <template #topbar>
      <TopBar title="Sholat" subtitle="Jadwal & Pencatatan" />
    </template>

    <div class="pb-6 space-y-4">
      <!-- Date selector -->
      <div class="flex items-center justify-between px-4 pt-2">
        <button @click="changeDay(-1)" class="p-2 rounded-xl active:bg-slate-100 transition-colors">
          <ChevronLeft :size="20" class="text-slate-500" />
        </button>
        <div class="text-center">
          <p class="text-sm font-semibold text-slate-800">{{ displayDate }}</p>
          <p class="text-xs text-slate-400">{{ hijriStr }}</p>
        </div>
        <button @click="changeDay(1)" :disabled="isToday" class="p-2 rounded-xl active:bg-slate-100 transition-colors disabled:opacity-30">
          <ChevronRight :size="20" class="text-slate-500" />
        </button>
      </div>

      <!-- Mode Haid notice -->
      <div v-if="cycleStore.isHaidActive" class="mx-4 p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2">
        <span class="text-lg">🌸</span>
        <p class="text-xs text-rose-600 font-medium">Mode Haid aktif — sholat tidak diwajibkan, tapi tetap dzikir ya 💕</p>
      </div>

      <!-- Prayer schedule + status -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Jadwal Sholat</h2>
        <div v-if="prayerTimesLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-14 rounded-xl bg-slate-100 animate-pulse" />
        </div>
        <div v-else-if="prayerTimes">
          <PrayerCheckItem
            v-for="p in PRAYERS"
            :key="p.key"
            :prayer="{ ...p, time: prayerTimes[p.key], isUdzur: cycleStore.isHaidActive }"
            :status="prayerStore.getStatus(selectedDate, p.key)"
            @openStatus="openStatusModal(p)"
          />
        </div>
        <p v-else class="text-sm text-slate-400 text-center py-4">
          Gagal memuat jadwal. <button @click="loadPrayerTimes" class="text-primary-600 underline">Coba lagi</button>
        </p>
      </div>

      <!-- Streak card -->
      <div class="mx-4 card flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-700">Streak Sholat</p>
          <p class="text-xs text-slate-400 mt-0.5">Berturut-turut penuh 5 waktu</p>
        </div>
        <div class="flex items-center gap-1.5">
          <Flame :size="22" class="text-orange-400" />
          <span class="text-2xl font-bold text-orange-500">{{ prayerStore.streak }}</span>
          <span class="text-xs text-slate-400">hari</span>
        </div>
      </div>

      <!-- Weekly summary -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Ringkasan 7 Hari</h2>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in weekSummary"
            :key="day.date"
            class="flex flex-col items-center gap-1"
          >
            <p class="text-xs text-slate-400">{{ day.label }}</p>
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
              :class="day.complete ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400'"
            >
              {{ day.count }}/5
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status modal -->
    <ModalBase v-model="showStatusModal" :title="`Status: ${selectedPrayer?.name || ''}`">
      <div class="grid grid-cols-2 gap-2 p-4">
        <button
          v-for="s in PRAYER_STATUSES"
          :key="s.value"
          @click="setPrayerStatus(s.value)"
          class="flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all active:scale-95"
          :class="prayerStore.getStatus(selectedDate, selectedPrayer?.key) === s.value
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-100 bg-white hover:border-slate-200'"
        >
          <span class="text-2xl">{{ s.emoji }}</span>
          <span class="text-xs font-semibold text-slate-700">{{ s.label }}</span>
        </button>
        <button
          @click="setPrayerStatus('skip')"
          class="col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-100 bg-red-50 text-red-400 text-sm font-medium active:scale-95 transition-all"
        >
          <X :size="16" /> Tidak Sholat
        </button>
      </div>
    </ModalBase>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Flame, X } from 'lucide-vue-next'
import dayjs from 'dayjs'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import TopBar from '@/components/layout/TopBar.vue'
import PrayerCheckItem from '@/components/prayer/PrayerCheckItem.vue'
import ModalBase from '@/components/ui/ModalBase.vue'

import { usePrayerStore } from '@/stores/prayer'
import { useCycleStore } from '@/stores/cycle'
import { useSettingsStore } from '@/stores/settings'
import { usePrayerTimes } from '@/composables/usePrayerTimes'
import { useHijriDate } from '@/composables/useHijriDate'

const prayerStore = usePrayerStore()
const cycleStore = useCycleStore()
const settingsStore = useSettingsStore()
const { getPrayerTimes } = usePrayerTimes()
const { formatHijri } = useHijriDate()

const today = dayjs()
const selectedDate = ref(today.format('YYYY-MM-DD'))
const prayerTimes = ref(null)
const prayerTimesLoading = ref(false)

const isToday = computed(() => selectedDate.value === today.format('YYYY-MM-DD'))
const displayDate = computed(() => {
  const d = dayjs(selectedDate.value)
  return d.isSame(today, 'day') ? 'Hari Ini' : d.format('dddd, D MMMM YYYY')
})
const hijriStr = computed(() => formatHijri(dayjs(selectedDate.value)))

const PRAYERS = [
  { key: 'fajr', name: 'Subuh' },
  { key: 'dhuhr', name: 'Dzuhur' },
  { key: 'asr', name: 'Ashar' },
  { key: 'maghrib', name: 'Maghrib' },
  { key: 'isha', name: 'Isya' },
]

const PRAYER_STATUSES = [
  { value: 'tepat_waktu', label: 'Tepat Waktu', emoji: '⏰' },
  { value: 'terlambat', label: 'Terlambat', emoji: '🕰️' },
  { value: 'berjamaah', label: 'Berjamaah', emoji: '🕌' },
  { value: 'munfarid', label: 'Munfarid', emoji: '🤲' },
]

function changeDay(delta) {
  selectedDate.value = dayjs(selectedDate.value).add(delta, 'day').format('YYYY-MM-DD')
}

const showStatusModal = ref(false)
const selectedPrayer = ref(null)

function openStatusModal(prayer) {
  selectedPrayer.value = prayer
  showStatusModal.value = true
}

function setPrayerStatus(status) {
  prayerStore.setStatus(selectedPrayer.value.key, status, selectedDate.value)
  showStatusModal.value = false
  if (status !== 'skip') window.$toast?.('Alhamdulillah 🤲', 'success')
}

async function loadPrayerTimes() {
  prayerTimesLoading.value = true
  try {
    const result = await getPrayerTimes({
      city: settingsStore.city || 'Jakarta',
      country: settingsStore.country || 'Indonesia',
      date: selectedDate.value,
    })
    prayerTimes.value = result
  } catch (e) {
    prayerTimes.value = null
  } finally {
    prayerTimesLoading.value = false
  }
}

const weekSummary = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = today.subtract(6 - i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    const count = PRAYERS.filter(p => {
      const s = prayerStore.getStatus(dateStr, p.key)
      return s && s !== 'skip'
    }).length
    return { date: dateStr, label: d.format('dd'), count, complete: count === 5 }
  })
})

watch(selectedDate, loadPrayerTimes)
onMounted(loadPrayerTimes)
</script>
