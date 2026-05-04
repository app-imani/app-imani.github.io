<template>
  <!-- Banner Mode Haid aktif — muncul di dashboard -->
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-haid-500 to-haid-600 text-white p-4">
    <div class="absolute top-0 right-0 opacity-10 pointer-events-none">
      <Heart :size="100" fill="white" />
    </div>

    <div class="relative z-10 flex items-start gap-3">
      <div class="bg-white/20 rounded-xl p-2 shrink-0">
        <Heart :size="20" fill="white" />
      </div>
      <div class="flex-1">
        <p class="text-xs font-medium opacity-80 uppercase tracking-wide">Mode Haid Aktif</p>
        <h3 class="text-base font-bold mt-0.5">{{ statusText }}</h3>
        <p class="text-xs opacity-80 mt-1">Sholat & puasa wajib di-pause. Perbanyak doa & dzikir 🤲</p>
      </div>
    </div>

    <!-- Rekomendasi amalan -->
    <div class="mt-3 pt-3 border-t border-white/20">
      <p class="text-xs font-semibold opacity-80 mb-2">Amalan yang Bisa Dilakukan:</p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="amal in recommendations"
          :key="amal"
          class="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium"
        >
          {{ amal }}
        </span>
      </div>
    </div>

    <!-- Tombol selesai haid -->
    <button
      @click="$emit('selesaiHaid')"
      class="mt-3 w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors text-sm font-semibold"
    >
      Haid Selesai ✓
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Heart } from 'lucide-vue-next'
import { useCycleStore } from '@/stores/cycle'

const emit = defineEmits(['selesaiHaid'])

const cycleStore = useCycleStore()

const statusText = computed(() => cycleStore.cycleStatusText)

const recommendations = [
  'Doa & Dzikir', "Membaca Qur'an (tanpa sentuh mushaf)", 'Istighfar', 'Sholawat', 'Sedekah', "Kajian & Ta'lim",
]
</script>
