<template>
  <PageWrapper>
    <template #topbar>
      <!-- Custom gradient topbar -->
      <div class="relative overflow-hidden bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400 px-4 shadow-[0_4px_20px_-8px_rgba(244,114,182,0.5)]"
           style="padding-top: max(env(safe-area-inset-top), 12px); padding-bottom: 0;">
        <!-- Decorative orbs -->
        <div class="pointer-events-none absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div class="pointer-events-none absolute top-0 left-0 h-16 w-16 rounded-full bg-fuchsia-300/20 blur-xl" />
        <!-- Floating stars -->
        <span class="tb-star absolute top-2 right-20 text-white/40 text-xs select-none" style="animation-delay:0.3s">✦</span>
        <span class="tb-star absolute top-4 left-16 text-white/30 text-[10px] select-none" style="animation-delay:1.1s">✧</span>

        <div class="relative flex items-center justify-between pb-3 gap-3">
          <!-- Left: icon -->
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 tb-bloom">
            <span class="text-xl leading-none">🌸</span>
          </div>

          <!-- Center: title block -->
          <div class="flex-1 text-center">
            <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70 leading-none mb-0.5">Catatan Muslimah</p>
            <h1 class="text-lg font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">Siklus & Kesehatan</h1>
            <p class="text-[10px] text-white/70 leading-none mt-0.5">{{ cycleStatusLabel }}</p>
          </div>

          <!-- Right: settings -->
          <RouterLink to="/settings"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 active:bg-white/30 transition-colors">
            <Settings :size="18" class="text-white" />
          </RouterLink>
        </div>

        <!-- Bottom wave -->
        <div class="pointer-events-none absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 375 20" fill="none" class="w-full">
            <path d="M0 20 C80 4 200 16 375 4 L375 20 Z" fill="white" fill-opacity="0.12"/>
          </svg>
        </div>
      </div>
    </template>

    <div class="pb-8 space-y-4">

      <!-- ══ HERO STATUS CARD ══ -->
      <div class="mx-4 mt-4">
        <div
          class="relative overflow-hidden rounded-3xl px-5 py-6 text-center shadow-lg transition-all"
          :class="cycleStore.isHaidActive
            ? 'bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 shadow-rose-200/60'
            : 'bg-gradient-to-br from-primary-400 via-emerald-400 to-teal-500 shadow-primary-200/50'"
        >
          <!-- Bg decorations -->
          <div class="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div class="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <!-- Stars -->
          <span class="hero-star absolute top-3 left-8 text-white/40 text-xs select-none" style="animation-delay:0s">✦</span>
          <span class="hero-star absolute top-4 right-10 text-white/50 text-[10px] select-none" style="animation-delay:0.8s">✧</span>
          <span class="hero-star absolute bottom-4 left-14 text-white/30 text-xs select-none" style="animation-delay:1.5s">✦</span>
          <!-- Petals -->
          <span class="hero-petal absolute top-2 right-5 text-lg text-white/25 select-none" style="animation-delay:0.4s">🌸</span>
          <span class="hero-petal absolute bottom-3 left-4 text-base text-white/20 select-none" style="animation-delay:1.2s">🌷</span>

          <!-- Main icon with bloom ring -->
          <div class="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center">
            <span class="absolute inset-0 rounded-full bg-white/20 hero-bloom-ring" />
            <span class="absolute inset-2 rounded-full bg-white/15" />
            <span class="relative text-4xl hero-icon-bounce">{{ cycleStore.isHaidActive ? '🌸' : '🌙' }}</span>
          </div>

          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">
            {{ cycleStore.isHaidActive ? 'Mode Haid Aktif' : 'Status Siklus' }}
          </p>
          <p class="text-xl font-extrabold text-white drop-shadow-sm leading-tight">
            {{ cycleStore.cycleStatusText }}
          </p>
          <p v-if="cycleStore.isHaidActive" class="mt-1 text-sm text-white/80">
            Hari ke-<span class="font-bold text-white">{{ cycleStore.currentHaidDay }}</span>
            dari rata-rata {{ cycleStore.avgPeriodDays }} hari
          </p>

          <!-- Progress bar for haid -->
          <div v-if="cycleStore.isHaidActive" class="mt-3 mx-auto max-w-[180px]">
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                class="h-full rounded-full bg-white/70 transition-all duration-700"
                :style="{ width: `${Math.min(100, ((cycleStore.currentHaidDay || 1) / (cycleStore.avgPeriodDays || 6)) * 100)}%` }"
              />
            </div>
            <p class="text-[9px] text-white/60 mt-1">{{ cycleStore.currentHaidDay }}/{{ cycleStore.avgPeriodDays }} hari</p>
          </div>

          <!-- CTA button -->
          <div class="mt-5">
            <button
              v-if="!cycleStore.isHaidActive"
              @click="showMulaiModal = true"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/25 ring-1 ring-white/40 text-white text-sm font-bold active:scale-95 active:bg-white/35 transition-all backdrop-blur-sm"
            >
              <span>🌸</span> Mulai Haid
            </button>
            <button
              v-else
              @click="confirmSelesaiHaid"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/25 ring-1 ring-white/40 text-white text-sm font-bold active:scale-95 active:bg-white/35 transition-all backdrop-blur-sm"
            >
              <span>✓</span> Haid Selesai
            </button>
          </div>
        </div>
      </div>

      <!-- ══ PREDIKSI SIKLUS ══ -->
      <Transition name="bloom-in">
        <div v-if="prediction" class="mx-4">
          <div class="section-header">
            <div class="divider-line" />
            <span class="section-label">📊 Prediksi Siklus</span>
            <div class="divider-line" />
          </div>
          <div class="grid grid-cols-2 gap-3 mt-3">
            <!-- Haid berikutnya -->
            <div class="pred-card border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50">
              <div class="pred-icon bg-rose-100">🌸</div>
              <p class="pred-label text-rose-400">Haid berikutnya</p>
              <p class="pred-value text-rose-600">{{ formatDate(prediction.nextPeriodDate) }}</p>
            </div>
            <!-- Masa subur -->
            <div class="pred-card border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50">
              <div class="pred-icon bg-amber-100">🌼</div>
              <p class="pred-label text-amber-500">Masa subur</p>
              <p class="pred-value text-amber-600">{{ formatDate(prediction.fertileStart) }}</p>
            </div>
            <!-- Ovulasi -->
            <div class="pred-card border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50">
              <div class="pred-icon bg-purple-100">🌙</div>
              <p class="pred-label text-purple-400">Ovulasi</p>
              <p class="pred-value text-purple-600">{{ formatDate(prediction.ovulationDate) }}</p>
            </div>
            <!-- Akurasi -->
            <div class="pred-card border-slate-100 bg-gradient-to-br from-slate-50 to-white">
              <div class="pred-icon bg-slate-100">✨</div>
              <p class="pred-label text-slate-400">Akurasi</p>
              <p class="pred-value text-slate-600">{{ prediction.confidence }}%</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ══ 14 HARI TERAKHIR ══ -->
      <div class="mx-4">
        <div class="section-header">
          <div class="divider-line" />
          <span class="section-label">🗓 14 Hari Terakhir</span>
          <div class="divider-line" />
        </div>
        <div class="mt-3 overflow-hidden rounded-3xl border border-pink-100/60 bg-white shadow-sm">
          <div class="flex gap-1 overflow-x-auto px-3 py-3 no-scrollbar">
            <div
              v-for="day in calendarDays"
              :key="day.date"
              @click="selectedCalendarDate = day.date"
              class="flex flex-col items-center gap-1 shrink-0 cursor-pointer px-1 transition-all active:scale-90"
            >
              <p class="text-[9px] font-semibold text-slate-400 uppercase">{{ day.dayLabel }}</p>
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                :class="[
                  day.isHaid
                    ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-slate-50 text-slate-500',
                  day.date === selectedCalendarDate ? 'ring-2 ring-primary-400 scale-110' : '',
                  day.isToday && day.date !== selectedCalendarDate ? 'ring-2 ring-rose-300/60' : '',
                ]"
              >
                {{ day.dayNum }}
              </div>
              <div class="text-[11px] h-4 leading-none">{{ day.mood }}</div>
            </div>
          </div>
          <!-- Legend -->
          <div class="flex items-center justify-center gap-4 px-3 pb-3">
            <div class="flex items-center gap-1.5">
              <div class="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-400 to-pink-500" />
              <span class="text-[10px] text-slate-400">Haid</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="h-2.5 w-2.5 rounded-full bg-slate-100 ring-1 ring-rose-300" />
              <span class="text-[10px] text-slate-400">Hari ini</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="h-2.5 w-2.5 rounded-full bg-slate-100 ring-2 ring-primary-400" />
              <span class="text-[10px] text-slate-400">Dipilih</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ CATATAN HARIAN ══ -->
      <div class="mx-4">
        <div class="section-header">
          <div class="divider-line" />
          <span class="section-label">💕 Catatan Hari Ini</span>
          <div class="divider-line" />
        </div>

        <div class="mt-3 overflow-hidden rounded-3xl border border-pink-100/60 bg-white shadow-sm">
          <!-- Mood picker -->
          <div class="px-4 pt-4 pb-3 border-b border-pink-50">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-pink-400 mb-3">🌈 Mood Hari Ini</p>
            <MoodPicker v-model="todayMood" />
          </div>

          <!-- Symptom chips -->
          <div class="px-4 py-3 border-b border-pink-50">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-pink-400 mb-3">🩺 Gejala</p>
            <SymptomChips v-model:selected="todaySymptoms" />
          </div>

          <!-- Note textarea -->
          <div class="px-4 py-3">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-pink-400 mb-2">📝 Catatan</p>
            <textarea
              v-model="todayNote"
              placeholder="Catatan tambahan... (opsional)"
              rows="2"
              class="w-full px-3.5 py-3 rounded-2xl border border-pink-100 bg-pink-50/40 text-sm text-slate-700 outline-none resize-none focus:ring-2 focus:ring-pink-200 focus:border-pink-200 transition-all placeholder:text-slate-300"
            />
            <button
              @click="saveDailyLog"
              class="mt-3 w-full py-3 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 text-white font-bold text-sm active:scale-95 transition-all shadow-[0_8px_20px_-8px_rgba(244,114,182,0.6)] save-btn"
            >
              💾 Simpan Catatan
            </button>
          </div>
        </div>
      </div>

      <!-- ══ RIWAYAT HAID ══ -->
      <div class="mx-4">
        <div class="section-header">
          <div class="divider-line" />
          <span class="section-label">🌺 Riwayat Haid</span>
          <div class="divider-line" />
        </div>

        <div class="mt-3 overflow-hidden rounded-3xl border border-pink-100/60 bg-white shadow-sm">
          <EmptyState
            v-if="!cycleStore.cycles?.length"
            illustration="🌸"
            title="Belum ada riwayat haid"
            description="Catat siklus haidmu untuk mendapat prediksi yang akurat."
          />
          <div v-else class="divide-y divide-pink-50/80">
            <div
              v-for="(c, idx) in cycleStore.cycles.slice().reverse().slice(0, 6)"
              :key="c.id"
              class="flex items-center gap-3 px-4 py-3.5 history-row"
              :style="{ animationDelay: `${idx * 0.06}s` }"
            >
              <!-- Icon -->
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl"
                   :class="c.endDate ? 'bg-rose-50' : 'bg-amber-50'">
                <span class="text-lg">{{ c.endDate ? '🌸' : '⏳' }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-700 leading-tight">{{ formatDate(c.startDate) }}</p>
                <p class="text-xs text-slate-400 mt-0.5">→ {{ c.endDate ? formatDate(c.endDate) : 'Masih berlangsung' }}</p>
              </div>
              <div v-if="c.endDate"
                   class="shrink-0 flex flex-col items-end">
                <span class="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
                  {{ calcDuration(c.startDate, c.endDate) }} hari
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div><!-- end content -->

    <!-- ══ MODAL MULAI HAID ══ -->
    <ModalBase v-model="showMulaiModal" title="🌸 Mulai Haid">
      <div class="p-5 space-y-4">
        <!-- Decorative top -->
        <div class="flex justify-center">
          <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 ring-4 ring-white shadow-md">
            <span class="absolute inset-0 rounded-full bg-rose-200/30 animate-ping" />
            <span class="relative text-3xl">🌸</span>
          </div>
        </div>
        <div>
          <label class="text-xs font-bold uppercase tracking-[0.14em] text-rose-400 mb-1.5 block">Tanggal mulai</label>
          <input v-model="mulaiDate" type="date" :max="todayStr"
            class="w-full px-4 py-3 rounded-2xl border border-rose-100 bg-rose-50/40 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-rose-200 transition-all" />
        </div>
        <p class="text-xs text-slate-400 leading-relaxed bg-rose-50/60 rounded-2xl px-3 py-2.5 border border-rose-100/50">
          🤲 Mode haid aktif otomatis. Sholat & puasa wajib di-pause. Perbanyak doa & dzikir ya sayang.
        </p>
        <button
          @click="mulaiHaid"
          class="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm active:scale-95 transition-all shadow-[0_10px_24px_-10px_rgba(244,63,94,0.5)]"
        >
          🌸 Mulai Mode Haid
        </button>
      </div>
    </ModalBase>

    <!-- ══ MODAL SELESAI HAID ══ -->
    <ModalBase v-model="showSelesaiModal" title="✓ Haid Selesai?">
      <div class="p-5 space-y-4">
        <!-- Decorative top -->
        <div class="flex justify-center">
          <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-primary-100 ring-4 ring-white shadow-md">
            <span class="absolute inset-0 rounded-full bg-emerald-200/30 animate-ping" />
            <span class="relative text-3xl">🌷</span>
          </div>
        </div>
        <div>
          <label class="text-xs font-bold uppercase tracking-[0.14em] text-primary-500 mb-1.5 block">Tanggal selesai</label>
          <input v-model="selesaiDate" type="date" :max="todayStr"
            class="w-full px-4 py-3 rounded-2xl border border-primary-100 bg-primary-50/40 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary-200 transition-all" />
        </div>
        <p class="text-xs text-slate-400 leading-relaxed bg-emerald-50/60 rounded-2xl px-3 py-2.5 border border-emerald-100/50">
          Alhamdulillah 💕 Hutang qadha Ramadhan akan dihitung otomatis jika haid berlangsung di bulan Ramadhan.
        </p>
        <button
          @click="selesaiHaid"
          class="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-bold text-sm active:scale-95 transition-all shadow-[0_10px_24px_-10px_rgba(5,150,105,0.4)]"
        >
          ✓ Konfirmasi Selesai
        </button>
      </div>
    </ModalBase>

  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { RouterLink } from 'vue-router'
import { Settings } from 'lucide-vue-next'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
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

// Pre-load today's saved log data on mount
onMounted(() => {
  const existingLog = cycleStore.getDailyLog(todayStr)
  if (existingLog) {
    todayMood.value = existingLog.mood || ''
    todaySymptoms.value = existingLog.symptoms || []
    todayNote.value = existingLog.note || ''
  }
})

const cycleStatusLabel = computed(() => {
  if (cycleStore.isHaidActive) return `Hari ke-${cycleStore.currentHaidDay} · Mode Aktif`
  const days = cycleStore.daysUntilNext
  if (days === null) return 'Belum ada data siklus'
  if (days <= 0) return 'Perhatikan kondisi tubuhmu'
  return `${days} hari menuju siklus berikutnya`
})

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
/* ── Topbar star twinkle ── */
@keyframes tb-star-twinkle {
  0%, 100% { opacity: 0.25; transform: scale(1) rotate(0deg); }
  50%       { opacity: 0.7;  transform: scale(1.4) rotate(20deg); }
}
.tb-star { animation: tb-star-twinkle 2.6s ease-in-out infinite; }

/* ── Topbar icon bloom ── */
@keyframes tb-bloom {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.25); }
  50%       { box-shadow: 0 0 0 6px rgba(255,255,255,0); }
}
.tb-bloom { animation: tb-bloom 2.8s ease-in-out infinite; }

/* ── Hero status icon bounce ── */
@keyframes hero-icon-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  40%       { transform: translateY(-6px) scale(1.08); }
  60%       { transform: translateY(-3px) scale(1.04); }
}
.hero-icon-bounce { animation: hero-icon-bounce 3s ease-in-out infinite; }

/* ── Hero bloom ring ── */
@keyframes hero-bloom-ring {
  0%, 100% { transform: scale(1);    opacity: 0.4; }
  50%       { transform: scale(1.18); opacity: 0; }
}
.hero-bloom-ring { animation: hero-bloom-ring 2.5s ease-in-out infinite; }

/* ── Hero floating star ── */
@keyframes hero-star {
  0%, 100% { opacity: 0.25; transform: scale(1); }
  50%       { opacity: 0.7;  transform: scale(1.35) rotate(12deg); }
}
.hero-star { animation: hero-star 2.8s ease-in-out infinite; }

/* ── Hero floating petal ── */
@keyframes hero-petal {
  0%   { transform: translateY(0)    rotate(0deg);  opacity: 0.22; }
  50%  { transform: translateY(-8px) rotate(8deg);  opacity: 0.45; }
  100% { transform: translateY(0)    rotate(0deg);  opacity: 0.22; }
}
.hero-petal { animation: hero-petal 4s ease-in-out infinite; }

/* ── Prediction card bloom-in ── */
@keyframes bloom-in-anim {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.bloom-in-enter-active { animation: bloom-in-anim 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bloom-in-leave-active { transition: opacity 0.2s, transform 0.2s; }
.bloom-in-leave-to     { opacity: 0; transform: scale(0.96); }

/* ── History row slide-in ── */
@keyframes history-slide {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
.history-row { animation: history-slide 0.35s ease-out both; }

/* ── Save button ripple on active ── */
.save-btn:active {
  animation: none;
  transform: scale(0.96);
}

/* ── Section divider ── */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.divider-line {
  height: 1px;
  flex: 1;
  background: linear-gradient(to right, transparent, #fda4af, transparent);
}
.section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #fb7185;
  white-space: nowrap;
}

/* ── Prediction cards ── */
.pred-card {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border-width: 1px;
  padding: 0.875rem;
}
.pred-icon {
  font-size: 1rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
}
.pred-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.125rem;
}
.pred-value {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
