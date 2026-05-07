<template>
  <Transition name="slide-down">
    <div v-if="isUdzurActive" class="mx-4 rounded-2xl overflow-hidden shadow-md">
      <div class="bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 px-4 py-3.5">
        <!-- Top row -->
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
            <span class="text-lg">🌸</span>
          </div>
          <div class="flex-1">
            <p class="text-white font-bold text-sm">Mode Udzur Aktif</p>
            <p class="text-white/80 text-xs mt-0.5">Tubuhmu beristirahat, hatimu tetap berzikir 💗</p>
          </div>
          <button
            @click="showInfo = !showInfo"
            class="p-1.5 rounded-lg bg-white/20 active:bg-white/30 transition-colors"
          >
            <ChevronDown :size="14" class="text-white transition-transform duration-200" :class="showInfo ? 'rotate-180' : ''" />
          </button>
        </div>

        <!-- Remaining days pill -->
        <div class="flex items-center gap-2 mt-3">
          <div class="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <span class="text-xs text-white font-semibold">Sisa {{ remainingDays }} hari</span>
          </div>
          <div class="flex gap-1">
            <div
              v-for="n in totalDays"
              :key="n"
              class="w-2.5 h-2.5 rounded-full"
              :class="n <= remainingDays ? 'bg-white' : 'bg-white/30'"
            />
          </div>
        </div>
      </div>

      <!-- Collapsible info -->
      <Transition name="expand">
        <div v-if="showInfo" class="bg-rose-50 px-4 py-3 border-t border-rose-200/50">
          <p class="text-xs text-rose-700 leading-relaxed mb-3">
            Selama udzur, amalan istighfar, selawat, sedekah & tadabbur Al-Quran
            tetap sangat dianjurkan. Streak ibadahmu <strong>tidak akan terputus</strong> 🌹
          </p>
          <button
            @click="confirmDeactivate"
            class="text-xs text-rose-500 font-semibold underline active:opacity-60"
          >
            Nonaktifkan Mode Udzur
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'

const amalStore = useAmalStore()
const showInfo = ref(false)
const isUdzurActive = computed(() => amalStore.isUdzurActive)

const totalDays = computed(() => amalStore.udzurMode.durationDays || 7)
const remainingDays = computed(() => {
  if (!amalStore.udzurMode.startDate) return 0
  const end = new Date(amalStore.udzurMode.startDate)
  end.setDate(end.getDate() + totalDays.value)
  return Math.max(0, Math.ceil((end - new Date()) / 86400000))
})

function confirmDeactivate() {
  if (window.confirm('Yakin nonaktifkan Mode Udzur?')) amalStore.deactivateUdzurMode()
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 150px; }
</style>
