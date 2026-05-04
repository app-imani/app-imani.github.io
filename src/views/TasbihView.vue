<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-safe pt-4">
      <RouterLink to="/amal" class="p-2 rounded-xl text-slate-400 active:bg-slate-700">
        <ArrowLeft :size="20" />
      </RouterLink>
      <div class="text-center">
        <p class="text-sm font-semibold text-white">Tasbih Digital</p>
        <p class="text-xs text-slate-400">{{ tasbihLabel }}</p>
      </div>
      <button @click="showSettingsPanel = !showSettingsPanel" class="p-2 rounded-xl text-slate-400 active:bg-slate-700">
        <Settings :size="20" />
      </button>
    </div>

    <!-- Settings panel -->
    <Transition name="slide-down">
      <div v-if="showSettingsPanel" class="mx-4 mt-3 card bg-slate-700 border-slate-600">
        <p class="text-xs text-slate-300 font-semibold mb-3">Pengaturan Tasbih</p>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-slate-400 mb-1.5 block">Bacaan</label>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="l in LABELS"
                :key="l"
                @click="amalStore.tasbih.label = l"
                class="py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
                :class="amalStore.tasbih.label === l ? 'bg-primary-500 text-white' : 'bg-slate-600 text-slate-300'"
              >
                {{ l }}
              </button>
            </div>
          </div>
          <div>
            <label class="text-xs text-slate-400 mb-1.5 block">Target: {{ amalStore.tasbih.target }}x</label>
            <input
              v-model.number="amalStore.tasbih.target"
              type="range" min="10" max="300" step="1"
              class="w-full accent-primary-500"
            />
            <div class="flex justify-between text-xs text-slate-500 mt-0.5">
              <span>10</span><span>33</span><span>99</span><span>300</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main counter area -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 gap-6">
      <TasbihCounter
        :count="amalStore.tasbih.count"
        :target="amalStore.tasbih.target"
        :label="tasbihLabel"
        @tap="onTap"
        @reset="onReset"
      />

      <!-- Round counter -->
      <div class="flex items-center gap-3">
        <div
          v-for="i in 3"
          :key="i"
          class="w-3 h-3 rounded-full transition-all"
          :class="i <= completedRounds ? 'bg-primary-400' : 'bg-slate-600'"
        />
        <span class="text-xs text-slate-400 ml-1">{{ completedRounds }} putaran selesai</span>
      </div>

      <!-- Arabic text display -->
      <div class="text-center mt-2">
        <p class="font-arabic text-xl text-white/80 leading-loose">{{ currentArabic }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ tasbihLabel }}</p>
      </div>
    </div>

    <!-- Bottom hint -->
    <div class="pb-safe pb-8 text-center">
      <p class="text-xs text-slate-500">Ketuk lingkaran untuk menghitung · Tahan untuk reset</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Settings } from 'lucide-vue-next'

import TasbihCounter from '@/components/amal/TasbihCounter.vue'
import { useAmalStore } from '@/stores/amal'

const amalStore = useAmalStore()

const showSettingsPanel = ref(false)

const LABELS = ['Subhanallah', 'Alhamdulillah', 'Allahu Akbar', 'Astaghfirullah', 'La ilaha illallah', 'Hasbunallah']

const ARABIC_MAP = {
  'Subhanallah': 'سُبْحَانَ اللهِ',
  'Alhamdulillah': 'الْحَمْدُ لِلّهِ',
  'Allahu Akbar': 'اللهُ أَكْبَرُ',
  'Astaghfirullah': 'أَسْتَغْفِرُ اللهَ',
  'La ilaha illallah': 'لَا إِلَهَ إِلَّا اللهُ',
  'Hasbunallah': 'حَسْبُنَا اللهُ',
}

const tasbihLabel = computed(() => amalStore.tasbih.label || 'Subhanallah')
const currentArabic = computed(() => ARABIC_MAP[tasbihLabel.value] || '')

const completedRounds = computed(() => Math.floor(amalStore.tasbih.count / amalStore.tasbih.target))

function onTap() {
  amalStore.incrementTasbih()
  if (amalStore.tasbih.count % amalStore.tasbih.target === 0) {
    window.$toast?.(`${tasbihLabel.value} selesai ${completedRounds.value}x 📿`, 'success')
  }
}

function onReset() {
  amalStore.resetTasbih()
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
