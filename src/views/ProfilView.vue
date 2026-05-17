<template>
  <PageWrapper>
    <template #topbar>
      <div class="bg-white border-b border-slate-100 px-4 pb-3"
           style="padding-top: max(env(safe-area-inset-top, 0px), 12px);">
        <div class="flex items-center gap-3">
          <button v-if="isOtherUser" @click="$router.back()" class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 transition-colors">
            <ChevronLeft :size="20" class="text-slate-600" />
          </button>
          <h1 class="text-xl font-bold text-slate-800 flex-1">Profil</h1>
          <RouterLink v-if="!isOtherUser" to="/settings" class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 transition-colors">
            <Settings :size="18" class="text-slate-600" />
          </RouterLink>
        </div>
      </div>
    </template>

    <!-- Loading state -->
    <div v-if="store.isLoading && !profile" class="flex items-center justify-center py-24">
      <div class="animate-spin w-8 h-8 rounded-full border-2 border-pink-400 border-t-transparent" />
    </div>

    <div v-else>
      <!-- Profile hero -->
      <div class="profile-hero px-5 pt-6 pb-5">
        <!-- Avatar -->
        <div class="flex items-start gap-4">
          <div
            class="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg"
            :style="{ background: avatarColor }"
          >
            {{ avatarInitial }}
          </div>
          <div class="flex-1 pt-1">
            <h2 class="text-xl font-bold text-slate-800">{{ profile?.display_name || authStore.displayName || 'Muslimah' }}</h2>
            <p class="text-sm text-slate-500">@{{ profile?.username || 'username' }}</p>
            <p v-if="profile?.bio" class="text-sm text-slate-600 mt-1.5 leading-snug">{{ profile.bio }}</p>
          </div>
        </div>

        <!-- Stats row -->
        <div class="flex gap-4 mt-5 pt-4 border-t border-white/40">
          <div class="text-center flex-1">
            <p class="text-xl font-bold text-slate-800">{{ profile?.post_count || 0 }}</p>
            <p class="text-xs text-slate-500">Postingan</p>
          </div>
          <div class="text-center flex-1">
            <p class="text-xl font-bold text-slate-800">{{ profile?.follower_count || 0 }}</p>
            <p class="text-xs text-slate-500">Pengikut</p>
          </div>
          <div class="text-center flex-1">
            <p class="text-xl font-bold text-slate-800">{{ profile?.following_count || 0 }}</p>
            <p class="text-xs text-slate-500">Mengikuti</p>
          </div>
        </div>

        <!-- Follow / Edit button -->
        <div class="mt-4">
          <button
            v-if="isOtherUser"
            class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="profile?.is_following
              ? 'border border-slate-300 text-slate-600'
              : 'text-white fab-gradient'"
            @click="toggleFollow"
          >
            {{ profile?.is_following ? 'Mengikuti ✓' : '+ Ikuti' }}
          </button>
          <button
            v-else
            class="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-600 transition-all"
            @click="showEditProfile = true"
          >
            ✏️ Edit Profil
          </button>
        </div>
      </div>

      <!-- Badges section -->
      <div class="px-4 py-4">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">🏆 Pencapaian</h3>
        <div class="flex gap-2 flex-wrap">
          <div
            v-for="badge in SAMPLE_BADGES"
            :key="badge.key"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            :class="badge.earned ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-400'"
          >
            <span>{{ badge.emoji }}</span>
            <span>{{ badge.label }}</span>
          </div>
        </div>
      </div>

      <!-- Posts grid -->
      <div class="px-4 pb-6">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">📝 Cerita-ku</h3>
        <div v-if="myPosts.length" class="space-y-3">
          <FeedCard
            v-for="post in myPosts"
            :key="post.post_id"
            :post="post"
            @react="store.addReaction"
          />
        </div>
        <div v-else class="text-center py-10">
          <p class="text-4xl mb-2">🌸</p>
          <p class="text-sm text-slate-500">Belum ada cerita yang dibagikan</p>
        </div>
      </div>
    </div>

    <!-- Edit Profile Sheet -->
    <Transition name="fade">
      <div v-if="showEditProfile" class="fixed inset-0 z-50 bg-black/40" @click.self="showEditProfile = false">
        <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-800">Edit Profil</h3>
            <button @click="showEditProfile = false" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <X :size="16" />
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-medium text-slate-500 block mb-1">Nama Tampil</label>
              <input v-model="editForm.display_name" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-400" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500 block mb-1">Username</label>
              <input v-model="editForm.username" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-400" placeholder="@username" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500 block mb-1">Bio</label>
              <textarea v-model="editForm.bio" rows="3" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-400 resize-none" placeholder="Perkenalkan dirimu..." />
            </div>
          </div>
          <button class="w-full mt-4 py-3 rounded-2xl text-white text-sm font-semibold fab-gradient" @click="saveProfile">
            Simpan Profil
          </button>
        </div>
      </div>
    </Transition>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Settings, X } from 'lucide-vue-next'
import PageWrapper from '@/components/layout/PageWrapper.vue'
import FeedCard from '@/components/social/FeedCard.vue'
import { useSocialStore } from '@/stores/social'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const store = useSocialStore()
const authStore = useAuthStore()

const showEditProfile = ref(false)
const editForm = ref({ display_name: '', username: '', bio: '' })

const isOtherUser = computed(() => !!route.params.userId)
const profile = computed(() => isOtherUser.value ? store.viewedProfile : store.myProfile)

const avatarInitial = computed(() => (profile.value?.display_name || authStore.displayName || 'M').charAt(0).toUpperCase())
const avatarColor = computed(() => {
  const colors = ['#f472b6', '#a78bfa', '#34d399', '#60a5fa', '#fb923c']
  const idx = avatarInitial.value.charCodeAt(0) % colors.length
  return colors[idx]
})

const myPosts = computed(() => store.posts.filter(p => p.user_id === (profile.value?.user_id || authStore.uid)))

const SAMPLE_BADGES = [
  { key: 'streak_7', emoji: '🔥', label: '7 Hari Streak', earned: true },
  { key: 'streak_30', emoji: '🌟', label: '30 Hari', earned: false },
  { key: 'tilawah', emoji: '📖', label: 'Khatam', earned: false },
  { key: 'puasa_7', emoji: '🌙', label: 'Puasa 7 Hari', earned: true },
  { key: 'sosial', emoji: '🌸', label: '10 Cerita', earned: false },
]

function toggleFollow() {
  if (profile.value?.is_following) store.unfollowUser(route.params.userId)
  else store.followUser(route.params.userId)
}

async function saveProfile() {
  await store.updateProfile(editForm.value)
  showEditProfile.value = false
}

onMounted(async () => {
  await store.fetchProfile(route.params.userId || null)
  if (!isOtherUser.value && store.myProfile) {
    editForm.value = {
      display_name: store.myProfile.display_name || '',
      username: store.myProfile.username || '',
      bio: store.myProfile.bio || '',
    }
  }
})
</script>

<style scoped>
.pt-safe-top { padding-top: env(safe-area-inset-top, 0px); }
.profile-hero {
  background: linear-gradient(160deg, #fdf2f8 0%, #fce7f3 50%, #ede9fe 100%);
}
.fab-gradient {
  background: linear-gradient(135deg, #f472b6, #ec4899);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
