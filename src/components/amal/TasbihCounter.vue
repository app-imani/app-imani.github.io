<template>
  <!-- Tasbih counter component -->
  <div class="flex flex-col items-center">
    <!-- Counter display besar -->
    <div
      class="relative flex items-center justify-center w-52 h-52 rounded-full cursor-pointer select-none"
      :class="isComplete ? 'bg-primary-500' : 'bg-primary-50 border-4 border-primary-200'"
      @click="handleTap"
      role="button"
      :aria-label="`Tasbih ${count} dari ${target}`"
    >
      <!-- Lingkaran progress -->
      <svg class="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 208 208">
        <circle cx="104" cy="104" r="96" fill="none" stroke="#e2e8f0" stroke-width="6" />
        <circle
          cx="104" cy="104" r="96" fill="none"
          :stroke="isComplete ? 'white' : '#059669'"
          stroke-width="6"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          class="transition-all duration-300"
        />
      </svg>

      <!-- Angka count -->
      <div class="text-center z-10">
        <span
          class="text-6xl font-bold tabular-nums transition-all duration-100"
          :class="isComplete ? 'text-white' : 'text-primary-700'"
        >{{ count }}</span>
        <p class="text-sm font-medium mt-1" :class="isComplete ? 'text-white/80' : 'text-primary-400'">
          / {{ target }}
        </p>
      </div>

      <!-- Complete checkmark -->
      <div v-if="isComplete" class="absolute inset-0 flex items-center justify-center">
        <CheckCircle :size="64" class="text-white opacity-20" />
      </div>
    </div>

    <!-- Label dzikir -->
    <p class="mt-4 text-lg font-bold text-slate-700">{{ label }}</p>

    <!-- Kontrol -->
    <div class="flex gap-3 mt-4">
      <button
        @click="$emit('reset')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 active:bg-slate-50"
      >
        <RotateCcw :size="15" />
        Reset
      </button>
      <button
        @click="handleTap"
        :disabled="isComplete"
        class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
        :class="isComplete ? 'bg-slate-100 text-slate-400' : 'bg-primary-600 text-white'"
      >
        +1
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  count: { type: Number, default: 0 },
  target: { type: Number, default: 33 },
  label: { type: String, default: 'Subhanallah' },
})

const emit = defineEmits(['tap', 'reset'])

const isComplete = computed(() => props.count >= props.target)
const circumference = computed(() => 2 * Math.PI * 96)
const dashOffset = computed(() => {
  const percent = Math.min(1, props.count / props.target)
  return circumference.value * (1 - percent)
})

function handleTap() {
  if (isComplete.value) return

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }

  emit('tap')
}
</script>
