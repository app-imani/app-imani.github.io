<template>
  <div class="flex items-center justify-center py-8">
    <div class="flex flex-col items-center gap-3">
      <div class="relative w-10 h-10">
        <div class="absolute inset-0 rounded-full border-3 border-slate-200" />
        <div
          class="absolute inset-0 rounded-full border-3 border-t-primary-500 animate-spin"
          style="border-color: transparent; border-top-color: var(--color-primary)"
        />
      </div>
      <p v-if="text" class="text-sm text-slate-400">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
})
</script>
