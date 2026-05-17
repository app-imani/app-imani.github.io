import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

// ─── Constants ───────────────────────────────────────────────
export const CATEGORIES = [
  { key: 'semua', label: 'Semua', emoji: '✨' },
  { key: 'ibadah', label: 'Ibadah', emoji: '📿' },
  { key: 'muhasabah', label: 'Muhasabah', emoji: '🌸' },
  { key: 'ramadhan', label: 'Ramadhan', emoji: '🌙' },
  { key: 'sahur', label: 'Sahur & Buka', emoji: '🍽️' },
  { key: 'outfit', label: 'Outfit', emoji: '👗' },
  { key: 'tips', label: 'Tips Islami', emoji: '💚' },
  { key: 'wellness', label: 'Wellness', emoji: '🩺' },
  { key: 'quran', label: "Qur'an & Dzikir", emoji: '📖' },
]

export const REACTION_TYPES = [
  { key: 'aamiin', label: 'Aamiin', emoji: '🤲' },
  { key: 'masya_allah', label: 'Masya Allah', emoji: '🌸' },
  { key: 'barakallah', label: 'Barakallah', emoji: '✨' },
  { key: 'semangat', label: 'Semangat', emoji: '💪' },
]

export const POST_TYPES = [
  { key: 'ibadah', label: 'Cerita Ibadah', emoji: '📿', desc: 'Bagikan pencapaian ibadahmu hari ini' },
  { key: 'muhasabah', label: 'Muhasabah', emoji: '🌸', desc: 'Refleksi diri dan catatan hati' },
  { key: 'tips', label: 'Tips & Inspirasi', emoji: '💡', desc: 'Berbagi tips berguna sesama muslimah' },
  { key: 'question', label: 'Pertanyaan', emoji: '❓', desc: 'Tanya sesuatu kepada komunitas' },
  { key: 'moment', label: 'Momen Spesial', emoji: '🎀', desc: 'Abadikan momen berharga' },
]

// ─── Store ────────────────────────────────────────────────────
export const useSocialStore = defineStore('social', () => {
  const authStore = useAuthStore()

  // ─── State ───
  const posts = ref([])
  const myProfile = ref(null)
  const viewedProfile = ref(null)
  const currentPost = ref(null)
  const comments = ref([])
  const isLoading = ref(false)
  const isSending = ref(false)
  const error = ref(null)
  const activeCategory = ref('semua')
  const searchQuery = ref('')

  // Pagination
  const nextCursor = ref(null)
  const hasMore = ref(true)

  // ─── Computed ───
  const filteredPosts = computed(() => {
    let result = posts.value
    if (activeCategory.value !== 'semua') {
      result = result.filter(p => p.category === activeCategory.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(p =>
        p.content?.toLowerCase().includes(q) ||
        p.display_name?.toLowerCase().includes(q)
      )
    }
    return result
  })

  // ─── Helpers ───
  function gasUrl() {
    return import.meta.env.VITE_GAS_URL
  }

  async function gasCall(action, payload = {}) {
    const url = gasUrl()
    if (!url) throw new Error('GAS URL not configured')
    const token = await authStore.getIdToken()
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, token, ...payload }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message || 'GAS error')
    return data
  }

  // ─── Actions ───
  async function fetchPosts({ reset = false } = {}) {
    if (isLoading.value) return
    if (reset) {
      posts.value = []
      nextCursor.value = null
      hasMore.value = true
    }
    if (!hasMore.value) return

    isLoading.value = true
    error.value = null
    try {
      const data = await gasCall('getSocialPosts', {
        category: activeCategory.value === 'semua' ? null : activeCategory.value,
        cursor: nextCursor.value,
        limit: 20,
      })
      posts.value = reset ? data.posts : [...posts.value, ...data.posts]
      nextCursor.value = data.nextCursor || null
      hasMore.value = !!data.nextCursor
    } catch (e) {
      error.value = e.message
      // Seed with mock data for development
      if (posts.value.length === 0) posts.value = MOCK_POSTS
    } finally {
      isLoading.value = false
    }
  }

  async function createPost(postData) {
    isSending.value = true
    error.value = null
    try {
      const data = await gasCall('createSocialPost', postData)
      posts.value.unshift(data.post)
      return data.post
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      isSending.value = false
    }
  }

  async function fetchPost(postId) {
    // Reset immediately so no stale post is visible
    currentPost.value = null
    comments.value = []
    isLoading.value = true
    error.value = null
    try {
      const data = await gasCall('getSocialPost', { post_id: postId })
      currentPost.value = data.post
      comments.value = data.comments || []
    } catch (e) {
      error.value = e.message
      // Fallback 1 — already loaded in feed
      const cached = posts.value.find(p => p.post_id === postId)
      if (cached) {
        currentPost.value = { ...cached }
        comments.value = MOCK_COMMENTS
        return
      }
      // Fallback 2 — dev mock posts
      const mock = MOCK_POSTS.find(p => p.post_id === postId)
      if (mock) {
        currentPost.value = { ...mock }
        comments.value = MOCK_COMMENTS
      }
    } finally {
      isLoading.value = false
    }
  }

  async function addReaction(postId, reactionType) {
    // Optimistic update — apply immediately regardless of network
    const post = posts.value.find(p => p.post_id === postId) || currentPost.value
    if (post) {
      if (!post.reactions) post.reactions = {}
      // Toggle off if same reaction tapped again
      if (post.myReaction === reactionType) {
        post.reactions[reactionType] = Math.max(0, (post.reactions[reactionType] || 1) - 1)
        post.myReaction = null
      } else {
        // Undo previous reaction count if switching
        if (post.myReaction && post.reactions[post.myReaction]) {
          post.reactions[post.myReaction] = Math.max(0, post.reactions[post.myReaction] - 1)
        }
        post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1
        post.myReaction = reactionType
      }
    }
    // Sync to backend silently — ignore errors in dev (no GAS URL)
    gasCall('addSocialReaction', { post_id: postId, type: reactionType }).catch(() => {})
  }

  async function addComment(postId, content, parentId = null) {
    isSending.value = true
    try {
      const data = await gasCall('addSocialComment', { post_id: postId, content, parent_id: parentId })
      comments.value.push(data.comment)
      if (currentPost.value?.post_id === postId) {
        currentPost.value.comment_count = (currentPost.value.comment_count || 0) + 1
      }
      return data.comment
    } catch (e) {
      // Dev fallback: insert comment locally
      const localComment = {
        comment_id: `local-${Date.now()}`,
        display_name: 'Kamu',
        avatar_color: '#f472b6',
        content,
        timestamp: new Date().toISOString(),
        parent_id: parentId,
      }
      comments.value.push(localComment)
      if (currentPost.value?.post_id === postId) {
        currentPost.value.comment_count = (currentPost.value.comment_count || 0) + 1
      }
      return localComment
    } finally {
      isSending.value = false
    }
  }

  async function fetchProfile(userId = null) {
    isLoading.value = true
    try {
      const data = await gasCall('getSocialProfile', userId ? { user_id: userId } : {})
      if (userId) viewedProfile.value = data.profile
      else myProfile.value = data.profile
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(profileData) {
    isSending.value = true
    try {
      const data = await gasCall('updateSocialProfile', profileData)
      myProfile.value = data.profile
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      isSending.value = false
    }
  }

  async function followUser(userId) {
    try {
      await gasCall('followSocialUser', { target_user_id: userId })
      if (viewedProfile.value?.user_id === userId) {
        viewedProfile.value.is_following = true
        viewedProfile.value.follower_count = (viewedProfile.value.follower_count || 0) + 1
      }
    } catch (e) {
      console.error('Follow failed:', e)
    }
  }

  async function unfollowUser(userId) {
    try {
      await gasCall('unfollowSocialUser', { target_user_id: userId })
      if (viewedProfile.value?.user_id === userId) {
        viewedProfile.value.is_following = false
        viewedProfile.value.follower_count = Math.max(0, (viewedProfile.value.follower_count || 1) - 1)
      }
    } catch (e) {
      console.error('Unfollow failed:', e)
    }
  }

  function setCategory(cat) {
    activeCategory.value = cat
    fetchPosts({ reset: true })
  }

  return {
    posts, myProfile, viewedProfile, currentPost, comments,
    isLoading, isSending, error, activeCategory, searchQuery,
    nextCursor, hasMore, filteredPosts,
    fetchPosts, createPost, fetchPost,
    addReaction, addComment,
    fetchProfile, updateProfile,
    followUser, unfollowUser,
    setCategory,
  }
})

// ─── Mock data for development ────────────────────────────────
const MOCK_POSTS = [
  {
    post_id: '1', user_id: 'u1', type: 'ibadah', category: 'ibadah',
    display_name: 'Aisyah Nur', username: 'aisyahnur',
    avatar_initial: 'A', avatar_color: '#f472b6',
    content: 'Alhamdulillah hari ini berhasil sholat 5 waktu tepat waktu semua 🤲 Semoga istiqomah ya sisters!',
    media_urls: [], timestamp: new Date(Date.now() - 3600000).toISOString(),
    reactions: { aamiin: 24, masya_allah: 8 }, comment_count: 5,
    badges: ['streak_7'],
  },
  {
    post_id: '2', user_id: 'u2', type: 'tips', category: 'tips',
    display_name: 'Fatimah Az-Zahra', username: 'fatimahzahra',
    avatar_initial: 'F', avatar_color: '#a78bfa',
    content: 'Tips menjaga kekhusyukan sholat subuh di musim dingin: 1. Siapkan wudhu sebelum tidur 2. Pasang alarm 15 menit lebih awal 3. Baca doa bangun tidur...',
    media_urls: [], timestamp: new Date(Date.now() - 7200000).toISOString(),
    reactions: { masya_allah: 47, barakallah: 31, semangat: 12 }, comment_count: 18,
  },
  {
    post_id: '3', user_id: 'u3', type: 'muhasabah', category: 'muhasabah',
    display_name: 'Khadijah Sari', username: 'khadijahsari',
    avatar_initial: 'K', avatar_color: '#34d399',
    content: '🌸 Muhasabah malam ini... Ya Allah, ampuni atas waktu yang terbuang sia-sia hari ini. Semoga esok lebih baik.',
    media_urls: [], timestamp: new Date(Date.now() - 10800000).toISOString(),
    reactions: { aamiin: 89, masya_allah: 32 }, comment_count: 7,
  },
]

const MOCK_COMMENTS = [
  {
    comment_id: 'c1',
    display_name: 'Ummu Salma',
    avatar_color: '#f9a8d4',
    content: 'Aamiin ya Rabb, semoga istiqomah sisters! 🤲',
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    comment_id: 'c2',
    display_name: 'Raihanah Az-Zahrah',
    avatar_color: '#86efac',
    content: 'MasyaAllah, sangat menginspirasi 💚 Barakallah fiik!',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    comment_id: 'c3',
    display_name: 'Nadia Putri',
    avatar_color: '#c4b5fd',
    content: 'Semangat terus ya sister, doa terbaik untukmu ✨',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
]
