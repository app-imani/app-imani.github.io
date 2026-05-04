<template>
  <!-- Card dzikir dengan teks Arab -->
  <div
    class="card"
    :class="isChecked ? 'border-primary-200 bg-primary-50' : 'bg-white'"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex-1">
        <h3 class="text-sm font-bold text-slate-800">{{ dzikir.title }}</h3>
        <span class="text-xs text-slate-400">{{ dzikir.count }}x · {{ dzikir.source }}</span>
      </div>
      <!-- Checkbox -->
      <button
        @click="$emit('toggle')"
        class="shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all active:scale-90"
        :class="isChecked ? 'bg-primary-600 border-primary-600' : 'border-slate-200'"
      >
        <Check v-if="isChecked" :size="14" class="text-white" :stroke-width="3" />
      </button>
    </div>

    <!-- Teks Arab -->
    <p class="font-arabic text-arabic-base text-slate-800 mb-2 leading-loose">
      {{ dzikir.arabic }}
    </p>

    <!-- Latin (collapsible) -->
    <Transition name="expand">
      <div v-if="showDetail">
        <p class="text-sm text-slate-500 italic mb-1.5">{{ dzikir.latin }}</p>
        <p class="text-sm text-slate-600">{{ dzikir.translation }}</p>
      </div>
    </Transition>

    <!-- Toggle detail -->
    <button
      @click="showDetail = !showDetail"
      class="mt-2 text-xs text-primary-500 font-medium flex items-center gap-1"
    >
      <ChevronDown :size="13" :class="showDetail ? 'rotate-180' : ''" class="transition-transform" />
      {{ showDetail ? 'Sembunyikan' : 'Lihat Terjemahan' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'

defineProps({
  dzikir: { type: Object, required: true },
  isChecked: { type: Boolean, default: false },
})

defineEmits(['toggle'])

const showDetail = ref(false)
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
}
</style>
