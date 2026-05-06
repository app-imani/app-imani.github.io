<template>
  <div
    v-if="showHeader ? !cycleStore.isHaidActive : true"
    class="mx-4 rounded-3xl bg-white border border-slate-100/80 shadow-sm overflow-hidden"
    :class="showHeader ? '' : 'border-0 bg-transparent shadow-none rounded-none mx-0'"
  >
    <!-- Header -->
    <div v-if="showHeader" class="px-4 pt-4 pb-3 border-b border-slate-50">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <!-- Progress ring-style indicator -->
          <div
            class="relative flex h-10 w-10 items-center justify-center rounded-2xl shrink-0"
            :class="prayerProgressPercent === 100 ? 'bg-emerald-100' : prayerProgressPercent > 0 ? 'bg-amber-50' : 'bg-slate-100'"
          >
            <span
              class="text-sm font-black"
              :class="prayerProgressPercent === 100 ? 'text-emerald-600' : prayerProgressPercent > 0 ? 'text-amber-600' : 'text-slate-400'"
            >
              {{ completedPrayerCount }}
            </span>
            <span v-if="prayerProgressPercent === 100" class="absolute -top-1 -right-1 text-xs">🏆</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-800 leading-none">Sholat Hari Ini</h2>
            <p class="text-xs text-slate-400 mt-0.5">{{ completedPrayerCount }}/{{ PRAYERS.length }} waktu tercatat</p>
          </div>
        </div>
        <RouterLink
          to="/prayer"
          class="shrink-0 flex items-center gap-1 text-xs text-primary-600 font-semibold bg-primary-50 px-3 py-1.5 rounded-xl active:scale-95 transition-all"
        >
          Lihat <span class="hidden xs:inline">semua</span> →
        </RouterLink>
      </div>

      <!-- Progress bar -->
      <div class="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="prayerProgressPercent === 100 ? 'bg-gradient-to-r from-emerald-400 to-primary-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'"
          :style="{ width: `${prayerProgressPercent}%` }"
        />
      </div>

      <!-- Info chips -->
      <div class="mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <RouterLink
          to="/hijri-calendar"
          class="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 px-2.5 py-1.5 active:scale-95 transition-all"
        >
          <span class="text-[10px]">🌙</span>
          <span class="text-[11px] font-bold text-rose-600 whitespace-nowrap">{{ hijriDateShort }}</span>
        </RouterLink>
        <div v-if="todayFastingType" class="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-2.5 py-1.5">
          <span class="text-[10px]">🌙</span>
          <span class="text-[11px] font-bold text-amber-700 whitespace-nowrap">{{ todayFastingType.name }}</span>
        </div>
      </div>
    </div>

    <!-- Prayer list -->
    <div class="p-3 space-y-2">
      <button
        v-for="p in PRAYERS"
        :key="p.key"
        @click="openStatusModal(p)"
        class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all active:scale-[0.98] text-left"
        :class="prayerCardClass(p.key)"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" :class="prayerIconBg(p.key)">
          <component :is="PRAYER_ICONS[p.key]" :size="14" :class="prayerIconColor(p.key)" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-700 leading-none">{{ p.name }}</p>
          <p v-if="prayerTimes?.[p.key]" class="text-xs text-slate-400 mt-0.5">{{ prayerTimes[p.key] }}</p>
        </div>
        <div
          v-if="getStatus(p.key)"
          class="flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-bold"
          :class="statusBadgeClass(getStatus(p.key))"
        >
          <span>{{ STATUS_EMOJI[getStatus(p.key)] }}</span>
          <span>{{ STATUS_SHORT[getStatus(p.key)] }}</span>
        </div>
        <div v-else class="h-6 w-6 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
          <Plus :size="10" class="text-slate-300" />
        </div>
      </button>
    </div>

    <!-- Status modal -->
    <ModalBase v-model="showStatusModal" :title="`Catat Sholat ${selectedPrayer?.name || ''}`">
      <div class="p-5 space-y-3">
        <!-- Prayer header -->
        <div
          class="flex items-center gap-3 rounded-2xl px-4 py-3 border"
          :class="selectedPrayer ? prayerCardClass(selectedPrayer.key) : 'bg-slate-50 border-slate-100'"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl"
            :class="selectedPrayer ? prayerIconBg(selectedPrayer.key) : 'bg-slate-100'"
          >
            <component v-if="selectedPrayer" :is="PRAYER_ICONS[selectedPrayer.key]" :size="18" :class="prayerIconColor(selectedPrayer.key)" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800">{{ selectedPrayer?.name }}</p>
            <p class="text-xs text-slate-400">Hari Ini</p>
          </div>
          <div
            v-if="getStatus(selectedPrayer?.key)"
            class="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold"
            :class="statusBadgeClass(getStatus(selectedPrayer?.key))"
          >
            <span>{{ STATUS_EMOJI[getStatus(selectedPrayer?.key)] }}</span>
            <span>{{ STATUS_SHORT[getStatus(selectedPrayer?.key)] }}</span>
          </div>
        </div>

        <!-- Status options -->
        <div class="grid grid-cols-2 gap-2.5">
          <button
            v-for="s in PRAYER_STATUSES"
            :key="s.value"
            @click="setPrayerStatus(s.value)"
            class="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all active:scale-95"
            :class="getStatus(selectedPrayer?.key) === s.value
              ? 'border-primary-400 bg-primary-50 shadow-md shadow-primary-100'
              : 'border-slate-100 bg-white hover:border-primary-200'"
          >
            <span class="text-2xl">{{ s.emoji }}</span>
            <span class="text-xs font-bold text-slate-700">{{ s.label }}</span>
            <span v-if="getStatus(selectedPrayer?.key) === s.value" class="text-[10px] font-semibold text-primary-500">✓ Dipilih</span>
          </button>
        </div>

        <!-- Skip -->
        <button
          @click="setPrayerStatus('skip')"
          class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all active:scale-95"
          :class="getStatus(selectedPrayer?.key) === 'skip'
            ? 'border-red-300 bg-red-50 text-red-500'
            : 'border-slate-100 bg-white text-slate-400 hover:border-red-200 hover:text-red-400'"
        >
          <X :size="16" />
          <span class="text-sm font-semibold">Tidak Sholat</span>
        </button>

        <!-- Clear -->
        <button
          v-if="getStatus(selectedPrayer?.key)"
          @click="setPrayerStatus(null)"
          class="w-full text-xs text-slate-400 py-1 active:opacity-60"
        >
          Hapus catatan
        </button>
      </div>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Sun, Sunset, Moon, Star, Clock, Plus, X } from 'lucide-vue-next'
import dayjs from 'dayjs'

import ModalBase from '@/components/ui/ModalBase.vue'
import { usePrayerStore } from '@/stores/prayer'
import { useCycleStore } from '@/stores/cycle'
import { useHijriDate } from '@/composables/useHijriDate'

const props = defineProps({
  /** YYYY-MM-DD — defaults to today */
  date:        { type: String,  default: () => dayjs().format('YYYY-MM-DD') },
  /** Prayer schedule times object { fajr, dhuhr, asr, maghrib, isha } */
  prayerTimes: { type: Object,  default: null },
  /** Show the header section (progress, chips, link). Set false in PrayerView. */
  showHeader:  { type: Boolean, default: true },
})

const prayerStore = usePrayerStore()
const cycleStore = useCycleStore()
const { formatHijri, isTodaySunnahFast } = useHijriDate()

const todayDate = dayjs()
const hijriDateStr = computed(() => formatHijri(todayDate))
const hijriDateShort = computed(() => {
  const parts = String(hijriDateStr.value || '').split(',')
  return parts.length > 1 ? parts[1].trim() : hijriDateStr.value
})
const todayFastingType = computed(() => isTodaySunnahFast())

/** Unified status getter — works for any date */
function getStatus(key) {
  if (!key) return null
  return prayerStore.getStatus(props.date, key)
}

const PRAYERS = [
  { key: 'fajr',    name: 'Subuh'   },
  { key: 'dhuhr',   name: 'Dzuhur'  },
  { key: 'asr',     name: 'Ashar'   },
  { key: 'maghrib', name: 'Maghrib' },
  { key: 'isha',    name: 'Isya'    },
]

const PRAYER_ICONS = { fajr: Sun, dhuhr: Clock, asr: Sunset, maghrib: Moon, isha: Star }

const PRAYER_THEMES = {
  fajr:    { card: 'bg-sky-50/80 border-sky-100',       iconBg: 'bg-sky-100',    iconColor: 'text-sky-500'    },
  dhuhr:   { card: 'bg-amber-50/80 border-amber-100',   iconBg: 'bg-amber-100',  iconColor: 'text-amber-500'  },
  asr:     { card: 'bg-orange-50/80 border-orange-100', iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  maghrib: { card: 'bg-pink-50/80 border-pink-100',     iconBg: 'bg-pink-100',   iconColor: 'text-pink-500'   },
  isha:    { card: 'bg-violet-50/80 border-violet-100', iconBg: 'bg-violet-100', iconColor: 'text-violet-500' },
}

const PRAYER_STATUSES = [
  { value: 'tepat_waktu', label: 'Tepat Waktu', emoji: '⏰'  },
  { value: 'terlambat',   label: 'Terlambat',   emoji: '🕰️' },
  { value: 'berjamaah',   label: 'Berjamaah',   emoji: '🕌'  },
  { value: 'munfarid',    label: 'Munfarid',     emoji: '🤲' },
]

const STATUS_SHORT = { tepat_waktu: 'Tepat', terlambat: 'Lambat', berjamaah: 'Jamaah', munfarid: 'Munfarid', skip: 'Lewat' }
const STATUS_EMOJI = { tepat_waktu: '⏰', terlambat: '🕰️', berjamaah: '🕌', munfarid: '🤲', skip: '✗' }

function prayerCardClass(key) {
  const theme = PRAYER_THEMES[key]
  const status = getStatus(key)
  if (!theme) return 'bg-white border-slate-100'
  if (status && status !== 'skip') return theme.card
  if (status === 'skip') return 'bg-red-50/60 border-red-100'
  return 'bg-white border-slate-100'
}
function prayerIconBg(key)    { return PRAYER_THEMES[key]?.iconBg    || 'bg-slate-100'   }
function prayerIconColor(key) { return PRAYER_THEMES[key]?.iconColor || 'text-slate-400' }

function statusBadgeClass(status) {
  if (status === 'tepat_waktu') return 'bg-emerald-100 text-emerald-700'
  if (status === 'berjamaah')   return 'bg-primary-100 text-primary-700'
  if (status === 'terlambat')   return 'bg-amber-100 text-amber-700'
  if (status === 'munfarid')    return 'bg-sky-100 text-sky-700'
  if (status === 'skip')        return 'bg-red-100 text-red-500'
  return 'bg-slate-100 text-slate-500'
}

const completedPrayerCount  = computed(() => PRAYERS.filter((p) => !!getStatus(p.key)).length)
const prayerProgressPercent = computed(() => Math.round((completedPrayerCount.value / PRAYERS.length) * 100))

const showStatusModal = ref(false)
const selectedPrayer  = ref(null)

function openStatusModal(prayer) {
  selectedPrayer.value  = prayer
  showStatusModal.value = true
}

function setPrayerStatus(status) {
  if (!selectedPrayer.value) return
  prayerStore.setStatus(selectedPrayer.value.key, status, props.date)
  showStatusModal.value = false
  if (status === null) return
  if (status === 'skip')         window.$toast?.('Semoga besok lebih baik ya 💕', 'warning')
  else if (status === 'berjamaah') { window.$toast?.('MasyaAllah, sholat berjamaah! 🕌', 'success'); window.$reward?.('MasyaAllah! 🌟', 'Sholat berjamaah dicatat') }
  else if (status === 'tepat_waktu') window.$toast?.('Alhamdulillah, tepat waktu! ⏰', 'success')
  else window.$toast?.('Alhamdulillah 🤲', 'success')
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
