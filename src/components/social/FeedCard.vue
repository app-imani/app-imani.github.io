<template>
  <div
    class="feed-card bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden active:scale-[0.98] transition-transform duration-150 cursor-pointer"
    @click="$router.push(`/ruang/${post.post_id}`)"
  >
    <!-- Header -->
    <div class="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
      <!-- Avatar -->
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        :style="{ background: post.avatar_color || '#f472b6' }"
      >
        {{ post.avatar_initial || '?' }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-800 truncate">{{ post.display_name }}</p>
        <p class="text-xs text-slate-400">{{ timeAgo(post.timestamp) }}</p>
      </div>
      <!-- Category badge -->
      <span class="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
        :class="categoryStyle(post.category)">
        {{ categoryEmoji(post.category) }} {{ categoryLabel(post.category) }}
      </span>
    </div>

    <!-- Content -->
    <div class="px-4 pb-3">
      <p class="text-sm text-slate-700 leading-relaxed line-clamp-3">{{ post.content }}</p>
    </div>

    <!-- Media (if any) -->
    <div v-if="post.media_urls?.length" class="px-4 pb-3">
      <img
        :src="post.media_urls[0]"
        alt="post media"
        class="w-full rounded-xl object-cover max-h-48"
      />
    </div>

    <!-- Badges -->
    <div v-if="post.badges?.length" class="px-4 pb-2 flex gap-1 flex-wrap">
      <span
        v-for="badge in post.badges.slice(0, 3)"
        :key="badge"
        class="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full"
      >
        {{ BADGE_LABELS[badge] || badge }}
      </span>
    </div>

    <!-- Reactions footer -->
    <div class="flex items-center gap-3 px-4 py-2.5 border-t border-slate-50">
      <button
        v-for="reaction in REACTION_TYPES"
        :key="reaction.key"
        class="reaction-btn flex items-center gap-1 text-xs text-slate-500 transition-all duration-150 active:scale-110"
        :class="post.myReaction === reaction.key
          ? 'text-pink-500 font-semibold'
          : 'hover:text-pink-400'"
        @click.stop="handleReact($event, reaction)"
      >
        <span class="transition-transform duration-150" :class="post.myReaction === reaction.key ? 'scale-125' : ''">{{ reaction.emoji }}</span>
        <span v-if="post.reactions?.[reaction.key]">{{ post.reactions[reaction.key] }}</span>
      </button>
      <div class="flex-1" />
      <span class="text-xs text-slate-400 flex items-center gap-1">
        <MessageCircle :size="12" />
        {{ post.comment_count || 0 }}
      </span>
    </div>
  </div>

  <!-- ── Floating emoji burst (Teleport to body for correct fixed positioning) ── -->
  <Teleport to="body">
    <span
      v-for="p in particles"
      :key="p.id"
      class="reaction-particle pointer-events-none fixed z-[9999] select-none leading-none"
      :style="{
        left: p.x + 'px',
        top:  p.y + 'px',
        '--vx': p.vx + 'px',
        fontSize: (1.1 * p.scale) + 'rem',
        animationDelay: p.delay + 'ms',
      }"
    >{{ p.emoji }}</span>
  </Teleport>
</template>

<script setup>
import { MessageCircle } from 'lucide-vue-next'
import { CATEGORIES, REACTION_TYPES } from '@/stores/social'
import { useReactionFX } from '@/composables/useReactionFX'

const props = defineProps({ post: { type: Object, required: true } })
const emit  = defineEmits(['react'])

const { particles, triggerBurst } = useReactionFX()

function handleReact(event, reaction) {
  triggerBurst(event, reaction.emoji, reaction.key)
  emit('react', props.post.post_id, reaction.key)
}

const BADGE_LABELS = {
  streak_7: '🔥 7 Hari Streak',
  streak_30: '🌟 30 Hari Streak',
  tilawah_khatam: '📖 Khatam',
  puasa_7: '🌙 Puasa 7 Hari',
}

function categoryEmoji(key) {
  return CATEGORIES.find(c => c.key === key)?.emoji || '✨'
}
function categoryLabel(key) {
  return CATEGORIES.find(c => c.key === key)?.label || key
}
function categoryStyle(key) {
  const map = {
    ibadah: 'bg-emerald-50 text-emerald-600',
    muhasabah: 'bg-pink-50 text-pink-600',
    ramadhan: 'bg-purple-50 text-purple-600',
    sahur: 'bg-orange-50 text-orange-600',
    outfit: 'bg-rose-50 text-rose-600',
    tips: 'bg-green-50 text-green-600',
    wellness: 'bg-blue-50 text-blue-600',
    quran: 'bg-teal-50 text-teal-600',
  }
  return map[key] || 'bg-slate-50 text-slate-600'
}
function timeAgo(ts) {
  if (!ts) return ''
  const diff = (Date.now() - new Date(ts).getTime()) / 1000
  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}
</script>

<style scoped>
.reaction-particle {
  animation: rxFloat 0.85s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
@keyframes rxFloat {
  0%   { opacity: 1;   transform: translate(0, 0)             scale(1);   }
  60%  { opacity: 0.8; transform: translate(var(--vx), -40px) scale(1.1); }
  100% { opacity: 0;   transform: translate(var(--vx), -72px) scale(0.4); }
}
</style>
