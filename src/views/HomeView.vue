<template>
  <PageWrapper title="">
    <template #topbar>
      <TopBar :show-back="false">
        <template #title>
          <div class="flex flex-col items-center gap-0.5">
            <div class="flex items-center gap-1.5">
              <span class="text-base leading-none">🌸</span>
              <h1 class="text-base font-extrabold text-slate-800 tracking-tight">Imani</h1>
              <span class="text-[9px] font-bold text-rose-400 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full leading-none">muslimah</span>
            </div>
            <p class="text-[10px] text-slate-400 leading-none">{{ todayFullDate }}</p>
          </div>
        </template>
        <template #right>
          <div class="flex items-center gap-0.5">
            <RouterLink
              to="/hijri-calendar"
              class="p-2 rounded-xl active:bg-rose-50 transition-colors flex flex-col items-center"
            >
              <Moon :size="17" class="text-rose-400" />
              <span class="text-[8px] font-semibold text-rose-400 leading-none mt-0.5 whitespace-nowrap">{{ hijriShort }}</span>
            </RouterLink>
            <RouterLink to="/settings" class="p-2 rounded-xl active:bg-slate-100 transition-colors">
              <Settings :size="20" class="text-slate-500" />
            </RouterLink>
          </div>
        </template>
      </TopBar>
    </template>

    <div class="pb-8">

      <!-- ══ HERO BANNER ══ -->
      <div class="relative overflow-hidden mx-4 mt-3 mb-4 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400 px-5 pt-5 pb-16 shadow-[0_20px_50px_-16px_rgba(244,114,182,0.55)]">
        <!-- Layered gradient overlays -->
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 rounded-3xl" />
        <div class="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div class="pointer-events-none absolute bottom-0 -left-6 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-2xl" />

        <!-- Floating animated stars -->
        <span class="anim-star absolute top-4 left-6 text-white/50 text-xs select-none" style="animation-delay:0s">✦</span>
        <span class="anim-star absolute top-8 right-14 text-white/40 text-[10px] select-none" style="animation-delay:0.7s">✧</span>
        <span class="anim-star absolute top-2 right-6 text-white/60 text-sm select-none" style="animation-delay:1.3s">✦</span>
        <span class="anim-star absolute bottom-6 left-10 text-white/30 text-xs select-none" style="animation-delay:0.4s">✧</span>
        <span class="anim-star absolute bottom-4 right-8 text-white/50 text-[10px] select-none" style="animation-delay:1.8s">✦</span>

        <!-- Floating petals -->
        <span class="anim-petal absolute top-3 right-20 text-white/30 text-xl select-none" style="animation-delay:0.2s">🌸</span>
        <span class="anim-petal absolute bottom-8 right-4 text-white/25 text-lg select-none" style="animation-delay:1s">🌷</span>
        <span class="anim-petal absolute top-10 left-2 text-white/20 text-base select-none" style="animation-delay:0.6s">🌺</span>

        <!-- Ornamental crescent -->
        <div class="pointer-events-none absolute top-3 right-5 anim-moon-glow">
          <div class="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center ring-1 ring-white/20">
            <span class="text-2xl">🌙</span>
          </div>
        </div>

        <!-- Content -->
        <div class="relative z-10">
          <p class="text-sm font-semibold text-white/80 mb-1" style="font-family: 'Scheherazade New', serif; direction: rtl; text-align: left; unicode-bidi: plaintext;">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          <h2 class="text-xl font-extrabold text-white leading-snug drop-shadow-sm">
            {{ greetingFull }},<br>
            <span class="text-white/90">{{ settingsStore.displayName || 'Saudariku' }} 🌸</span>
          </h2>
          <p class="mt-1.5 text-[11px] text-white/75 leading-relaxed max-w-[80%]">{{ dailyQuoteHero }}</p>
        </div>

        <!-- Ornamental bottom wave -->
        <div class="pointer-events-none absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 375 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
            <path d="M0 48 C60 20 120 10 187.5 28 C255 46 315 14 375 4 L375 48 Z" fill="white" fill-opacity="0.15"/>
            <path d="M0 48 C80 24 160 36 240 20 C300 8 340 30 375 48 Z" fill="white" fill-opacity="0.1"/>
          </svg>
        </div>
      </div>

      <!-- ══ PRAYER COUNTDOWN (tidak berubah) ══ -->
      <div class="px-4 -mt-10 relative z-10 mb-5">
        <PrayerCountdownCard />
      </div>

      <!-- ══ QUICK STATS ══ -->
      <div class="px-4 mb-5">
        <!-- Section heading -->
        <div class="flex items-center gap-2 mb-3">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400 flex items-center gap-1">
            <span>✦</span> Ringkasan Harianmu <span>✦</span>
          </span>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
        </div>

        <div class="grid grid-cols-2 gap-3 items-stretch">
          <StreakWidget class="min-w-0 h-full" />
          <div class="h-full">
            <CycleStatusBadge />
          </div>
        </div>
      </div>

      <!-- ══ MODE HAID BANNER ══ -->
      <div v-if="cycleStore.isHaidActive" class="px-4 mb-5 space-y-3">
        <!-- Soft title -->
        <div class="flex items-center gap-2">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400 flex items-center gap-1">
            <span>🌺</span> Mode Haid <span>🌺</span>
          </span>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
        </div>
        <HaidModeBanner @selesaiHaid="openSelesaiHaidModal" />
        <SpecialMomentBanner />
      </div>

      <!-- ══ JADWAL SHOLAT (tidak berubah) ══ -->
      <div class="mb-5">
        <PrayerChecklist />
      </div>

      <!-- ══ AMALAN SEKARANG ══ -->
      <div class="px-4 mb-5">
        <!-- Section heading -->
        <div class="flex items-center gap-2 mb-3">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
          <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400 flex items-center gap-1">
            <span>🌸</span> Amalan Sekarang <span>🌸</span>
          </span>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
        </div>
        <DynamicAmalCard />
      </div>

      <!-- ══ FASTING INFO CARD ══ -->
      <Transition name="fade-bloom">
        <div v-if="todayFastingType" class="mx-4 mb-5">
          <div class="relative overflow-hidden rounded-3xl border border-amber-100/80 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 px-4 py-4 shadow-sm shadow-amber-100/50">
            <!-- Decorative glow -->
            <div class="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-amber-200/30 blur-2xl" />
            <!-- Animated moon -->
            <div class="pointer-events-none absolute top-2 right-3 anim-moon-glow opacity-60">
              <span class="text-2xl">🌙</span>
            </div>
            <div class="relative flex items-center gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 ring-2 ring-amber-200/50">
                <span class="text-xl">🌙</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-500 mb-0.5">Puasa Sunnah Hari Ini</p>
                <p class="text-sm font-bold text-slate-800 leading-tight">{{ todayFastingType.name }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ todayFastingType.desc }}</p>
              </div>
              <button
                @click="logFasting"
                class="shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-90 shadow-sm"
                :class="fastingLogged
                  ? 'bg-emerald-100 text-emerald-700 opacity-70 cursor-default'
                  : 'bg-gradient-to-br from-amber-400 to-rose-400 text-white shadow-amber-200/50 active:shadow-none'"
              >
                {{ fastingLogged ? '✓ Dicatat' : 'Catat' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ══ DAILY MOTIVASI ══ -->
      <div class="mx-4 mb-2">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-50 border border-pink-100/70 px-4 py-4">
          <!-- Animated sparkle decorations -->
          <span class="anim-star absolute top-2 right-4 text-pink-300 text-sm select-none">✦</span>
          <span class="anim-star absolute bottom-3 right-10 text-fuchsia-300 text-xs select-none" style="animation-delay:1.1s">✧</span>
          <span class="anim-petal absolute top-1 left-3 text-base select-none opacity-40" style="animation-delay:0.5s">🌺</span>
          <div class="relative flex items-center gap-3">
            <div class="anim-bloom-pulse flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-200 to-rose-200 ring-2 ring-pink-200/40">
              <span class="text-xl">💎</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-pink-400 mb-0.5">Mutiara Hari Ini</p>
              <p class="text-xs text-slate-600 leading-relaxed italic">"{{ mutiaraHarian }}"</p>
            </div>
          </div>
        </div>
      </div>

    </div><!-- end main wrapper -->

    <!-- ══ MODAL SELESAI HAID ══ -->
    <ModalBase v-model="showSelesaiHaidModal" title="Konfirmasi Haid Selesai">
      <div class="p-5 space-y-4">
        <div>
          <label class="text-sm font-medium text-slate-700 mb-1 block">Tanggal selesai</label>
          <input v-model="selesaiDate" type="date" :max="todayStr" class="input-field" />
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          Setelah dikonfirmasi, mode haid akan dinonaktifkan dan jadwal ibadah harian akan tampil kembali.
        </p>
        <button
          @click="selesaiHaidFromBanner"
          class="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm active:scale-95 transition-all shadow-[0_10px_24px_-12px_rgba(244,63,94,0.5)]"
        >
          ✓ Konfirmasi Selesai
        </button>
      </div>
    </ModalBase>

    <!-- ══ MODAL CONGRATS HAID ══ -->
    <ModalBase v-model="showCongratsModal" title="Selamat, sayaaang! ✨">
      <div class="relative overflow-hidden p-5 text-center">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-pink-50 via-rose-50/80 to-transparent" />

        <!-- Floating decorations -->
        <span class="anim-petal pointer-events-none absolute top-4 left-6 text-xl opacity-30 select-none">🌸</span>
        <span class="anim-petal pointer-events-none absolute top-6 right-8 text-lg opacity-25 select-none" style="animation-delay:0.8s">🌷</span>
        <span class="anim-star pointer-events-none absolute top-2 right-16 text-pink-300 text-sm select-none" style="animation-delay:0.4s">✦</span>

        <div class="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 via-rose-100 to-amber-100 shadow-[0_16px_40px_-18px_rgba(244,114,182,0.55)] ring-4 ring-white">
          <span class="absolute inset-0 rounded-full bg-rose-200/30 animate-ping" />
          <span class="relative text-[2.6rem]">🌷</span>
        </div>

        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">Recovery Milestone</p>
        <h3 class="mt-2 text-xl font-bold tracking-tight text-slate-800">Alhamdulillah, fase haid telah selesai</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-500">
          Semoga tubuhmu kembali nyaman, hatimu tenang, dan Allah limpahkan keberkahan untuk ibadahmu hari ini.
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3 text-left">
          <div class="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400">Durasi</p>
            <p class="mt-1 text-base font-bold text-rose-700">{{ completedHaidSummary.durationDays }} hari</p>
          </div>
          <div class="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-500">Qadha</p>
            <p class="mt-1 text-base font-bold text-amber-700">
              {{ completedHaidSummary.qadhaAdded > 0 ? `${completedHaidSummary.qadhaAdded} hari` : 'Tidak ada' }}
            </p>
          </div>
        </div>

        <div class="mt-4 rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 via-white to-rose-50 px-4 py-3 text-left">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-pink-400">Pesan lembut</p>
          <p class="mt-1 text-sm leading-relaxed text-slate-600">
            Yuk lanjutkan hari dengan lembut. Checklist sholat dan rutinitas ibadah harianmu sudah siap kembali 🌸
          </p>
        </div>

        <button
          @click="showCongratsModal = false"
          class="mt-5 w-full rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(236,72,153,0.75)] active:scale-95 transition-all"
        >
          Siap lanjut ibadah 💖
        </button>
      </div>
    </ModalBase>
  </PageWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Settings, Moon } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { getMutiaraHarian } from '@/data/mutiaraMuslimah'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import TopBar from '@/components/layout/TopBar.vue'
import HaidModeBanner from '@/components/dashboard/HaidModeBanner.vue'
import SpecialMomentBanner from '@/components/home/SpecialMomentBanner.vue'
import StreakWidget from '@/components/dashboard/StreakWidget.vue'
import CycleStatusBadge from '@/components/dashboard/CycleStatusBadge.vue'
import PrayerCountdownCard from '@/components/dashboard/PrayerCountdownCard.vue'
import DynamicAmalCard from '@/components/dashboard/DynamicAmalCard.vue'
import PrayerChecklist from '@/components/dashboard/PrayerChecklist.vue'
import ModalBase from '@/components/ui/ModalBase.vue'

import { useSettingsStore } from '@/stores/settings'
import { useCycleStore } from '@/stores/cycle'
import { useFastingStore } from '@/stores/fasting'
import { useHijriDate } from '@/composables/useHijriDate'

const settingsStore = useSettingsStore()
const cycleStore = useCycleStore()
const fastingStore = useFastingStore()
const { formatHijri, isTodaySunnahFast } = useHijriDate()

const todayDate = dayjs()
const hijriDateStr = computed(() => formatHijri(todayDate))
const hijriShort = computed(() => {
  const str = String(hijriDateStr.value || '')
  const parts = str.split(',')
  return parts.length > 1 ? parts[1].trim() : str
})

const HOUR = todayDate.hour()
const greeting = HOUR < 11 ? 'Pagi' : HOUR < 15 ? 'Siang' : HOUR < 18 ? 'Sore' : 'Malam'
const greetingFull = HOUR < 11 ? 'Selamat Pagi' : HOUR < 15 ? 'Selamat Siang' : HOUR < 18 ? 'Selamat Sore' : 'Selamat Malam'

// Daily quotes for hero banner (rotates by date)
const DAILY_QUOTES = [
  'Mulai hari ini dengan basmalah, akhiri dengan syukur. ✨',
  'Setiap langkahmu dengan niat ibadah adalah pahala. 🌸',
  'Hatimu yang lembut adalah anugerah. Jaga selalu. 💕',
  'Doa adalah senjata terkuat seorang muslimah. 🤲',
  'Istiqomah dalam hal kecil lebih dicintai Allah. 🌷',
  'Kecantikan sejati terpancar dari akhlak yang mulia. 💎',
  'Setiap rintangan adalah tangga menuju kemuliaan. 🌺',
]
const quoteIdx = todayDate.date() % DAILY_QUOTES.length
const dailyQuoteHero = DAILY_QUOTES[quoteIdx]

// Mutiara harian dari bank besar — acak berdasarkan tanggal
const mutiaraHarian = getMutiaraHarian()

// Toolbar date
const todayFullDate = todayDate.format('ddd, D MMM YYYY')

const todayStr = dayjs().format('YYYY-MM-DD')
const selesaiDate = ref(todayStr)
const showSelesaiHaidModal = ref(false)
const showCongratsModal = ref(false)
const completedHaidSummary = ref({ durationDays: 0, qadhaAdded: 0, duringRamadhan: false })

function openSelesaiHaidModal() {
  selesaiDate.value = todayStr
  showSelesaiHaidModal.value = true
}

function selesaiHaidFromBanner() {
  const result = cycleStore.selesaiHaid(selesaiDate.value)
  if (!result?.success) {
    window.$toast?.(result?.message || 'Belum bisa menyelesaikan mode haid.', 'warning')
    return
  }
  completedHaidSummary.value = {
    durationDays: result.durationDays,
    qadhaAdded: result.qadhaAdded,
    duringRamadhan: result.duringRamadhan,
  }
  showSelesaiHaidModal.value = false
  showCongratsModal.value = true
  window.$toast?.('Alhamdulillah, haid selesai 💕', 'success')
  window.$reward?.('Alhamdulillah! 🎉', 'Semoga Allah jaga kesehatanmu dan mudahkan ibadahmu')
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

<style scoped>
/* ── Floating star twinkle ── */
@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
  50%       { opacity: 0.9; transform: scale(1.35) rotate(15deg); }
}
.anim-star {
  animation: star-twinkle 2.4s ease-in-out infinite;
}

/* ── Floating petal drift ── */
@keyframes petal-float {
  0%   { transform: translateY(0)   rotate(0deg);   opacity: 0.25; }
  33%  { transform: translateY(-8px) rotate(8deg);  opacity: 0.5; }
  66%  { transform: translateY(-4px) rotate(-5deg); opacity: 0.35; }
  100% { transform: translateY(0)   rotate(0deg);   opacity: 0.25; }
}
.anim-petal {
  animation: petal-float 4s ease-in-out infinite;
}

/* ── Moon glow pulse ── */
@keyframes moon-glow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(255,255,255,0.4)); transform: scale(1); }
  50%       { filter: drop-shadow(0 0 14px rgba(255,255,255,0.75)); transform: scale(1.06); }
}
.anim-moon-glow {
  animation: moon-glow 3s ease-in-out infinite;
}

/* ── Bloom pulse for icon ── */
@keyframes bloom-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244,114,182,0.3); }
  50%       { box-shadow: 0 0 0 8px rgba(244,114,182,0); }
}
.anim-bloom-pulse {
  animation: bloom-pulse 2.5s ease-in-out infinite;
}

/* ── Section fade-in on mount ── */
@keyframes fade-bloom-in {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.fade-bloom-enter-active {
  animation: fade-bloom-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-bloom-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-bloom-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
