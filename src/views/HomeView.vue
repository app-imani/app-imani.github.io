<template>
  <PageWrapper title="">
    <template #topbar>
      <TopBar :show-back="false">
        <template #title>
          <div class="flex flex-col items-center">
            <p class="text-xs text-slate-400 font-normal">{{ hijriDateStr }}</p>
            <h1 class="text-base font-bold text-slate-800 leading-tight">
              {{ greeting }}, {{ settingsStore.displayName || 'Saudariku' }} 👋
            </h1>
          </div>
        </template>
        <template #right>
          <RouterLink to="/settings">
            <Settings :size="20" class="text-slate-500" />
          </RouterLink>
        </template>
      </TopBar>
    </template>

    <div class="space-y-4 pb-6">
      <!-- Mode Haid Banner -->
      <HaidModeBanner v-if="cycleStore.isHaidActive" />

      <!-- Streak + Cycle badge row -->
      <div class="flex gap-3 px-4">
        <StreakWidget class="flex-1" />
        <CycleStatusBadge class="flex-1" />
      </div>

      <!-- Prayer countdown -->
      <div class="px-4">
        <PrayerCountdownCard />
      </div>

      <!-- Sholat quick checklist -->
      <div class="mx-4 card">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-slate-700">Sholat Hari Ini</h2>
          <RouterLink to="/prayer" class="text-xs text-primary-600 font-medium">Lihat semua →</RouterLink>
        </div>
        <div class="space-y-0.5">
          <PrayerCheckItem
            v-for="p in prayers"
            :key="p.key"
            :prayer="p"
            :status="prayerStore.getTodayStatus(p.key)"
            @openStatus="openStatusModal(p)"
          />
        </div>
      </div>

      <!-- Dynamic amal card -->
      <div class="px-4">
        <DynamicAmalCard />
      </div>

      <!-- Fasting info card -->
      <div class="mx-4 card" v-if="todayFastingType">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🌙</span>
          <div>
            <p class="text-sm font-semibold text-slate-800">{{ todayFastingType.name }}</p>
            <p class="text-xs text-slate-400">{{ todayFastingType.desc }}</p>
          </div>
          <button
            @click="logFasting"
            class="ml-auto shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-100 text-primary-700 active:scale-95 transition-transform"
            :class="fastingLogged ? 'opacity-50 cursor-default' : ''"
          >
            {{ fastingLogged ? '✓ Dicatat' : 'Catat Puasa' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Prayer status modal -->
    <ModalBase v-model="showStatusModal" :title="`Status Sholat ${selectedPrayer?.name || ''}`">
      <div class="grid grid-cols-2 gap-2 p-4">
        <button
          v-for="s in PRAYER_STATUSES"
          :key="s.value"
          @click="setPrayerStatus(s.value)"
          class="flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all active:scale-95"
          :class="prayerStore.getTodayStatus(selectedPrayer?.key) === s.value
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-100 bg-white'"
        >
          <span class="text-2xl">{{ s.emoji }}</span>
          <span class="text-xs font-medium text-slate-700">{{ s.label }}</span>
        </button>
      </div>
    </ModalBase>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Settings } from 'lucide-vue-next'
import dayjs from 'dayjs'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import TopBar from '@/components/layout/TopBar.vue'
import HaidModeBanner from '@/components/dashboard/HaidModeBanner.vue'
import StreakWidget from '@/components/dashboard/StreakWidget.vue'
import CycleStatusBadge from '@/components/dashboard/CycleStatusBadge.vue'
import PrayerCountdownCard from '@/components/dashboard/PrayerCountdownCard.vue'
import DynamicAmalCard from '@/components/dashboard/DynamicAmalCard.vue'
import PrayerCheckItem from '@/components/prayer/PrayerCheckItem.vue'
import ModalBase from '@/components/ui/ModalBase.vue'

import { useSettingsStore } from '@/stores/settings'
import { usePrayerStore } from '@/stores/prayer'
import { useCycleStore } from '@/stores/cycle'
import { useFastingStore } from '@/stores/fasting'
import { useHijriDate } from '@/composables/useHijriDate'

const settingsStore = useSettingsStore()
const prayerStore = usePrayerStore()
const cycleStore = useCycleStore()
const fastingStore = useFastingStore()
const { formatHijri, isTodaySunnahFast } = useHijriDate()

const todayDate = dayjs()
const hijriDateStr = computed(() => formatHijri(todayDate))

const HOUR = todayDate.hour()
const greeting = HOUR < 11 ? 'Selamat Pagi' : HOUR < 15 ? 'Selamat Siang' : HOUR < 18 ? 'Selamat Sore' : 'Selamat Malam'

const prayers = [
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

const showStatusModal = ref(false)
const selectedPrayer = ref(null)

function openStatusModal(prayer) {
  selectedPrayer.value = prayer
  showStatusModal.value = true
}

function setPrayerStatus(status) {
  if (!selectedPrayer.value) return
  prayerStore.setStatus(selectedPrayer.value.key, status)
  showStatusModal.value = false
  window.$toast?.('Status sholat dicatat 🤲', 'success')
}

// Fasting suggestion
const todayFastingType = computed(() => isTodaySunnahFast())
const fastingLogged = computed(() => fastingStore.isTodayLogged())

function logFasting() {
  if (fastingLogged.value) return
  fastingStore.addLog({ type: 'sunnah', subType: todayFastingType.value?.key, date: dayjs().format('YYYY-MM-DD') })
  window.$toast?.('Puasa sunnah dicatat 🌙', 'success')
}
</script>
