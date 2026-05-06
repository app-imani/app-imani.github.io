<template>
  <PageWrapper>
    <template #topbar>
      <TopBar title="Amalan" subtitle="Dzikir, Doa & Ibadah">
        <template #actions>
          <RouterLink to="/settings" class="p-2 rounded-xl active:bg-slate-100 transition-colors" aria-label="Pengaturan">
            <Settings :size="20" class="text-slate-400" />
          </RouterLink>
        </template>
      </TopBar>
    </template>

    <div class="pb-6">
      <!-- Tab selector -->
      <div class="flex gap-1 mx-4 mt-2 mb-4 p-1 bg-slate-100 rounded-2xl">
        <button
          v-for="tab in TABS"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
          :class="activeTab === tab.value ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Dzikir Pagi -->
      <div v-if="activeTab === 'dzikir_pagi'" class="space-y-3 px-4">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-slate-500 font-medium">
            {{ completedPagi }}/{{ dzikirPagi.length }} dzikir selesai
          </p>
          <button @click="resetDzikir('pagi')" class="text-xs text-slate-400 active:opacity-60">Reset</button>
        </div>
        <div class="h-1.5 bg-slate-100 rounded-full mb-3">
          <div
            class="h-full bg-primary-500 rounded-full transition-all"
            :style="{ width: `${(completedPagi / dzikirPagi.length) * 100}%` }"
          />
        </div>
        <DzikirCard
          v-for="d in dzikirPagi"
          :key="d.id"
          :dzikir="d"
          :checked="amalStore.isDzikirDone(d.id, 'pagi')"
          @toggle="amalStore.toggleDzikir(d.id, 'pagi')"
        />
      </div>

      <!-- Dzikir Petang -->
      <div v-if="activeTab === 'dzikir_petang'" class="space-y-3 px-4">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-slate-500 font-medium">
            {{ completedPetang }}/{{ dzikirPetang.length }} dzikir selesai
          </p>
          <button @click="resetDzikir('petang')" class="text-xs text-slate-400 active:opacity-60">Reset</button>
        </div>
        <div class="h-1.5 bg-slate-100 rounded-full mb-3">
          <div
            class="h-full bg-primary-500 rounded-full transition-all"
            :style="{ width: `${(completedPetang / dzikirPetang.length) * 100}%` }"
          />
        </div>
        <DzikirCard
          v-for="d in dzikirPetang"
          :key="d.id"
          :dzikir="d"
          :checked="amalStore.isDzikirDone(d.id, 'petang')"
          @toggle="amalStore.toggleDzikir(d.id, 'petang')"
        />
      </div>

      <!-- Doa Harian -->
      <div v-if="activeTab === 'doa'" class="px-4">
        <!-- Category filter -->
        <div class="flex gap-2 overflow-x-auto pb-2 mb-3">
          <button
            v-for="cat in doaCategories"
            :key="cat"
            @click="selectedDoaCategory = cat"
            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            :class="selectedDoaCategory === cat ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'"
          >
            {{ DOA_CATEGORY_LABELS[cat] || cat }}
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="doa in filteredDoa"
            :key="doa.id"
            class="card cursor-pointer"
            @click="expandedDoa = expandedDoa === doa.id ? null : doa.id"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-800">{{ doa.title }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ DOA_CATEGORY_LABELS[doa.category] || doa.category }}</p>
              </div>
              <ChevronDown
                :size="16"
                class="text-slate-400 mt-1 transition-transform shrink-0"
                :class="expandedDoa === doa.id ? 'rotate-180' : ''"
              />
            </div>

            <Transition name="expand">
              <div v-if="expandedDoa === doa.id" class="mt-3 pt-3 border-t border-slate-50">
                <p class="font-arabic text-right text-lg leading-loose text-slate-800 mb-3">{{ doa.arabic }}</p>
                <p class="text-xs text-slate-500 italic mb-2">{{ doa.latin }}</p>
                <p class="text-xs text-slate-600 leading-relaxed">{{ doa.translation }}</p>
                <p v-if="doa.source" class="text-xs text-primary-500 mt-2 font-medium">📚 {{ doa.source }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Tasbih shortcut -->
      <div v-if="activeTab === 'tasbih'" class="px-4">
        <div class="card text-center py-8">
          <p class="text-4xl mb-3">📿</p>
          <p class="text-lg font-bold text-slate-800 mb-1">Tasbih Digital</p>
          <p class="text-sm text-slate-400 mb-5">Subhanallah · Alhamdulillah · Allahu Akbar</p>
          <RouterLink
            to="/tasbih"
            class="inline-block px-8 py-3 rounded-2xl bg-primary-600 text-white font-semibold text-sm active:scale-95 transition-transform"
          >
            Buka Tasbih →
          </RouterLink>
        </div>
      </div>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronDown, Settings } from 'lucide-vue-next'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import TopBar from '@/components/layout/TopBar.vue'
import DzikirCard from '@/components/amal/DzikirCard.vue'

import { useAmalStore } from '@/stores/amal'
import dzikirData from '@/assets/data/dzikir.json'
import doaData from '@/assets/data/doa.json'

const amalStore = useAmalStore()

const TABS = [
  { value: 'dzikir_pagi', label: '🌅 Pagi' },
  { value: 'dzikir_petang', label: '🌆 Petang' },
  { value: 'doa', label: '🤲 Doa' },
  { value: 'tasbih', label: '📿 Tasbih' },
]

const activeTab = ref('dzikir_pagi')

const dzikirPagi = dzikirData.filter(d => d.time === 'pagi')
const dzikirPetang = dzikirData.filter(d => d.time === 'petang')

const completedPagi = computed(() => dzikirPagi.filter(d => amalStore.isDzikirDone(d.id, 'pagi')).length)
const completedPetang = computed(() => dzikirPetang.filter(d => amalStore.isDzikirDone(d.id, 'petang')).length)

function resetDzikir(time) {
  amalStore.resetDzikir(time)
}

// Doa
const DOA_CATEGORY_LABELS = {
  all: 'Semua',
  bangun_tidur: 'Bangun Tidur',
  sebelum_tidur: 'Sebelum Tidur',
  sebelum_makan: 'Sebelum Makan',
  sesudah_makan: 'Sesudah Makan',
  masuk_masjid: 'Masuk Masjid',
  keluar_masjid: 'Keluar Masjid',
  masuk_rumah: 'Masuk Rumah',
  keluar_rumah: 'Keluar Rumah',
  bepergian: 'Bepergian',
  hujan: 'Hujan',
  memakai_baju: 'Memakai Baju',
}

const doaCategories = computed(() => ['all', ...new Set(doaData.map(d => d.category))])
const selectedDoaCategory = ref('all')
const expandedDoa = ref(null)

const filteredDoa = computed(() => {
  if (selectedDoaCategory.value === 'all') return doaData
  return doaData.filter(d => d.category === selectedDoaCategory.value)
})
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
