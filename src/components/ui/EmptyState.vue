<template>
  <div class="flex flex-col items-center justify-center py-10 px-6 text-center">
    <div v-if="illustration" class="text-5xl mb-4">{{ illustration }}</div>
    <p class="text-sm font-semibold text-slate-600 mb-1">{{ title }}</p>
    <p v-if="description" class="text-xs text-slate-400 mb-4 max-w-xs">{{ description }}</p>
    <button
      v-if="ctaLabel"
      @click="$emit('cta-click')"
      class="px-5 py-2 rounded-full bg-primary-600 text-white text-xs font-medium active:opacity-80 transition-opacity"
    >
      {{ ctaLabel }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  illustration: { type: String, default: null },
  title: { type: String, required: true },
  description: { type: String, default: null },
  ctaLabel: { type: String, default: null },
})
defineEmits(['cta-click'])
</script>
