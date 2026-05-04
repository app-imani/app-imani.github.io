<template>
  <!-- SVG Circular Progress component -->
  <div class="relative inline-flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="rotate-[-90deg]">
      <!-- Track (background circle) -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <!-- Progress circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        class="transition-all duration-700 ease-out"
      />
    </svg>
    <!-- Center content -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <slot>
        <span class="font-bold" :style="{ fontSize: fontSize + 'px' }">{{ percent }}%</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percent: { type: Number, default: 0 },
  size: { type: Number, default: 100 },
  strokeWidth: { type: Number, default: 8 },
  progressColor: { type: String, default: '#059669' },
  trackColor: { type: String, default: '#e2e8f0' },
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - Math.min(100, Math.max(0, props.percent)) / 100))
const fontSize = computed(() => Math.round(props.size / 5))
</script>
