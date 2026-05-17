<template>
  <nav class="bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 safe-area-bottom">
    <div class="flex items-center h-16 px-1">
      <!-- Left items -->
      <RouterLink
        v-for="item in LEFT_ITEMS"
        :key="item.to"
        :to="item.to"
        class="nav-item flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 flex-1"
        :class="isActive(item.to) ? 'text-primary-600' : 'text-slate-400'"
        :aria-label="item.label"
      >
        <component :is="item.icon" :size="22" :stroke-width="isActive(item.to) ? 2.5 : 1.8" />
        <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
      </RouterLink>

      <!-- Center FAB spacer -->
      <div class="flex-1 flex items-center justify-center relative">
        <button
          @click="$emit('openPosting')"
          class="fab-btn absolute -top-7 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150"
          aria-label="Berbagi Cerita"
        >
          <span class="text-white text-2xl font-light leading-none">✦</span>
        </button>
      </div>

      <!-- Right items -->
      <RouterLink
        v-for="item in RIGHT_ITEMS"
        :key="item.to"
        :to="item.to"
        class="nav-item flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 flex-1"
        :class="isActive(item.to) ? 'text-primary-600' : 'text-slate-400'"
        :aria-label="item.label"
      >
        <component :is="item.icon" :size="22" :stroke-width="isActive(item.to) ? 2.5 : 1.8" />
        <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Home, Search, BarChart2, User } from 'lucide-vue-next'

defineEmits(['openPosting'])

const route = useRoute()

const LEFT_ITEMS = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/jelajahi', label: 'Jelajahi', icon: Search },
]

const RIGHT_ITEMS = [
  { to: '/tracker', label: 'Tracker', icon: BarChart2 },
  { to: '/profil', label: 'Profil', icon: User },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.nav-item { min-width: 44px; }
.fab-btn {
  background: linear-gradient(135deg, #f472b6, #ec4899);
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.45);
}
</style>
