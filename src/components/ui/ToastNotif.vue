<template>
  <!-- Toast container — fixed bottom (di atas bottom nav) -->
  <Teleport to="body">
    <div class="fixed bottom-20 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg pointer-events-auto"
          :class="toastClass(toast.type)"
        >
          <component :is="toastIcon(toast.type)" :size="18" class="mt-0.5 shrink-0" />
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="text-sm font-semibold leading-tight">{{ toast.title }}</p>
            <p class="text-sm leading-tight" :class="toast.title ? 'text-opacity-80 mt-0.5' : ''">{{ toast.message }}</p>
          </div>
          <button @click="removeToast(toast.id)" class="shrink-0 opacity-60 hover:opacity-100">
            <X :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'

// Store toast secara global (simple approach tanpa Pinia)
const toasts = ref([])
let toastIdCounter = 0

function toastClass(type) {
  const classes = {
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
  }
  return classes[type] || classes.info
}

function toastIcon(type) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }
  return icons[type] || Info
}

function addToast({ message, title = '', type = 'info', duration = 3000 }) {
  const id = ++toastIdCounter
  toasts.value.push({ id, message, title, type })

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function removeToast(id) {
  const idx = toasts.value.findIndex((t) => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

// Expose globally via window untuk kemudahan penggunaan
if (typeof window !== 'undefined') {
  window.$toast = addToast
}

// Juga bisa di-import langsung
defineExpose({ addToast, removeToast })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
