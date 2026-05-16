<template>
  <nav class="bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 safe-area-bottom">
    <div class="flex items-center justify-around h-16">
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        class="nav-item flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 flex-1"
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Sun, BookOpen, Moon, Star } from 'lucide-vue-next'

const route = useRoute()

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/prayer', label: 'Sholat', icon: Sun },
  { to: '/quran', label: "Qur'an", icon: BookOpen },
  { to: '/cycle', label: 'Siklus', icon: Moon },
  { to: '/amal', label: 'Amalan', icon: Star },
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
</style>
