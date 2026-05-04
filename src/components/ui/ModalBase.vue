<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[150] flex items-end sm:items-center justify-center"
        @click.self="handleOverlayClick"
      >
        <!-- Overlay backdrop -->
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

        <!-- Modal panel -->
        <div
          class="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          :style="{ maxHeight: maxHeight }"
        >
          <!-- Handle bar (mobile) -->
          <div class="flex justify-center pt-3 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <slot name="header">
              <h2 class="text-base font-bold text-slate-800">{{ title }}</h2>
            </slot>
            <button
              v-if="!hideClose"
              @click="$emit('update:modelValue', false)"
              class="p-2 -mr-2 rounded-xl text-slate-400 active:bg-slate-100 transition-colors"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Content -->
          <div class="overflow-y-auto" :style="{ maxHeight: contentMaxHeight }">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="border-t border-slate-100 px-5 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  hideClose: { type: Boolean, default: false },
  persistent: { type: Boolean, default: false }, // Tidak bisa ditutup klik overlay
  maxHeight: { type: String, default: '90vh' },
})

const emit = defineEmits(['update:modelValue', 'close'])

const contentMaxHeight = computed(() => {
  // Kurangi header + footer height dari maxHeight
  return 'calc(90vh - 120px)'
})

function handleOverlayClick() {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.3s ease-out;
}
.modal-leave-active {
  transition: all 0.2s ease-in;
}
.modal-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.modal-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .modal-enter-from,
  .modal-leave-to {
    transform: scale(0.95);
  }
}
</style>
