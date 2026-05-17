<template>
  <PageWrapper>
    <template #topbar>
      <div class="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 px-4 pt-safe" style="padding-top: max(env(safe-area-inset-top), 12px); padding-bottom: 0;">
        <!-- Decorative orbs -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
        <div class="absolute bottom-0 left-8 w-16 h-16 bg-white/10 rounded-full translate-y-4 pointer-events-none" />

        <div class="relative flex items-center gap-3 pb-3">
          <!-- Back button -->
          <button
            @click="router.back()"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 active:bg-white/30 transition-colors"
            aria-label="Kembali"
          >
            <ChevronLeft :size="20" class="text-white" />
          </button>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-lg">🌸</span>
              <p class="text-white font-bold text-lg leading-tight">Amalan Harianku</p>
            </div>
            <p class="text-white/70 text-xs">{{ todayLabel }}</p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Completion ring -->
            <div class="relative w-10 h-10">
              <svg class="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke="white" stroke-width="3"
                  :stroke-dasharray="`${completionPercent * 0.94} 94`"
                  stroke-linecap="round" class="transition-all duration-500"/>
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                {{ completionPercent }}%
              </span>
            </div>
            <RouterLink to="/settings" class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors">
              <Settings :size="18" class="text-white" />
            </RouterLink>
          </div>
        </div>

        <!-- Streak mini strip in header -->
        <div v-if="amalStore.currentStreak > 0" class="flex items-center gap-2 mb-3 px-1">
          <div class="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <span class="text-sm">🔥</span>
            <span class="text-white font-bold text-sm">{{ amalStore.currentStreak }} hari</span>
            <span class="text-white/70 text-xs">berturut-turut</span>
          </div>
          <div v-if="milestoneBadge" class="flex items-center gap-1 bg-amber-400/80 rounded-full px-2.5 py-1">
            <span class="text-xs">{{ milestoneBadge.icon }}</span>
            <span class="text-white font-bold text-xs">{{ milestoneBadge.label }}</span>
          </div>
        </div>

        <!-- Tabs — part of header for sticky feel -->
        <div class="overflow-x-auto pb-0 -mx-4">
          <div class="flex gap-0 min-w-max px-4">
            <button
              v-for="tab in TABS"
              :key="tab.value"
              @click="activeTab = tab.value"
              class="relative px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all"
              :class="activeTab === tab.value
                ? 'text-white'
                : 'text-white/50'"
            >
              {{ tab.label }}
              <div v-if="activeTab === tab.value" class="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <div class="pb-24 bg-slate-50 min-h-screen">

      <!-- Udzur Banner -->
      <UdzurBanner class="pt-3" />

      <!-- Dzikir Pagi -->
      <div v-if="activeTab === 'dzikir_pagi'" class="px-4 pt-4 space-y-3">
        <!-- Progress header -->
        <div class="flex items-center gap-3 mb-1">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-xs font-semibold text-amber-700">
                🌅 {{ completedPagi }}/{{ dzikirPagi.length }} selesai
              </p>
              <button @click="amalStore.resetDzikir('pagi')" class="text-xs text-slate-400 active:text-slate-600">
                ↺ Reset
              </button>
            </div>
            <div class="h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                :style="{ width: `${dzikirPagi.length ? (completedPagi / dzikirPagi.length) * 100 : 0}%` }"
              />
            </div>
          </div>
          <div v-if="completedPagi === dzikirPagi.length && dzikirPagi.length > 0"
            class="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <span class="text-sm">✨</span>
          </div>
        </div>

        <!-- Completion banner -->
        <Transition name="slide-down">
          <div v-if="completedPagi === dzikirPagi.length && dzikirPagi.length > 0"
            class="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-3.5 text-center shadow-sm">
            <p class="text-white font-bold text-sm">🌅 Dzikir Pagi Selesai!</p>
            <p class="text-white/80 text-xs mt-0.5">MasyaAllah, semoga harimu penuh berkah 🤲</p>
          </div>
        </Transition>

        <DzikirCard
          v-for="d in dzikirPagi"
          :key="d.id"
          :dzikir="d"
          :checked="amalStore.isDzikirDone(d.id, 'pagi')"
          @toggle="amalStore.toggleDzikir(d.id, 'pagi')"
        />
      </div>

      <!-- Dzikir Petang -->
      <div v-if="activeTab === 'dzikir_petang'" class="px-4 pt-4 space-y-3">
        <div class="flex items-center gap-3 mb-1">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-xs font-semibold text-indigo-700">
                🌆 {{ completedPetang }}/{{ dzikirPetang.length }} selesai
              </p>
              <button @click="amalStore.resetDzikir('petang')" class="text-xs text-slate-400 active:text-slate-600">
                ↺ Reset
              </button>
            </div>
            <div class="h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                :style="{ width: `${dzikirPetang.length ? (completedPetang / dzikirPetang.length) * 100 : 0}%` }"
              />
            </div>
          </div>
          <div v-if="completedPetang === dzikirPetang.length && dzikirPetang.length > 0"
            class="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-200">
            <span class="text-sm">🌙</span>
          </div>
        </div>

        <Transition name="slide-down">
          <div v-if="completedPetang === dzikirPetang.length && dzikirPetang.length > 0"
            class="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-3.5 text-center shadow-sm">
            <p class="text-white font-bold text-sm">🌆 Dzikir Petang Selesai!</p>
            <p class="text-white/80 text-xs mt-0.5">Alhamdulillah, hari yang indah berakhir dengan dzikir 🌙</p>
          </div>
        </Transition>

        <DzikirCard
          v-for="d in dzikirPetang"
          :key="d.id"
          :dzikir="d"
          :checked="amalStore.isDzikirDone(d.id, 'petang')"
          @toggle="amalStore.toggleDzikir(d.id, 'petang')"
        />
      </div>

      <!-- Amalan Udzur -->
      <div v-if="activeTab === 'udzur'" class="pt-4">
        <AmalUdzur />
      </div>

      <!-- Amalan Sunnah -->
      <div v-if="activeTab === 'sunnah'" class="px-4 pt-4 space-y-3">
        <!-- Sunnah header card -->
        <div class="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-white font-bold text-sm">Amalan Sunnah</p>
              <p class="text-white/80 text-xs mt-0.5">{{ completedSunnah }}/{{ activeSunnahItems.length }} amalan selesai</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span class="text-2xl">🌟</span>
            </div>
          </div>
          <div class="mt-3 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              class="h-full bg-white rounded-full transition-all duration-500"
              :style="{ width: `${activeSunnahItems.length ? (completedSunnah / activeSunnahItems.length) * 100 : 0}%` }"
            />
          </div>
        </div>

        <template v-for="item in activeSunnahItems" :key="item.id">
          <SunnahAmalCard v-if="!item.friday_only || isFriday" :item="item" />
        </template>

        <RouterLink to="/settings" class="flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500 active:bg-slate-50 transition-colors">
          <span>⚙️</span> Atur amalan sunnah yang ditampilkan
        </RouterLink>
      </div>

      <!-- Doa -->
      <div v-if="activeTab === 'doa'" class="pt-4">
        <!-- Category pills -->
        <div class="overflow-x-auto px-4 pb-3">
          <div class="flex gap-2 min-w-max">
            <button
              v-for="cat in doaCategories"
              :key="cat"
              @click="selectedDoaCategory = cat"
              class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              :class="selectedDoaCategory === cat
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600'"
            >
              {{ DOA_CATEGORY_LABELS[cat] || cat }}
            </button>
          </div>
        </div>

        <div class="px-4 space-y-2.5">
          <div
            v-for="doa in filteredDoa"
            :key="doa.id"
            class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
            @click="expandedDoa = expandedDoa === doa.id ? null : doa.id"
          >
            <div class="flex items-center gap-3 px-4 py-3.5">
              <div class="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <span class="text-sm">🤲</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ doa.title }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ DOA_CATEGORY_LABELS[doa.category] || doa.category }}</p>
              </div>
              <ChevronDown
                :size="16"
                class="text-slate-300 transition-transform duration-200 shrink-0"
                :class="expandedDoa === doa.id ? 'rotate-180 text-rose-400' : ''"
              />
            </div>
            <Transition name="expand-smooth">
              <div v-if="expandedDoa === doa.id" class="px-4 pb-4 pt-1 border-t border-slate-50">
                <p class="font-arabic text-right text-base leading-loose text-slate-800 mb-3 pt-2">{{ doa.arabic }}</p>
                <div class="space-y-1.5">
                  <p class="text-xs text-slate-500 italic leading-relaxed">{{ doa.latin }}</p>
                  <p class="text-xs text-slate-600 leading-relaxed">{{ doa.translation }}</p>
                  <p v-if="doa.source" class="text-xs text-rose-400 font-semibold pt-1">📚 {{ doa.source }}</p>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Muhasabah -->
      <!-- IMPR-12 AC-06: Show EmptyState guidance before 20:00, show form after 20:00 -->
      <div v-if="activeTab === 'muhasabah'" class="pt-2">
        <div v-if="new Date().getHours() < 20 && !amalStore.todayLog?.muhasabah" class="px-4 pt-4">
          <EmptyState
            illustration="🌙"
            title="Muhasabah tersedia setelah Isya"
            description="Muhasabah (introspeksi harian) dibuka setelah pukul 20.00 agar kamu bisa merenungkan hari dengan tenang."
            cta-label="Isi Muhasabah Sekarang"
            @cta-click="null"
          />
        </div>
        <MuhasabahSheet v-else />
      </div>

      <!-- Tasbih & Tools -->
      <div v-if="activeTab === 'tools'" class="px-4 pt-4 space-y-3">
        <!-- Streak card -->
        <StreakBadge />

        <!-- Quick tools grid -->
        <div class="grid grid-cols-2 gap-3">
          <RouterLink to="/tasbih"
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-4 shadow-md active:scale-95 transition-transform">
            <div class="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
            <p class="text-3xl mb-2">📿</p>
            <p class="text-white font-bold text-sm">Tasbih Digital</p>
            <p class="text-white/70 text-xs mt-0.5">Subhanallah 33×</p>
          </RouterLink>

          <RouterLink to="/wirid"
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 shadow-md active:scale-95 transition-transform">
            <div class="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
            <p class="text-3xl mb-2">🕌</p>
            <p class="text-white font-bold text-sm">Wirid Sholat</p>
            <p class="text-white/70 text-xs mt-0.5">Setelah sholat</p>
          </RouterLink>

          <RouterLink to="/amal/kalender"
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 p-4 shadow-md active:scale-95 transition-transform">
            <div class="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
            <p class="text-3xl mb-2">📅</p>
            <p class="text-white font-bold text-sm">Kalender</p>
            <p class="text-white/70 text-xs mt-0.5">Heatmap amalan</p>
          </RouterLink>

          <RouterLink to="/amal/laporan"
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 shadow-md active:scale-95 transition-transform">
            <div class="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
            <p class="text-3xl mb-2">📊</p>
            <p class="text-white font-bold text-sm">Laporan</p>
            <p class="text-white/70 text-xs mt-0.5">Mingguan</p>
          </RouterLink>
        </div>

        <!-- Udzur mode activate -->
        <div v-if="!amalStore.isUdzurActive" class="rounded-2xl border-2 border-dashed border-rose-200 p-4 text-center bg-rose-50/50">
          <p class="text-rose-500 font-semibold text-sm mb-1">🌸 Mode Udzur</p>
          <p class="text-xs text-slate-500 mb-3">Aktifkan saat haid untuk amalan alternatif yang tetap bernilai</p>
          <button
            @click="showUdzurSetup = true"
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-semibold active:scale-95 transition-transform shadow-sm"
          >
            Aktifkan Mode Udzur
          </button>
        </div>
      </div>

    </div>

    <!-- Udzur Setup Modal -->
    <Transition name="modal">
      <div v-if="showUdzurSetup" class="fixed inset-0 z-50 flex items-end justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showUdzurSetup = false" />
        <div class="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-safe shadow-2xl">
          <div class="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
          <p class="text-base font-bold text-slate-800 mb-1 text-center">🌸 Aktifkan Mode Udzur</p>
          <p class="text-xs text-slate-500 text-center mb-4">Amalan dzikir, istighfar & selawat tetap bernilai saat haid</p>
          <p class="text-xs font-semibold text-slate-600 mb-2">Perkiraan durasi:</p>
          <div class="grid grid-cols-3 gap-2 mb-4">
            <button
              v-for="d in [5, 7, 10]"
              :key="d"
              @click="udzurDuration = d"
              class="py-3 rounded-xl text-sm font-bold transition-all"
              :class="udzurDuration === d
                ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600'"
            >
              {{ d }} hari
            </button>
          </div>
          <button
            @click="activateUdzur"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md shadow-rose-200"
          >
            Aktifkan Sekarang 🌸
          </button>
        </div>
      </div>
    </Transition>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ChevronDown, Settings, ChevronLeft } from 'lucide-vue-next'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import DzikirCard from '@/components/amal/DzikirCard.vue'
import UdzurBanner from '@/components/amal/UdzurBanner.vue'
import AmalUdzur from '@/components/amal/AmalUdzur.vue'
import SunnahAmalCard from '@/components/amal/SunnahAmalCard.vue'
import MuhasabahSheet from '@/components/amal/MuhasabahSheet.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StreakBadge from '@/components/amal/StreakBadge.vue'

import { useAmalStore } from '@/stores/amal'

const router = useRouter()
import dzikirData from '@/assets/data/dzikir.json'
import doaData from '@/assets/data/doa.json'
import sunnahAmalData from '@/assets/data/sunnah_amal.json'

const amalStore = useAmalStore()

// Today label
const todayLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const isFriday = computed(() => new Date().getDay() === 5)

// Milestone badges
const MILESTONES = [
  { days: 100, icon: '🏆', label: '100 Hari!' },
  { days: 30, icon: '🌙', label: '30 Hari' },
  { days: 7, icon: '⭐', label: '7 Hari' },
  { days: 3, icon: '🌱', label: '3 Hari' },
]
const milestoneBadge = computed(() => MILESTONES.find(m => amalStore.currentStreak >= m.days) || null)

// Tabs
const TABS = computed(() => {
  const tabs = [
    { value: 'dzikir_pagi', label: '🌅 Pagi' },
    { value: 'dzikir_petang', label: '🌆 Petang' },
  ]
  if (amalStore.isUdzurActive) tabs.push({ value: 'udzur', label: '🌸 Udzur' })
  tabs.push(
    { value: 'sunnah', label: '🌟 Sunnah' },
    { value: 'doa', label: '🤲 Doa' },
    { value: 'muhasabah', label: '🌙 Muhasabah' },
    { value: 'tools', label: '📿 Tools' },
  )
  return tabs
})
const route = useRoute()
const VALID_TABS = ['dzikir_pagi', 'dzikir_petang', 'udzur', 'sunnah', 'doa', 'muhasabah', 'tools']
const activeTab = ref('dzikir_pagi')
onMounted(() => {
  if (route.query.tab && VALID_TABS.includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
})

// Dzikir — BUG-01 FIXED: use d.category
const dzikirPagi = dzikirData.filter(d => d.category === 'pagi')
const dzikirPetang = dzikirData.filter(d => d.category === 'petang')

const completedPagi = computed(() => dzikirPagi.filter(d => amalStore.isDzikirDone(d.id, 'pagi')).length)
const completedPetang = computed(() => dzikirPetang.filter(d => amalStore.isDzikirDone(d.id, 'petang')).length)

// Overall completion % for header ring
const completionPercent = computed(() => {
  const total = dzikirPagi.length + dzikirPetang.length
  const done = completedPagi.value + completedPetang.value
  return total ? Math.round((done / total) * 100) : 0
})

// Sunnah
const activeSunnahItems = computed(() => {
  const configMap = {
    sholat_dhuha: 'sholat_dhuha', sholat_tahajud: 'sholat_tahajud',
    sholat_rawatib: 'sholat_rawatib', puasa_sunnah: 'puasa_sunnah',
    sedekah_harian: 'sedekah_harian', tilawah_quran: 'tilawah_quran',
    sholawat_100: 'sholawat_100', istighfar_100: 'istighfar_100',
    al_mulk: 'al_mulk', al_waqiah: 'al_waqiah', al_kahfi: 'al_kahfi',
  }
  return sunnahAmalData.filter(item => {
    const configKey = configMap[item.id]
    return configKey ? !!amalStore.sunnahConfig[configKey] : true
  })
})

const completedSunnah = computed(() => {
  const log = amalStore.todayLog
  return activeSunnahItems.value.filter(item => {
    if (item.amal_key) return !!log[item.amal_key]
    if (item.type === 'toggle') return !!log.sunnah?.[item.store_key]
    if (item.type === 'counter') return (log.sunnah?.[item.store_key] || 0) >= item.default_target
    if (item.type === 'counter_pages') return (log.sunnah?.tilawah_pages || 0) >= (amalStore.sunnahConfig?.tilawah_target_pages || 2)
    return false
  }).length
})

// Doa
const DOA_CATEGORY_LABELS = {
  all: 'Semua', bangun_tidur: 'Bangun Tidur', sebelum_tidur: 'Sebelum Tidur',
  sebelum_makan: 'Sebelum Makan', sesudah_makan: 'Sesudah Makan',
  masuk_masjid: 'Masuk Masjid', keluar_masjid: 'Keluar Masjid',
  masuk_rumah: 'Masuk Rumah', keluar_rumah: 'Keluar Rumah',
  bepergian: 'Bepergian', hujan: 'Hujan', memakai_baju: 'Memakai Baju',
}
const doaCategories = computed(() => ['all', ...new Set(doaData.map(d => d.category))])
const selectedDoaCategory = ref('all')
const expandedDoa = ref(null)
const filteredDoa = computed(() => {
  if (selectedDoaCategory.value === 'all') return doaData
  return doaData.filter(d => d.category === selectedDoaCategory.value)
})

// Udzur setup modal
const showUdzurSetup = ref(false)
const udzurDuration = ref(7)
function activateUdzur() {
  amalStore.activateUdzurMode(udzurDuration.value)
  showUdzurSetup.value = false
  activeTab.value = 'udzur'
}
</script>

<style scoped>
.expand-smooth-enter-active, .expand-smooth-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-smooth-enter-from, .expand-smooth-leave-to { opacity: 0; max-height: 0; }
.expand-smooth-enter-to, .expand-smooth-leave-from { opacity: 1; max-height: 600px; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative { transform: translateY(100%); }
</style>
