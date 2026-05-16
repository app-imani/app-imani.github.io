<template>
  <PageWrapper>
    <template #topbar>
      <TopBar title="Siklus" subtitle="Catatan & Prediksi">
        <template #actions>
          <RouterLink to="/settings" class="p-2 rounded-xl active:bg-slate-100 transition-colors" aria-label="Pengaturan">
            <Settings :size="20" class="text-slate-400" />
          </RouterLink>
        </template>
      </TopBar>
    </template>

    <div class="pb-6 space-y-4">
      <!-- Status card -->
      <div
        class="mx-4 card text-center py-6"
        :class="cycleStore.isHaidActive ? 'bg-rose-50 border-rose-100' : 'bg-primary-50 border-primary-100'"
      >
        <div class="text-4xl mb-2">{{ cycleStore.isHaidActive ? '🌸' : '🌙' }}</div>
        <p class="text-lg font-bold" :class="cycleStore.isHaidActive ? 'text-rose-600' : 'text-primary-700'">
          {{ cycleStore.cycleStatusText }}
        </p>
        <p v-if="cycleStore.isHaidActive" class="text-sm text-rose-400 mt-1">
          Hari ke-{{ cycleStore.currentHaidDay }} dari rata-rata {{ cycleStore.avgPeriodDays }} hari
        </p>

        <!-- Action buttons -->
        <div class="flex gap-2 mt-4 justify-center">
          <button
            v-if="!cycleStore.isHaidActive"
            @click="showMulaiModal = true"
            class="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            🌸 Mulai Haid
          </button>
          <button
            v-else
            @click="confirmSelesaiHaid"
            class="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            ✓ Haid Selesai
          </button>
        </div>
      </div>

      <!-- Prediction card -->
      <div v-if="prediction" class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">📊 Prediksi Siklus</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-rose-50 rounded-xl p-3">
            <p class="text-xs text-rose-400 mb-1">Haid berikutnya</p>
            <p class="text-sm font-bold text-rose-600">{{ formatDate(prediction.nextPeriodDate) }}</p>
          </div>
          <div class="bg-amber-50 rounded-xl p-3">
            <p class="text-xs text-amber-500 mb-1">Masa subur</p>
            <p class="text-sm font-bold text-amber-600">{{ formatDate(prediction.fertileStart) }}</p>
          </div>
          <div class="bg-purple-50 rounded-xl p-3">
            <p class="text-xs text-purple-400 mb-1">Ovulasi</p>
            <p class="text-sm font-bold text-purple-600">{{ formatDate(prediction.ovulationDate) }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-xs text-slate-400 mb-1">Akurasi prediksi</p>
            <p class="text-sm font-bold text-slate-600">{{ prediction.confidence }}%</p>
          </div>
        </div>
      </div>

      <!-- Log harian (mood + symptom) -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Catatan Hari Ini</h2>
        <MoodPicker v-model="todayMood" class="mb-4" />
        <SymptomChips v-model="todaySymptoms" class="mb-4" />
        <textarea
          v-model="todayNote"
          placeholder="Catatan tambahan (opsional)..."
          rows="2"
          class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none resize-none focus:ring-2 focus:ring-primary-300 mb-3"
        />
        <button
          @click="saveDailyLog"
          class="w-full py-3 rounded-2xl bg-primary-600 text-white font-semibold text-sm active:scale-95 transition-all"
        >
          💾 Simpan Catatan
        </button>
      </div>

      <!-- Calendar strip (last 14 days) -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">14 Hari Terakhir</h2>
        <div class="flex gap-1.5 overflow-x-auto pb-1">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            class="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
            @click="selectedCalendarDate = day.date"
          >
            <p class="text-xs text-slate-400">{{ day.dayLabel }}</p>
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all"
              :class="[
                day.isHaid ? 'bg-rose-400 text-white' : 'bg-slate-100 text-slate-500',
                day.date === selectedCalendarDate ? 'ring-2 ring-primary-400' : '',
                day.isToday ? 'ring-2 ring-primary-300' : '',
              ]"
            >
              {{ day.dayNum }}
            </div>
            <div class="text-xs">{{ day.mood }}</div>
          </div>
        </div>
      </div>

      <!-- Riwayat siklus -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Riwayat Haid</h2>
        <EmptyState
          v-if="!cycleStore.cycles?.length"
          illustration="🌸"
          title="Belum ada riwayat haid"
          description="Catat siklus haidmu untuk mendapat prediksi akurat."
        />
        <div v-else class="space-y-2">
          <div
            v-for="c in cycleStore.cycles.slice().reverse().slice(0, 6)"
            :key="c.id"
            class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
          >
            <div>
              <p class="text-sm font-medium text-slate-700">{{ formatDate(c.startDate) }}</p>
              <p class="text-xs text-slate-400">→ {{ c.endDate ? formatDate(c.endDate) : 'Berlangsung' }}</p>
            </div>
            <span v-if="c.endDate" class="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-full">
              {{ calcDuration(c.startDate, c.endDate) }} hari
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mulai Haid Modal -->
    <ModalBase v-model="showMulaiModal" title="Mulai Haid">
      <div class="p-5 space-y-4">
        <div>
          <label class="text-sm font-medium text-slate-700 mb-1 block">Tanggal mulai</label>
          <input v-model="mulaiDate" type="date" :max="todayStr" class="w-full input-sm" />
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          Mode haid akan otomatis aktif. Sholat tidak dihitung sebagai tidak dikerjakan selama mode ini aktif.
        </p>
        <button
          @click="mulaiHaid"
          class="w-full py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm active:scale-95 transition-all"
        >
          🌸 Mulai Mode Haid
        </button>
      </div>
    </ModalBase>

    <!-- Konfirmasi Selesai Haid Modal -->
    <ModalBase v-model="showSelesaiModal" title="Haid Selesai?">
      <div class="p-5 space-y-4">
        <div>
          <label class="text-sm font-medium text-slate-700 mb-1 block">Tanggal selesai</label>
          <input v-model="selesaiDate" type="date" :max="todayStr" class="w-full input-sm" />
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          Sistem akan menghitung otomatis hutang qadha puasa Ramadhan jika berlangsung saat Ramadhan.
        </p>
        <button
          @click="selesaiHaid"
          class="w-full py-3 rounded-2xl bg-primary-600 text-white font-semibold text-sm active:scale-95 transition-all"
        >
          ✓ Konfirmasi Selesai
        </button>
      </div>
    </ModalBase>
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
import MoodPicker from '@/components/cycle/MoodPicker.vue'
import SymptomChips from '@/components/cycle/SymptomChips.vue'
import ModalBase from '@/components/ui/ModalBase.vue'

import { useCycleStore } from '@/stores/cycle'

const cycleStore = useCycleStore()

const todayStr = dayjs().format('YYYY-MM-DD')
const selectedCalendarDate = ref(todayStr)

// Daily log state
const todayMood = ref('')
const todaySymptoms = ref([])
const todayNote = ref('')

// Modal state
const showMulaiModal = ref(false)
const showSelesaiModal = ref(false)
const mulaiDate = ref(todayStr)
const selesaiDate = ref(todayStr)

const prediction = computed(() => cycleStore.prediction)

// Calendar: last 14 days
const calendarDays = computed(() => {
  return Array.from({ length: 14 }, (_, i) => {
    const d = dayjs().subtract(13 - i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    const log = cycleStore.getDailyLog(dateStr)
    return {
      date: dateStr,
      dayLabel: d.format('dd'),
      dayNum: d.format('D'),
      isHaid: cycleStore.isHaidOnDate(dateStr),
      isToday: dateStr === todayStr,
      mood: log?.mood || '',
    }
  })
})

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return dayjs(dateStr).format('D MMM YY')
}

function calcDuration(start, end) {
  return dayjs(end).diff(dayjs(start), 'day') + 1
}

function mulaiHaid() {
  cycleStore.mulaiHaid(mulaiDate.value)
  showMulaiModal.value = false
  window.$toast?.('Mode Haid aktif 🌸', 'info')
}

function confirmSelesaiHaid() {
  selesaiDate.value = todayStr
  showSelesaiModal.value = true
}

function selesaiHaid() {
  const result = cycleStore.selesaiHaid(selesaiDate.value)
  if (!result?.success) {
    window.$toast?.(result?.message || 'Belum bisa menyelesaikan mode haid.', 'warning')
    return
  }

  showSelesaiModal.value = false
  const rewardSubtext = result.qadhaAdded > 0
    ? `${result.qadhaAdded} hari qadha Ramadhan tercatat otomatis.`
    : 'Semoga Allah menjaga kesehatan dan ibadahmu.'
  window.$toast?.('Alhamdulillah, haid selesai 💕', 'success')
  window.$reward?.('Masya Allah! 🎊', rewardSubtext)
}

function saveDailyLog() {
  cycleStore.saveDailyLog({
    date: todayStr,
    mood: todayMood.value,
    symptoms: todaySymptoms.value,
    note: todayNote.value.trim(),
  })
  window.$toast?.('Catatan disimpan 💕', 'success')
}
</script>

<style scoped>
.input-sm {
  @apply w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary-300;
}
</style>
