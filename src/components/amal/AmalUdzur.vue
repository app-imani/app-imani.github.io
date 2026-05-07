<template>
  <div class="px-4 space-y-3">
    <!-- Header -->
    <div class="rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-500 p-4 shadow-sm">
      <p class="text-white font-bold text-sm mb-0.5">🌸 Amalan Udzur</p>
      <p class="text-white/80 text-xs leading-relaxed">Amalan pengganti yang tetap bernilai ibadah di sisi Allah ✨</p>
    </div>

    <!-- Istighfar counter -->
    <div class="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
            <span class="text-lg">🌸</span>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800">Istighfar</p>
            <p class="text-xs text-slate-400 font-arabic">أَسْتَغْفِرُ اللهَ</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-2xl font-black text-rose-500">{{ todayLog.udzur_amal?.istighfar || 0 }}</p>
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">hitungan</p>
        </div>
      </div>

      <!-- Progress towards 70 -->
      <div class="mb-3">
        <div class="flex justify-between text-xs text-slate-400 mb-1">
          <span>Target: 70×</span>
          <span>{{ Math.min(todayLog.udzur_amal?.istighfar || 0, 70) }}/70</span>
        </div>
        <div class="h-2 bg-rose-50 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-300"
            :style="{ width: `${Math.min(((todayLog.udzur_amal?.istighfar || 0) / 70) * 100, 100)}%` }"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="amalStore.incrementUdzurAmal('istighfar')"
          class="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold active:scale-95 transition-transform shadow-sm shadow-rose-200"
        >
          +1 Istighfar
        </button>
        <button
          @mousedown="startRepeat('istighfar')"
          @mouseup="stopRepeat"
          @touchstart.prevent="startRepeat('istighfar')"
          @touchend="stopRepeat"
          class="px-5 py-3 rounded-xl bg-rose-100 text-rose-600 text-sm font-bold active:scale-95 transition-transform"
        >
          +10
        </button>
      </div>
      <p class="text-[10px] text-rose-400 text-center mt-2 italic">HR. Bukhari — beristighfarlah lebih dari 70× sehari</p>
    </div>

    <!-- Selawat counter -->
    <div class="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center">
            <span class="text-lg">✨</span>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800">Selawat Nabi</p>
            <p class="text-xs text-slate-400 font-arabic">اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-2xl font-black text-pink-500">{{ todayLog.udzur_amal?.selawat || 0 }}</p>
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">hitungan</p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="amalStore.incrementUdzurAmal('selawat')"
          class="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white text-sm font-bold active:scale-95 transition-transform shadow-sm shadow-pink-200"
        >
          +1 Selawat
        </button>
        <button
          @mousedown="startRepeat('selawat')"
          @mouseup="stopRepeat"
          @touchstart.prevent="startRepeat('selawat')"
          @touchend="stopRepeat"
          class="px-5 py-3 rounded-xl bg-pink-100 text-pink-600 text-sm font-bold active:scale-95 transition-transform"
        >
          +10
        </button>
      </div>
      <p class="text-[10px] text-pink-400 text-center mt-2 italic">HR. Muslim — perbanyak selawat di hari Jumat</p>
    </div>

    <!-- Sedekah & Tadabbur toggles -->
    <div class="grid grid-cols-2 gap-3">
      <button
        class="rounded-2xl border-2 p-4 text-left transition-all active:scale-95"
        :class="todayLog.udzur_amal?.sedekah
          ? 'border-emerald-300 bg-emerald-50'
          : 'border-slate-100 bg-white'"
        @click="amalStore.toggleUdzurAmal('sedekah')"
      >
        <span class="text-2xl block mb-2">💝</span>
        <p class="text-sm font-bold" :class="todayLog.udzur_amal?.sedekah ? 'text-emerald-700' : 'text-slate-700'">Sedekah</p>
        <p class="text-xs mt-0.5" :class="todayLog.udzur_amal?.sedekah ? 'text-emerald-500' : 'text-slate-400'">
          {{ todayLog.udzur_amal?.sedekah ? '✓ Sudah' : 'Belum' }}
        </p>
      </button>

      <button
        class="rounded-2xl border-2 p-4 text-left transition-all active:scale-95"
        :class="todayLog.udzur_amal?.tadabbur
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-100 bg-white'"
        @click="amalStore.toggleUdzurAmal('tadabbur')"
      >
        <span class="text-2xl block mb-2">📖</span>
        <p class="text-sm font-bold" :class="todayLog.udzur_amal?.tadabbur ? 'text-blue-700' : 'text-slate-700'">Tadabbur</p>
        <p class="text-xs mt-0.5" :class="todayLog.udzur_amal?.tadabbur ? 'text-blue-500' : 'text-slate-400'">
          {{ todayLog.udzur_amal?.tadabbur ? '✓ Sudah' : 'Belum' }}
        </p>
      </button>
    </div>

    <p class="text-xs text-center text-slate-400 pt-1 pb-2">
      🌸 Semua amalan udzur tercatat — streak tetap terjaga
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAmalStore } from '@/stores/amal'

const amalStore = useAmalStore()
const todayLog = computed(() => amalStore.todayLog)

let repeatInterval = null
function startRepeat(type) {
  repeatInterval = setInterval(() => amalStore.incrementUdzurAmal(type), 120)
}
function stopRepeat() {
  clearInterval(repeatInterval)
  repeatInterval = null
}
</script>
