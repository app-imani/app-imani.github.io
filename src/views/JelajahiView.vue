<template>
  <PageWrapper>
    <template #topbar>
      <!-- ══ Sticky Header ══ -->
      <div class="jelajahi-header bg-white/95 backdrop-blur-md border-b border-slate-100/80 shadow-sm"
           style="padding-top: max(env(safe-area-inset-top, 0px), 0px);">
        <div class="max-w-2xl mx-auto px-4 pt-4 pb-0">

          <!-- Title row -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <!-- Accent orb -->
              <div class="w-8 h-8 rounded-2xl bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center shadow-sm shadow-pink-200/60 flex-shrink-0">
                <span class="text-white text-sm leading-none">✦</span>
              </div>
              <div>
                <h1 class="text-lg font-extrabold text-slate-800 leading-tight tracking-tight">Jelajahi</h1>
                <p class="text-[11px] text-slate-400 leading-none mt-0.5">Cerita inspiratif sesama muslimah</p>
              </div>
            </div>

            <!-- Search toggle -->
            <button
              @click="toggleSearch"
              class="w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200"
              :class="searchVisible
                ? 'bg-pink-500 shadow-md shadow-pink-200/60'
                : 'bg-slate-50 border border-slate-200'"
              aria-label="Cari"
            >
              <Search :size="16" :class="searchVisible ? 'text-white' : 'text-slate-500'" />
            </button>
          </div>

          <!-- Search bar (toggleable) -->
          <Transition name="fade-down">
            <div v-if="searchVisible" class="mb-3">
              <div class="flex items-center gap-2 bg-slate-50 rounded-2xl px-3.5 py-2.5 border border-slate-200 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
                <Search :size="14" class="text-slate-400 flex-shrink-0" />
                <input
                  ref="searchInput"
                  v-model="store.searchQuery"
                  placeholder="Cari cerita, username..."
                  class="flex-1 text-sm bg-transparent text-slate-700 placeholder-slate-400 outline-none"
                  autofocus
                />
                <Transition name="fade">
                  <button v-if="store.searchQuery" @click="store.searchQuery = ''" class="flex-shrink-0">
                    <X :size="14" class="text-slate-400 hover:text-slate-600 transition-colors" />
                  </button>
                </Transition>
              </div>
            </div>
          </Transition>

          <!-- Category pills (with fade edges) -->
          <div class="relative -mx-4">
            <div class="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div class="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div class="px-4">
              <CategoryPills v-model="store.activeCategory" @update:model-value="onCategoryChange" />
            </div>
          </div>
          <!-- Separator spacing -->
          <div class="h-3" />
        </div>
      </div>
    </template>

    <!-- ══ Feed Area ══ -->
    <div class="min-h-screen bg-slate-50">
      <div class="max-w-2xl mx-auto px-4 py-4 pb-8">

        <!-- Active search badge -->
        <Transition name="fade-down">
          <div v-if="store.searchQuery" class="flex items-center gap-2 mb-4 px-3 py-2 bg-pink-50 border border-pink-100 rounded-2xl">
            <Search :size="13" class="text-pink-400 flex-shrink-0" />
            <p class="text-xs text-pink-600 flex-1">
              Menampilkan hasil untuk <strong>"{{ store.searchQuery }}"</strong>
            </p>
            <button @click="store.searchQuery = ''" class="text-pink-400 hover:text-pink-600 transition-colors">
              <X :size="13" />
            </button>
          </div>
        </Transition>

        <!-- Loading skeleton -->
        <div v-if="store.isLoading && !store.posts.length" class="space-y-3">
          <div v-for="n in 3" :key="n"
               class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse">
            <div class="flex items-center gap-3 mb-3.5">
              <div class="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
              <div class="flex-1 space-y-1.5">
                <div class="h-3 w-28 bg-slate-200 rounded-full" />
                <div class="h-2.5 w-16 bg-slate-100 rounded-full" />
              </div>
              <div class="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
            <div class="space-y-2">
              <div class="h-3 w-full bg-slate-100 rounded-full" />
              <div class="h-3 w-4/5 bg-slate-100 rounded-full" />
              <div class="h-3 w-3/5 bg-slate-100 rounded-full" />
            </div>
            <div class="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50">
              <div class="h-3 w-8 bg-slate-100 rounded-full" />
              <div class="h-3 w-8 bg-slate-100 rounded-full" />
              <div class="h-3 w-8 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!store.isLoading && !store.filteredPosts.length"
             class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-50 to-fuchsia-50 border border-pink-100 flex items-center justify-center text-4xl mb-5 shadow-sm">
            🌸
          </div>
          <p class="font-bold text-slate-700 text-base">Belum ada cerita</p>
          <p class="text-sm text-slate-400 mt-1.5 max-w-[200px] leading-relaxed">
            {{ store.searchQuery ? 'Coba kata kunci lain, sisters' : 'Jadilah yang pertama berbagi inspirasi!' }}
          </p>
        </div>

        <!-- Posts feed -->
        <div v-else class="space-y-3">
          <FeedCard
            v-for="post in store.filteredPosts"
            :key="post.post_id"
            :post="post"
            @react="store.addReaction"
          />

          <!-- Load more -->
          <div v-if="store.hasMore" class="pt-1 pb-2">
            <button
              class="w-full py-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 font-medium shadow-sm active:bg-slate-50 disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
              :disabled="store.isLoading"
              @click="store.fetchPosts()"
            >
              <span v-if="store.isLoading" class="w-4 h-4 border-2 border-slate-300 border-t-pink-400 rounded-full animate-spin" />
              {{ store.isLoading ? 'Memuat...' : 'Lihat lebih banyak' }}
            </button>
          </div>

          <!-- End of feed indicator -->
          <div v-else-if="store.filteredPosts.length" class="py-6 flex flex-col items-center gap-1.5">
            <div class="flex items-center gap-2 text-slate-300">
              <div class="h-px w-12 bg-slate-200" />
              <span class="text-sm">✦</span>
              <div class="h-px w-12 bg-slate-200" />
            </div>
            <p class="text-xs text-slate-400">Kamu sudah melihat semua cerita hari ini</p>
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, X } from 'lucide-vue-next'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import CategoryPills from '@/components/social/CategoryPills.vue'
import FeedCard from '@/components/social/FeedCard.vue'
import { useSocialStore } from '@/stores/social'

const store = useSocialStore()
const searchVisible = ref(false)
const searchInput = ref(null)

function toggleSearch() {
  searchVisible.value = !searchVisible.value
  if (!searchVisible.value) {
    store.searchQuery = ''
  }
}

function onCategoryChange(cat) {
  store.setCategory(cat)
}

onMounted(() => {
  if (!store.posts.length) {
    store.fetchPosts({ reset: true })
  }
})
</script>

<style scoped>
/* ── Transitions ── */
.fade-down-enter-active, .fade-down-leave-active { transition: all 0.22s cubic-bezier(0.32, 0.72, 0, 1); }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-6px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Scrollbar hide (category pills) ── */
:deep(.scrollbar-hide::-webkit-scrollbar) { display: none; }
:deep(.scrollbar-hide) { -ms-overflow-style: none; scrollbar-width: none; }
</style>
