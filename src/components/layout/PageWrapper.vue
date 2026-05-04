<template>
  <div class="page-wrapper min-h-screen bg-surface flex flex-col">
    <!-- Konten utama dengan padding untuk bottom nav -->
    <main class="flex-1 pb-safe overflow-y-auto">
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
