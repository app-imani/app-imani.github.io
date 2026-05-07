<template>
  <div
    class="relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.98] select-none"
    :class="checked
      ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 shadow-sm shadow-rose-100'
      : 'border-slate-100 bg-white shadow-sm'"
    @click="$emit('toggle')"
  >
    <!-- Completed shimmer effect -->
    <div v-if="checked" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

    <div class="p-4">
      <!-- Header row -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex-1">
          <h3 class="text-sm font-bold text-slate-800 leading-tight">{{ dzikir.title }}</h3>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-xs text-slate-400">{{ dzikir.count }}×</span>
            <span class="text-[10px] text-slate-300">•</span>
            <span class="text-xs text-slate-400">{{ dzikir.source }}</span>
          </div>
        </div>

        <!-- Checkbox -->
        <div
          class="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200"
          :class="checked
            ? 'bg-gradient-to-br from-rose-400 to-pink-500 border-transparent shadow-md shadow-rose-200'
            : 'border-slate-200 bg-white'"
        >
          <Transition name="check-pop">
            <Check v-if="checked" :size="14" class="text-white" :stroke-width="3" />
          </Transition>
        </div>
      </div>

      <!-- Arabic text -->
      <div
        class="font-arabic text-right leading-loose mb-2 transition-colors"
        :class="checked ? 'text-rose-800 text-base' : 'text-slate-700 text-base'"
      >
        {{ dzikir.arabic }}
      </div>

      <!-- Translation collapsible -->
      <Transition name="expand-smooth">
        <div v-if="showDetail" class="border-t pt-3 mt-1" :class="checked ? 'border-rose-100' : 'border-slate-50'">
          <p class="text-xs text-slate-500 italic mb-1.5 leading-relaxed">{{ dzikir.latin }}</p>
          <p class="text-xs text-slate-600 leading-relaxed">{{ dzikir.translation }}</p>
        </div>
      </Transition>

      <!-- Toggle button -->
      <button
        @click.stop="showDetail = !showDetail"
        class="mt-2.5 flex items-center gap-1 text-xs font-medium transition-colors"
        :class="checked ? 'text-rose-400' : 'text-primary-500'"
      >
        <ChevronDown
          :size="13"
          class="transition-transform duration-200"
          :class="showDetail ? 'rotate-180' : ''"
        />
        {{ showDetail ? 'Sembunyikan' : 'Terjemahan' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'

defineProps({
  dzikir: { type: Object, required: true },
  checked: { type: Boolean, default: false },
})

defineEmits(['toggle'])

const showDetail = ref(false)
</script>

<style scoped>
.expand-smooth-enter-active,
.expand-smooth-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-smooth-enter-from,
.expand-smooth-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-smooth-enter-to,
.expand-smooth-leave-from {
  opacity: 1;
  max-height: 300px;
}

.check-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.check-pop-enter-from {
  opacity: 0;
  transform: scale(0);
}
.check-pop-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>
