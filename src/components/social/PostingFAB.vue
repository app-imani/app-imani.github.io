<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
  </Transition>

  <!-- Bottom Sheet -->
  <Transition name="slide-up">
    <div v-if="show" class="fixed bottom-0 left-0 right-0 z-[61] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1">
        <div class="w-10 h-1 bg-slate-200 rounded-full" />
      </div>

      <!-- Header -->
      <div class="px-5 pt-2 pb-4">
        <h2 class="text-lg font-bold text-slate-800">Berbagi Cerita ✦</h2>
        <p class="text-sm text-slate-500 mt-0.5">Bagikan momen islami-mu kepada komunitas</p>
      </div>

      <!-- Step 1: Choose post type -->
      <div v-if="step === 'type'" class="px-5 pb-6 space-y-3">
        <button
          v-for="type in POST_TYPES"
          :key="type.key"
          class="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 active:bg-slate-100 transition-colors text-left"
          @click="selectType(type.key)"
        >
          <span class="text-2xl">{{ type.emoji }}</span>
          <div>
            <p class="font-semibold text-slate-800 text-sm">{{ type.label }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ type.desc }}</p>
          </div>
          <ChevronRight :size="16" class="ml-auto text-slate-400 flex-shrink-0" />
        </button>
      </div>

      <!-- Step 2: Compose -->
      <div v-else class="px-5 pb-8">
        <!-- Back button -->
        <button class="flex items-center gap-1.5 text-sm text-pink-500 mb-4" @click="step = 'type'">
          <ChevronLeft :size="16" /> Pilih jenis lain
        </button>

        <!-- Post type header -->
        <div class="flex items-center gap-2 mb-4">
          <span class="text-xl">{{ activeType.emoji }}</span>
          <span class="font-semibold text-slate-700">{{ activeType.label }}</span>
        </div>

        <!-- Auto-fill tracker data hint -->
        <div v-if="trackerSummary" class="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <p class="text-xs text-emerald-700 font-medium">📊 Data tracker-mu hari ini</p>
          <p class="text-xs text-emerald-600 mt-1">{{ trackerSummary }}</p>
          <button class="text-xs text-emerald-700 underline mt-1" @click="insertTrackerData">
            Sisipkan ke cerita
          </button>
        </div>

        <!-- Category -->
        <div class="mb-3">
          <label class="text-xs font-medium text-slate-500 mb-1.5 block">Kategori</label>
          <div class="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            <button
              v-for="cat in CATEGORIES.slice(1)"
              :key="cat.key"
              class="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all"
              :class="form.category === cat.key
                ? 'bg-pink-500 text-white border-pink-500'
                : 'border-slate-200 text-slate-600'"
              @click="form.category = cat.key"
            >
              {{ cat.emoji }} {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Content textarea -->
        <div class="mb-4">
          <label class="text-xs font-medium text-slate-500 mb-1.5 block">Cerita-mu</label>
          <textarea
            v-model="form.content"
            :placeholder="placeholderText"
            rows="5"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
          <p class="text-xs text-slate-400 text-right mt-1">{{ form.content.length }}/500</p>
        </div>

        <!-- Visibility -->
        <div class="mb-5">
          <label class="text-xs font-medium text-slate-500 mb-1.5 block">Visibilitas</label>
          <div class="flex gap-2">
            <button
              v-for="vis in visibilities"
              :key="vis.key"
              class="flex-1 py-2 rounded-xl text-xs font-medium border transition-all"
              :class="form.visibility === vis.key
                ? 'bg-pink-500 text-white border-pink-500'
                : 'border-slate-200 text-slate-600'"
              @click="form.visibility = vis.key"
            >
              {{ vis.emoji }} {{ vis.label }}
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button
          class="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95"
          :class="canSubmit ? 'fab-gradient shadow-lg shadow-pink-200' : 'bg-slate-200 text-slate-400'"
          :disabled="!canSubmit || store.isSending"
          @click="submit"
        >
          <span v-if="store.isSending">Memposting...</span>
          <span v-else>✦ Bagikan Cerita</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronRight, ChevronLeft } from 'lucide-vue-next'
import { useSocialStore, POST_TYPES, CATEGORIES } from '@/stores/social'
import { useAmalStore } from '@/stores/amal'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const store = useSocialStore()
const amalStore = useAmalStore()

const step = ref('type')
const selectedTypeKey = ref(null)

const form = ref({
  category: 'ibadah',
  content: '',
  visibility: 'public',
  media_urls: [],
})

const visibilities = [
  { key: 'public', label: 'Semua', emoji: '🌐' },
  { key: 'followers', label: 'Pengikut', emoji: '👥' },
  { key: 'private', label: 'Saya', emoji: '🔒' },
]

const activeType = computed(() => POST_TYPES.find(t => t.key === selectedTypeKey.value) || POST_TYPES[0])

const placeholderText = computed(() => {
  const map = {
    ibadah: 'Ceritakan pencapaian ibadahmu hari ini...',
    muhasabah: 'Apa yang ingin kamu renungkan malam ini?',
    tips: 'Berbagi tips bermanfaat untuk sesama muslimah...',
    question: 'Apa yang ingin kamu tanyakan?',
    moment: 'Ceritakan momen spesialmu...',
  }
  return map[selectedTypeKey.value] || 'Tulis ceritamu...'
})

const trackerSummary = computed(() => {
  if (!selectedTypeKey.value === 'ibadah') return null
  try {
    const today = amalStore?.todayLog
    if (!today) return null
    const parts = []
    if (today.fajr) parts.push('Subuh ✓')
    if (today.dhuhr) parts.push("Dzuhur ✓")
    if (today.asr) parts.push('Ashar ✓')
    if (today.maghrib) parts.push('Maghrib ✓')
    if (today.isha) parts.push("Isya' ✓")
    return parts.length ? parts.join(' · ') : null
  } catch { return null }
})

const canSubmit = computed(() =>
  form.value.content.trim().length >= 10 &&
  form.value.content.length <= 500 &&
  form.value.category
)

function selectType(key) {
  selectedTypeKey.value = key
  form.value.category = key === 'muhasabah' ? 'muhasabah'
    : key === 'quran' ? 'quran'
    : 'ibadah'
  step.value = 'compose'
}

function insertTrackerData() {
  if (trackerSummary.value) {
    form.value.content = `Alhamdulillah hari ini: ${trackerSummary.value}\n\n${form.value.content}`
  }
}

async function submit() {
  if (!canSubmit.value) return
  try {
    await store.createPost({
      type: selectedTypeKey.value,
      category: form.value.category,
      content: form.value.content,
      visibility: form.value.visibility,
      media_urls: form.value.media_urls,
    })
    // Reset
    form.value = { category: 'ibadah', content: '', visibility: 'public', media_urls: [] }
    step.value = 'type'
    emit('close')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.fab-gradient {
  background: linear-gradient(135deg, #f472b6, #ec4899);
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>
