<template>
  <header class="top-bar sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-100 safe-area-top">
    <div class="flex items-center gap-3 h-14 px-4">
      <!-- Tombol kembali (jika ada history) -->
      <button
        v-if="showBack"
        @click="handleBack"
        class="p-2 -ml-2 rounded-xl active:bg-slate-100 text-slate-600 transition-colors"
        aria-label="Kembali"
      >
        <ChevronLeft :size="22" />
      </button>

      <!-- Logo / Icon (jika beranda) -->
      <div v-if="showLogo && !showBack" class="text-primary-600">
        <Sparkles :size="22" />
      </div>

      <!-- Judul halaman -->
      <div class="flex-1 min-w-0 text-center">
        <slot name="title">
          <h1 class="text-base font-bold text-slate-800 truncate">{{ title || pageTitle }}</h1>
          <p v-if="subtitle" class="text-xs text-slate-400 truncate leading-none mt-0.5">{{ subtitle }}</p>
        </slot>
      </div>

      <!-- Slot untuk aksi kanan (alias: actions atau right) -->
      <slot name="right" />
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Sparkles } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  showLogo: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()

const pageTitle = computed(() => route.meta?.title || 'Imani')

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}
</style>
