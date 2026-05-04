<template>
  <div id="app" :class="appThemeClass">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
    <ToastNotif />
    <RewardAnimation />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useCycleStore } from '@/stores/cycle'
import ToastNotif from '@/components/ui/ToastNotif.vue'
import RewardAnimation from '@/components/ui/RewardAnimation.vue'

const cycleStore = useCycleStore()

const appThemeClass = computed(() => ({
  'theme-haid': cycleStore.isHaidActive,
}))

watch(
  () => cycleStore.isHaidActive,
  (isHaid) => {
    document.body.classList.toggle('theme-haid', isHaid)
  },
  { immediate: true }
)

onMounted(() => {
  cycleStore.loadFromStorage()
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
