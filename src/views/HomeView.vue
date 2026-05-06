<template>
  <PageWrapper title="">
    <template #topbar>
      <TopBar :show-back="false">
        <template #title>
          <div class="flex flex-col items-center">
            <RouterLink
              to="/hijri-calendar"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 active:scale-95 transition-all"
            >
              <span class="text-[10px]">🌙</span>
              <span class="text-[10px] font-semibold text-rose-500">{{ hijriDateStr }}</span>
            </RouterLink>
            <h1 class="text-base font-bold text-slate-800 leading-tight mt-0.5">
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

    <div class="space-y-5 pb-6">
      <!-- Prayer countdown hero -->
      <div class="px-4 pt-2">
        <PrayerCountdownCard />
      </div>

      <!-- Quick stats row -->
      <div class="px-4 grid grid-cols-2 gap-3 sm:grid-cols-2 items-stretch">
        <StreakWidget class="min-w-0 h-full" />
        <div class="h-full">
          <CycleStatusBadge />
        </div>
      </div>

      <!-- Mode Haid Banner -->
      <div v-if="cycleStore.isHaidActive" class="px-4">
        <HaidModeBanner @selesaiHaid="openSelesaiHaidModal" />
      </div>

      <!-- Sholat quick checklist -->
      <PrayerChecklist />

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
          class="w-full py-3 rounded-2xl bg-primary-600 text-white font-semibold text-sm active:scale-95 transition-all"
        >
          ✓ Konfirmasi Selesai
        </button>
      </div>
    </ModalBase>

    <ModalBase v-model="showCongratsModal" title="Selamat, sayaaang! ✨">
      <div class="relative overflow-hidden p-5 text-center">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-pink-50 via-rose-50/80 to-transparent" />

        <div class="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 via-rose-100 to-amber-100 shadow-[0_16px_40px_-18px_rgba(244,114,182,0.55)] ring-4 ring-white">
          <span class="absolute inset-0 rounded-full bg-white/25 animate-ping" />
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
          class="mt-5 w-full rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-primary-500 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(236,72,153,0.75)] active:scale-95 transition-all"
        >
          Siap lanjut ibadah 💖
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
const hijriDateShort = computed(() => {
  const parts = String(hijriDateStr.value || '').split(',')
  return parts.length > 1 ? parts[1].trim() : hijriDateStr.value
})

const HOUR = todayDate.hour()
const greeting = HOUR < 11 ? 'Selamat Pagi' : HOUR < 15 ? 'Selamat Siang' : HOUR < 18 ? 'Selamat Sore' : 'Selamat Malam'

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
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
