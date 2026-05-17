<template>
  <PageWrapper>
    <template #topbar>
      <TopBar title="Puasa" subtitle="Wajib & Sunnah" :show-back="true">
        <template #actions>
          <RouterLink to="/settings" class="p-2 rounded-xl active:bg-slate-100 transition-colors" aria-label="Pengaturan">
            <Settings :size="20" class="text-slate-400" />
          </RouterLink>
        </template>
      </TopBar>
    </template>

    <div class="pb-6 space-y-4">
      <!-- Qadha Ramadhan counter -->
      <div class="mx-4 card bg-gradient-to-br from-primary-50 to-emerald-50 border-primary-100">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-sm font-semibold text-slate-800">Hutang Qadha Ramadhan</p>
            <p class="text-xs text-slate-500 mt-0.5">Total belum dibayar</p>
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold text-primary-600">{{ fastingStore.qadhaDebt }}</p>
            <p class="text-xs text-slate-400">hari</p>
          </div>
        </div>
        <!-- Progress bar: paid vs total -->
        <div v-if="fastingStore.totalQadha > 0">
          <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 rounded-full transition-all duration-500"
              :style="{ width: `${qadhaProgressPct}%` }"
            />
          </div>
          <p class="text-xs text-slate-400 mt-1.5">
            {{ fastingStore.qadhaPaid }} dari {{ fastingStore.totalQadha }} terbayar
          </p>
        </div>
        <div v-else class="text-xs text-primary-600 font-medium">✨ Tidak ada hutang qadha</div>
      </div>

      <!-- Log Puasa Hari Ini -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Catat Puasa</h2>

        <div class="grid grid-cols-2 gap-2 mb-3">
          <button
            v-for="type in FASTING_TYPES"
            :key="type.value"
            @click="selectedType = type.value"
            class="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-xs font-semibold transition-all active:scale-95"
            :class="selectedType === type.value
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-slate-100 bg-white text-slate-600'"
          >
            <span class="text-xl">{{ type.emoji }}</span>
            {{ type.label }}
          </button>
        </div>

        <input
          v-model="fastingNote"
          type="text"
          placeholder="Catatan (opsional)..."
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none mb-3"
        />

        <button
          @click="logFasting"
          :disabled="!selectedType || todayLogged"
          class="w-full py-3 rounded-2xl font-semibold text-sm text-white bg-primary-600 disabled:opacity-40 transition-all active:scale-95"
        >
          {{ todayLogged ? '✓ Sudah Dicatat Hari Ini' : '+ Catat Puasa' }}
        </button>
      </div>

      <!-- Qadha action buttons -->
      <div v-if="fastingStore.qadhaDebt > 0" class="mx-4 card">
        <p class="text-sm font-semibold text-slate-700 mb-2">Bayar Qadha</p>
        <p class="text-xs text-slate-400 mb-3">Sedang berpuasa qadha hari ini?</p>
        <button
          @click="payQadha"
          :disabled="qadhaPaidToday"
          class="w-full py-3 rounded-2xl font-semibold text-sm text-white bg-emerald-500 disabled:opacity-40 transition-all active:scale-95"
        >
          {{ qadhaPaidToday ? '✓ Qadha Hari Ini Terbayar' : '🌙 Bayar 1 Hari Qadha' }}
        </button>
      </div>

      <!-- Sunnah fast suggestions -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Puasa Sunnah Bulan Ini</h2>
        <div class="space-y-2">
          <div
            v-for="fast in sunnahFasts"
            :key="fast.id"
            class="flex items-center gap-3 py-2"
          >
            <span class="text-lg">{{ fast.emoji }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium text-slate-700">{{ fast.name }}</p>
              <p class="text-xs text-slate-400">{{ fast.nextDate }}</p>
            </div>
            <span
              v-if="fast.done"
              class="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full"
            >✓</span>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Riwayat Puasa</h2>
        <EmptyState
          v-if="fastingStore.logsArray.length === 0"
          illustration="🌙"
          title="Belum ada catatan puasa"
          description="Mulai catat puasa sunnahmu hari ini!"
        />
        <div v-else class="space-y-2">
          <div
            v-for="log in recentLogs"
            :key="log.id"
            class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">{{ FASTING_EMOJI[log.type] || '🌙' }}</span>
              <div>
                <p class="text-sm font-medium text-slate-700">{{ FASTING_LABEL[log.type] || log.type }}</p>
                <p class="text-xs text-slate-400">{{ formatDate(log.date) }}</p>
              </div>
            </div>
            <span class="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full font-medium">
              {{ log.type === 'qadha' ? 'Qadha' : 'Sunnah' }}
            </span>
          </div>
          <button
            v-if="fastingStore.logsArray.length > 5"
            @click="showAllLogs = !showAllLogs"
            class="text-xs text-primary-600 font-medium w-full text-center pt-1"
          >
            {{ showAllLogs ? 'Sembunyikan' : `Lihat semua (${fastingStore.logsArray.length})` }}
          </button>
        </div>
      </div>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { RouterLink } from 'vue-router'
import { Settings } from 'lucide-vue-next'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TopBar from '@/components/layout/TopBar.vue'
import { useFastingStore } from '@/stores/fasting'
import { useHijriDate } from '@/composables/useHijriDate'

const fastingStore = useFastingStore()
const { getAyyamulBidhDates, isArafahDate } = useHijriDate()

const selectedType = ref('sunnah')
const fastingNote = ref('')
const showAllLogs = ref(false)

const todayStr = dayjs().format('YYYY-MM-DD')

const FASTING_TYPES = [
  { value: 'wajib', label: 'Wajib/Nadzar', emoji: '📖' },
  { value: 'sunnah', label: 'Sunnah', emoji: '🌙' },
  { value: 'qadha', label: 'Qadha Ramadhan', emoji: '🔄' },
  { value: 'kifarat', label: 'Kafarat', emoji: '🤲' },
]

const FASTING_EMOJI = { wajib: '📖', sunnah: '🌙', qadha: '🔄', kifarat: '🤲' }
const FASTING_LABEL = { wajib: 'Wajib', sunnah: 'Sunnah', qadha: 'Qadha', kifarat: 'Kafarat' }

const todayLogged = computed(() => fastingStore.isTodayLogged())
const qadhaPaidToday = computed(() => fastingStore.isQadhaPaidToday())

const qadhaProgressPct = computed(() => {
  if (!fastingStore.totalQadha) return 0
  return Math.round((fastingStore.qadhaPaid / fastingStore.totalQadha) * 100)
})

const recentLogs = computed(() => {
  const sorted = [...fastingStore.logsArray].sort((a, b) => b.date.localeCompare(a.date))
  return showAllLogs.value ? sorted : sorted.slice(0, 5)
})

const sunnahFasts = computed(() => [
  { id: 'senin_kamis', name: 'Senin & Kamis', emoji: '📅', nextDate: 'Rutin setiap minggu', done: false },
  { id: 'ayyamul_bidh', name: "Ayyamul Bidh", emoji: '🌕', nextDate: '13, 14, 15 tiap bulan Hijriah', done: false },
  { id: 'arafah', name: 'Hari Arafah', emoji: '🕋', nextDate: '9 Dzulhijjah', done: false },
])

function logFasting() {
  if (!selectedType.value || todayLogged.value) return
  fastingStore.addLog({
    type: selectedType.value,
    date: todayStr,
    note: fastingNote.value.trim(),
  })
  if (selectedType.value === 'qadha') {
    fastingStore.markQadhaPaid()
  }
  fastingNote.value = ''
  window.$toast?.('Puasa dicatat 🌙 Barakallahu fiik!', 'success')
  window.$reward?.()
}

function payQadha() {
  if (qadhaPaidToday.value) return
  fastingStore.addLog({ type: 'qadha', date: todayStr })
  fastingStore.markQadhaPaid()
  window.$toast?.('Qadha terbayar! Alhamdulillah 🤲', 'success')
}

function formatDate(dateStr) {
  return dayjs(dateStr).format('dddd, D MMM YYYY')
}
</script>
