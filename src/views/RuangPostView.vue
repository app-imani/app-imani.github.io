<template>
  <PageWrapper>
    <template #topbar>
      <div class="bg-white border-b border-slate-100 px-4 pb-3 flex items-center gap-3"
           style="padding-top: max(env(safe-area-inset-top, 0px), 12px);">
        <button @click="$router.back()" class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 transition-colors">
          <ChevronLeft :size="20" class="text-slate-600" />
        </button>
        <h1 class="text-lg font-bold text-slate-800 flex-1">Cerita</h1>
        <button class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 transition-colors">
          <Share2 :size="18" class="text-slate-600" />
        </button>
      </div>
    </template>

    <!-- Loading -->
    <div v-if="store.isLoading && !store.currentPost" class="flex items-center justify-center py-24">
      <div class="animate-spin w-8 h-8 rounded-full border-2 border-pink-400 border-t-transparent" />
    </div>

    <div v-else-if="store.currentPost">
      <!-- Post content -->
      <div class="px-4 pt-4">
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <!-- Author header -->
          <div class="flex items-center gap-3 px-4 pt-4 pb-3">
            <RouterLink :to="`/profil/${post.user_id}`">
              <div
                class="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                :style="{ background: post.avatar_color || '#f472b6' }"
              >
                {{ post.avatar_initial || '?' }}
              </div>
            </RouterLink>
            <div>
              <p class="font-semibold text-slate-800">{{ post.display_name }}</p>
              <p class="text-xs text-slate-400">{{ timeAgo(post.timestamp) }}</p>
            </div>
          </div>

          <!-- Full content -->
          <div class="px-4 pb-4">
            <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
          </div>

          <!-- Media -->
          <div v-if="post.media_urls?.length" class="px-4 pb-4">
            <img :src="post.media_urls[0]" class="w-full rounded-xl object-cover max-h-72" alt="post media" />
          </div>

          <!-- Reactions -->
          <div class="border-t border-slate-100 px-4 py-3">
            <p class="text-xs text-slate-500 font-medium mb-2">Reaksi</p>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="reaction in REACTION_TYPES"
                :key="reaction.key"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150 active:scale-105"
                :class="post.myReaction === reaction.key
                  ? 'bg-pink-50 border-pink-300 text-pink-600 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-pink-200'"
                @click="handleReact($event, reaction)"
              >
                <span class="transition-transform duration-150" :class="post.myReaction === reaction.key ? 'scale-125' : ''">{{ reaction.emoji }}</span>
                <span>{{ reaction.label }}</span>
                <span v-if="post.reactions?.[reaction.key]" class="font-bold">
                  {{ post.reactions[reaction.key] }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments section -->
      <div class="px-4 pt-5 pb-4">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">
          💬 Komentar ({{ store.comments.length }})
        </h3>

        <!-- Comment list -->
        <div class="space-y-3 mb-4">
          <div
            v-for="comment in store.comments"
            :key="comment.comment_id"
            class="flex gap-3"
          >
            <div
              class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              :style="{ background: comment.avatar_color || '#a78bfa' }"
            >
              {{ (comment.display_name || 'M').charAt(0) }}
            </div>
            <div class="flex-1 bg-slate-50 rounded-2xl px-3 py-2">
              <p class="text-xs font-semibold text-slate-700">{{ comment.display_name }}</p>
              <p class="text-sm text-slate-600 mt-0.5">{{ comment.content }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ timeAgo(comment.timestamp) }}</p>
            </div>
          </div>

          <div v-if="!store.comments.length" class="text-center py-6">
            <p class="text-slate-400 text-sm">Belum ada komentar. Jadilah yang pertama! 🌸</p>
          </div>
        </div>

        <!-- Comment input -->
        <div class="flex gap-2 items-end">
          <div class="flex-1 bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-pink-300">
            <textarea
              v-model="newComment"
              placeholder="Tulis komentar... (Aamiin 🤲)"
              rows="2"
              class="w-full text-sm text-slate-700 bg-transparent resize-none outline-none placeholder-slate-400"
            />
          </div>
          <button
            class="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
            :class="newComment.trim() ? 'fab-gradient text-white' : 'bg-slate-200 text-slate-400'"
            :disabled="!newComment.trim() || store.isSending"
            @click="submitComment"
          >
            <Send :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Error / not found -->
    <div v-else class="text-center py-20 px-6">
      <p class="text-4xl mb-3">🌸</p>
      <p class="font-semibold text-slate-700">Cerita tidak ditemukan</p>
      <button class="mt-4 text-pink-500 text-sm" @click="$router.back()">Kembali</button>
    </div>

    <!-- Floating emoji burst — di dalam PageWrapper agar single root node (fix Transition blank page) -->
    <Teleport to="body">
      <span
        v-for="p in particles"
        :key="p.id"
        class="reaction-particle pointer-events-none fixed z-[9999] select-none leading-none"
        :style="{
          left: p.x + 'px',
          top:  p.y + 'px',
          '--vx': p.vx + 'px',
          fontSize: (1.2 * p.scale) + 'rem',
          animationDelay: p.delay + 'ms',
        }"
      >{{ p.emoji }}</span>
    </Teleport>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Share2, Send } from 'lucide-vue-next'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import { useSocialStore, REACTION_TYPES } from '@/stores/social'
import { useReactionFX } from '@/composables/useReactionFX'

const route = useRoute()
const store = useSocialStore()
const newComment = ref('')
const { particles, triggerBurst } = useReactionFX()

const post = computed(() => store.currentPost)

function handleReact(event, reaction) {
  if (!post.value) return
  triggerBurst(event, reaction.emoji, reaction.key)
  store.addReaction(post.value.post_id, reaction.key)
}

async function submitComment() {
  if (!newComment.value.trim()) return
  await store.addComment(route.params.id, newComment.value.trim())
  newComment.value = ''
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = (Date.now() - new Date(ts).getTime()) / 1000
  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}

onMounted(() => {
  store.fetchPost(route.params.id)
})
</script>

<style scoped>
.pt-safe-top { padding-top: env(safe-area-inset-top, 0px); }
.fab-gradient { background: linear-gradient(135deg, #f472b6, #ec4899); }
.reaction-particle {
  animation: rxFloat 0.85s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
@keyframes rxFloat {
  0%   { opacity: 1;   transform: translate(0, 0)             scale(1);   }
  60%  { opacity: 0.8; transform: translate(var(--vx), -44px) scale(1.1); }
  100% { opacity: 0;   transform: translate(var(--vx), -80px) scale(0.4); }
}
</style>
