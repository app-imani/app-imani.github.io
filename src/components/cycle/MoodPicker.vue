<template>
  <!-- Mood picker dengan emoji -->
  <div>
    <p class="text-sm font-semibold text-slate-600 mb-3">Mood Hari Ini</p>
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="mood in moods"
        :key="mood.value"
        @click="$emit('update:modelValue', mood.value)"
        class="flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all active:scale-95"
        :class="modelValue === mood.value
          ? 'border-primary-400 bg-primary-50 scale-105'
          : 'border-slate-100 bg-white'"
        :title="mood.label"
      >
        <span class="text-2xl">{{ mood.emoji }}</span>
        <span class="text-[10px] font-medium text-slate-500">{{ mood.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: null },
})

defineEmits(['update:modelValue'])

const moods = [
  { value: 'baik', emoji: '😊', label: 'Baik' },
  { value: 'senang', emoji: '😄', label: 'Senang' },
  { value: 'biasa', emoji: '😐', label: 'Biasa' },
  { value: 'lelah', emoji: '😴', label: 'Lelah' },
  { value: 'sedih', emoji: '😢', label: 'Sedih' },
  { value: 'nyeri', emoji: '😣', label: 'Nyeri' },
  { value: 'gelisah', emoji: '😰', label: 'Gelisah' },
  { value: 'syukur', emoji: '🤲', label: 'Syukur' },
]
</script>
