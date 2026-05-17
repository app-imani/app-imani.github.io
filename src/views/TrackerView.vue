<template>
  <PageWrapper>
    <!-- ── Topbar ── -->
    <template #topbar>
      <div class="tracker-header px-4 pt-safe-top pb-4">
        <!-- Title row -->
        <div class="pt-3 mb-3">
          <h1 class="text-xl font-extrabold text-slate-800 leading-tight">Tracker Ibadah</h1>
          <p class="text-xs text-slate-500 mt-0.5">Semua fitur dalam satu tempat ✦</p>
        </div>

        <!-- Quick stats strip -->
        <div class="flex gap-2">
          <div
            v-for="stat in quickStats"
            :key="stat.label"
            class="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-white/80 shadow-sm"
          >
            <p class="text-lg font-extrabold leading-none" :class="stat.color">{{ stat.value }}</p>
            <p class="text-[10px] text-slate-500 mt-0.5 leading-tight">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Body ── -->
    <div class="px-4 py-4 space-y-3 pb-6">

      <!-- ✦ Quick Access Grid -->
      <section>
        <div class="flex items-center gap-2 mb-2.5">
          <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Akses Cepat</span>
          <div class="flex-1 h-px bg-slate-100" />
        </div>
        <div class="grid grid-cols-4 gap-2">
          <RouterLink
            v-for="quick in QUICK_ACCESS"
            :key="quick.to"
            :to="quick.to"
            class="quick-tile flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1 active:scale-95 transition-transform"
            :style="{ background: quick.bg }"
          >
            <span class="text-2xl">{{ quick.emoji }}</span>
            <span class="text-[10px] font-semibold text-center leading-tight" :class="quick.textColor">{{ quick.label }}</span>
          </RouterLink>
        </div>
      </section>

      <!-- ✦ Accordion sections -->
      <section>
        <div class="flex items-center gap-2 mb-2.5">
          <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Semua Fitur</span>
          <div class="flex-1 h-px bg-slate-100" />
          <button class="text-[10px] text-primary-500 font-semibold" @click="toggleAll">
            {{ allOpen ? 'Tutup semua' : 'Buka semua' }}
          </button>
        </div>

        <div class="space-y-2">
          <template v-for="section in SECTIONS" :key="section.key">

            <!-- ── SINGLE-ITEM: direct RouterLink (1 tap) ── -->
            <RouterLink
              v-if="section.items.length === 1"
              :to="section.items[0].to"
              class="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-slate-100 shadow-sm bg-white active:scale-[0.98] transition-transform block"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
                :style="{ background: section.iconBg }"
              >
                {{ section.emoji }}
              </div>
              <div class="flex-1 text-left">
                <p class="font-bold text-slate-800 text-sm leading-tight">{{ section.title }}</p>
                <p class="text-[11px] text-slate-500 leading-tight mt-0.5">{{ section.subtitle }}</p>
              </div>
              <div
                class="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                :style="{ background: section.items[0].arrowBg }"
              >
                <ChevronRight :size="14" :style="{ color: section.items[0].arrowColor }" />
              </div>
            </RouterLink>

            <!-- ── MULTI-ITEM: accordion ── -->
            <div
              v-else
              class="rounded-2xl overflow-hidden border shadow-sm transition-all duration-200"
              :class="openSections.has(section.key) ? 'border-slate-200 shadow-md' : 'border-slate-100'"
            >
              <!-- Section header toggle -->
              <button
                class="w-full flex items-center gap-3 px-4 py-3.5 transition-colors"
                :class="openSections.has(section.key) ? section.headerOpenBg : 'bg-white'"
                @click="toggleSection(section.key)"
              >
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
                  :style="{ background: section.iconBg }"
                >
                  {{ section.emoji }}
                </div>
                <div class="flex-1 text-left">
                  <p class="font-bold text-slate-800 text-sm leading-tight">{{ section.title }}</p>
                  <p class="text-[11px] text-slate-500 leading-tight mt-0.5">{{ section.subtitle }}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="openSections.has(section.key) ? section.badgeActiveClass : 'bg-slate-100 text-slate-500'"
                  >
                    {{ section.items.length }} fitur
                  </span>
                  <ChevronDown
                    :size="16"
                    class="text-slate-400 transition-transform duration-300"
                    :class="openSections.has(section.key) ? 'rotate-180' : ''"
                  />
                </div>
              </button>

              <!-- Expandable items -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[500px]"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 max-h-[500px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="openSections.has(section.key)" class="overflow-hidden">
                  <div class="h-px mx-4" :style="{ background: section.dividerColor }" />
                  <div class="px-3 py-2.5 space-y-1.5">
                    <RouterLink
                      v-for="item in section.items"
                      :key="item.to"
                      :to="item.to"
                      class="feature-item flex items-center gap-3 rounded-xl px-3 py-2.5 active:scale-[0.98] transition-transform"
                      :style="{ background: item.bg }"
                    >
                      <div
                        class="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        :style="{ background: item.iconBg }"
                      >
                        {{ item.emoji }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-slate-800 text-sm leading-tight">{{ item.label }}</p>
                        <p class="text-[11px] text-slate-500 mt-0.5 leading-tight">{{ item.desc }}</p>
                      </div>
                      <div
                        class="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                        :style="{ background: item.arrowBg }"
                      >
                        <ChevronRight :size="14" :style="{ color: item.arrowColor }" />
                      </div>
                    </RouterLink>
                  </div>
                </div>
              </Transition>
            </div>

          </template>
        </div>
      </section>

      <!-- ✦ Ornamental footer -->
      <div class="text-center py-2">
        <p class="text-[11px] text-slate-400 font-medium">
          ✦ &nbsp;يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ&nbsp; ✦
        </p>
      </div>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import { useAmalStore } from '@/stores/amal'
import { usePrayerStore } from '@/stores/prayer'
import { useQuranStore } from '@/stores/quran'
import { useFastingStore } from '@/stores/fasting'
import { useCycleStore } from '@/stores/cycle'

const amalStore = useAmalStore()
const prayerStore = usePrayerStore()
const quranStore = useQuranStore()
const fastingStore = useFastingStore()
const cycleStore = useCycleStore()

// Tilawah hari ini: misal "4 hlm" atau "✓ 2 hlm"
const quranTodayDisplay = computed(() => {
  const pages = quranStore.todayProgress?.pages ?? 0
  const target = quranStore.todayTarget ?? 2
  if (pages === 0) return `0/${target} hlm`
  return pages >= target ? `✓ ${pages} hlm` : `${pages}/${target} hlm`
})

// ─── Quick Stats ───────────────────────────────────────────────
const quickStats = computed(() => [
  {
    label: 'Streak Amalan',
    value: `${amalStore.currentStreak ?? 0} hari`,
    color: 'text-amber-500',
  },
  {
    label: 'Sholat Hari Ini',
    value: prayerCompletedToday.value,
    color: 'text-emerald-600',
  },
  {
    label: 'Tilawah Hari Ini',
    value: quranTodayDisplay.value,
    color: 'text-rose-500',
  },
])

const prayerCompletedToday = computed(() => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const log = prayerStore.logs?.[today]
    if (!log) return '0/5'
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
    const done = prayers.filter(p => log[p] && log[p] !== 'skip').length
    return `${done}/5`
  } catch { return '0/5' }
})

// ─── Quick Access (4-grid) ─────────────────────────────────────
const QUICK_ACCESS = [
  {
    to: '/prayer',
    emoji: '🕌',
    label: 'Jadwal Sholat',
    bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)',
    textColor: 'text-emerald-700',
  },
  {
    to: '/cycle',
    emoji: '🌸',
    label: 'Siklus',
    bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)',
    textColor: 'text-rose-600',
  },
  {
    to: '/quran',
    emoji: '📖',
    label: "Al-Qur'an",
    bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
    textColor: 'text-green-700',
  },
  {
    to: '/amal',
    emoji: '⭐',
    label: 'Amalan',
    bg: 'linear-gradient(135deg,#fefce8,#fef9c3)',
    textColor: 'text-amber-700',
  },
]

// ─── Accordion sections ────────────────────────────────────────
const SECTIONS = [
  {
    key: 'sholat',
    emoji: '🕌',
    title: 'Sholat',
    subtitle: 'Jadwal, wirid & tasbih harian',
    iconBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
    headerOpenBg: 'bg-emerald-50',
    badgeActiveClass: 'bg-emerald-100 text-emerald-700',
    dividerColor: '#d1fae5',
    items: [
      {
        to: '/prayer', emoji: '🕌', label: 'Jadwal Sholat',
        desc: 'Pantau sholat 5 waktu hari ini',
        bg: '#f0fdf4', iconBg: '#d1fae5', arrowBg: '#d1fae5', arrowColor: '#059669',
      },
      {
        to: '/wirid', emoji: '📿', label: 'Wirid Sholat',
        desc: 'Dzikir & doa setelah sholat',
        bg: '#f0fdf4', iconBg: '#ccfbf1', arrowBg: '#ccfbf1', arrowColor: '#0d9488',
      },
      {
        to: '/tasbih', emoji: '🔢', label: 'Tasbih Digital',
        desc: 'Hitung dzikir dengan mudah',
        bg: '#f0fdf4', iconBg: '#e0e7ff', arrowBg: '#e0e7ff', arrowColor: '#4f46e5',
      },
    ],
  },
  {
    key: 'puasa',
    emoji: '🌙',
    title: 'Puasa',
    subtitle: 'Log puasa & kalender Hijriah',
    iconBg: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    headerOpenBg: 'bg-amber-50',
    badgeActiveClass: 'bg-amber-100 text-amber-700',
    dividerColor: '#fde68a',
    items: [
      {
        to: '/fasting', emoji: '🌙', label: 'Tracker Puasa',
        desc: 'Catat puasa sunnah & wajib',
        bg: '#fffbeb', iconBg: '#fef3c7', arrowBg: '#fef3c7', arrowColor: '#d97706',
      },
      {
        to: '/hijri-calendar', emoji: '📅', label: 'Kalender Hijriah',
        desc: 'Lihat tanggal & hari istimewa',
        bg: '#fffbeb', iconBg: '#ede9fe', arrowBg: '#ede9fe', arrowColor: '#7c3aed',
      },
    ],
  },
  {
    key: 'quran',
    emoji: '📖',
    title: "Al-Qur'an",
    subtitle: 'Tilawah & progres khatam',
    iconBg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
    headerOpenBg: 'bg-green-50',
    badgeActiveClass: 'bg-green-100 text-green-700',
    dividerColor: '#bbf7d0',
    items: [
      {
        to: '/quran', emoji: '📖', label: "Al-Qur'an & Tilawah",
        desc: 'Baca & catat tilawah harian',
        bg: '#f0fdf4', iconBg: '#dcfce7', arrowBg: '#dcfce7', arrowColor: '#16a34a',
      },
    ],
  },
  {
    key: 'siklus',
    emoji: '🌸',
    title: 'Siklus',
    subtitle: 'Pantau haid & prediksi siklus',
    iconBg: 'linear-gradient(135deg,#ffe4e6,#fecdd3)',
    headerOpenBg: 'bg-rose-50',
    badgeActiveClass: 'bg-rose-100 text-rose-600',
    dividerColor: '#fecdd3',
    items: [
      {
        to: '/cycle', emoji: '🌸', label: 'Siklus Haid',
        desc: 'Pantau siklus & catat harian',
        bg: '#fff1f2', iconBg: '#ffe4e6', arrowBg: '#ffe4e6', arrowColor: '#e11d48',
      },
    ],
  },
  {
    key: 'amalan',
    emoji: '⭐',
    title: 'Amalan',
    subtitle: 'Catatan harian, kalender & laporan',
    iconBg: 'linear-gradient(135deg,#fef9c3,#fde68a)',
    headerOpenBg: 'bg-yellow-50',
    badgeActiveClass: 'bg-yellow-100 text-yellow-700',
    dividerColor: '#fde68a',
    items: [
      {
        to: '/amal', emoji: '⭐', label: 'Amalan Harian',
        desc: 'Log ibadah & amalan sunnah',
        bg: '#fefce8', iconBg: '#fef9c3', arrowBg: '#fef9c3', arrowColor: '#ca8a04',
      },
      {
        to: '/amal/kalender', emoji: '📆', label: 'Kalender Amalan',
        desc: 'Lihat riwayat amalan bulanan',
        bg: '#fefce8', iconBg: '#dbeafe', arrowBg: '#dbeafe', arrowColor: '#2563eb',
      },
      {
        to: '/amal/laporan', emoji: '📊', label: 'Laporan Amalan',
        desc: 'Analisis tren ibadah mingguan',
        bg: '#fefce8', iconBg: '#fce7f3', arrowBg: '#fce7f3', arrowColor: '#db2777',
      },
    ],
  },
]

// ─── Accordion state ───────────────────────────────────────────
const openSections = ref(new Set(['sholat'])) // default: sholat terbuka

function toggleSection(key) {
  if (openSections.value.has(key)) {
    openSections.value.delete(key)
  } else {
    openSections.value.add(key)
  }
  // Force reactivity
  openSections.value = new Set(openSections.value)
}

const allOpen = computed(() => openSections.value.size === SECTIONS.length)

function toggleAll() {
  if (allOpen.value) {
    openSections.value = new Set()
  } else {
    openSections.value = new Set(SECTIONS.map(s => s.key))
  }
}
</script>

<style scoped>
.pt-safe-top { padding-top: env(safe-area-inset-top, 0px); }

.tracker-header {
  background: linear-gradient(160deg, #fdf2f8 0%, #f0fdf4 60%, #ecfdf5 100%);
  border-bottom: 1px solid #f1f5f9;
}

/* Quick access tiles */
.quick-tile {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid rgba(255,255,255,0.8);
}

/* Feature item hover/active feel */
.feature-item {
  border: 1px solid rgba(0,0,0,0.04);
}

/* Smooth accordion (CSS max-height trick) */
.max-h-0 { max-height: 0; }
.max-h-\[500px\] { max-height: 500px; }
</style>
