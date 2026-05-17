<template>
  <div class="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
    <button
      v-for="cat in CATEGORIES"
      :key="cat.key"
      @click="$emit('update:modelValue', cat.key)"
      class="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
      :class="modelValue === cat.key
        ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
        : 'bg-white text-slate-600 border border-slate-200'"
    >
      <span>{{ cat.emoji }}</span>
      <span>{{ cat.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { CATEGORIES } from '@/stores/social'

defineProps({ modelValue: { type: String, default: 'semua' } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
