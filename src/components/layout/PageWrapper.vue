<template>
  <div class="page-wrapper min-h-screen bg-surface flex flex-col">
    <!-- Optional sticky topbar slot -->
    <div v-if="$slots.topbar" class="sticky top-0 z-30">
      <slot name="topbar" />
    </div>

    <!-- Konten utama dengan padding untuk bottom nav -->
    <main class="flex-1 overflow-y-auto" :class="hideNav ? 'pb-0' : 'pb-safe'">
      <slot />
    </main>

    <!-- Bottom Navigation (sembunyikan di onboarding) -->
    <BottomNav v-if="!hideNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './BottomNav.vue'

const route = useRoute()

// Sembunyikan nav di halaman yang memiliki meta noNav
const hideNav = computed(() => route.meta?.noNav === true)
</script>

<style scoped>
.pb-safe {
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
}
</style>
