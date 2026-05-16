<template>
  <PageWrapper>
    <template #topbar>
      <TopBar title="Al-Qur'an" subtitle="Target & Progres">
        <template #actions>
          <RouterLink to="/settings" class="p-2 rounded-xl active:bg-slate-100 transition-colors" aria-label="Pengaturan">
            <Settings :size="20" class="text-slate-400" />
          </RouterLink>
        </template>
      </TopBar>
    </template>

    <div class="pb-6 space-y-4">
      <!-- Circular progress + target -->
      <div class="mx-4 card flex flex-col items-center py-6">
        <CircularProgress
          :percent="quranStore.progressPercent"
          :size="150"
          :stroke-width="12"
        >
          <span class="text-2xl font-bold text-primary-600">{{ quranStore.progressPercent }}%</span>
        </CircularProgress>
        <p class="mt-4 text-sm font-semibold text-slate-700">Progres Khatam</p>
        <p class="text-xs text-slate-400 mt-1">{{ quranStore.currentJuz }} / 30 Juz dibaca</p>

        <!-- Target selector -->
        <div class="mt-4 flex items-center gap-3">
          <button @click="showTargetModal = true" class="px-4 py-2 rounded-xl bg-primary-50 text-primary-600 text-xs font-semibold active:scale-95 transition-transform">
            ⚙️ Atur Target
          </button>
          <button @click="showBookmarkModal = true" class="px-4 py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-semibold active:scale-95 transition-transform">
            🔖 Tandai Posisi
          </button>
        </div>
      </div>

      <!-- Bookmark card -->
      <div v-if="quranStore.bookmark" class="mx-4 card">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔖</span>
          <div class="flex-1">
            <p class="text-xs text-slate-400">Terakhir baca</p>
            <p class="text-sm font-semibold text-slate-800">
              Surah {{ quranStore.bookmark.surahName }} · Ayat {{ quranStore.bookmark.ayah }}
            </p>
            <p class="text-xs text-slate-400 mt-0.5">Juz {{ quranStore.bookmark.juz }}</p>
          </div>
          <button @click="showBookmarkModal = true" class="text-xs text-primary-600 font-semibold shrink-0">
            Edit 🔖
          </button>
        </div>
      </div>

      <!-- Daily log -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Catat Bacaan Hari Ini</h2>
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1">
            <label class="text-xs text-slate-500 mb-1 block">Halaman mulai</label>
            <input v-model.number="readFrom" type="number" min="1" max="604" class="input-sm" />
          </div>
          <div class="text-slate-300 mt-5">→</div>
          <div class="flex-1">
            <label class="text-xs text-slate-500 mb-1 block">Halaman selesai</label>
            <input v-model.number="readTo" type="number" min="1" max="604" class="input-sm" />
          </div>
        </div>
        <button
          @click="logReading"
          :disabled="!readFrom || !readTo || readTo < readFrom"
          class="w-full py-3 rounded-2xl font-semibold text-sm text-white bg-primary-600 disabled:opacity-40 active:scale-95 transition-all"
        >
          + Catat Bacaan
        </button>
      </div>

      <!-- Audio player -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Murottal</h2>
        <div class="flex items-center gap-3 mb-3">
          <label class="text-xs text-slate-500 shrink-0">Surah:</label>
          <select v-model="selectedSurahForAudio" class="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none">
            <option v-for="s in surahList" :key="s.number" :value="s">{{ s.number }}. {{ s.name }}</option>
          </select>
        </div>
        <AudioPlayer
          v-if="selectedSurahForAudio"
          :surah-number="selectedSurahForAudio.number"
          :total-ayahs="selectedSurahForAudio.verses"
          :title="selectedSurahForAudio.name"
          :subtitle="selectedSurahForAudio.arabic"
        />
      </div>

      <!-- Surah pilihan -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Surah Pilihan</h2>
        <div class="space-y-2">
          <div
            v-for="surah in featuredSurahs"
            :key="surah.number"
            class="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors"
            @click="selectedSurahForAudio = surah"
          >
            <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
              {{ surah.number }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-800">{{ surah.name }}</p>
              <p class="text-xs text-slate-400">{{ surah.meaning }} · {{ surah.verses }} ayat</p>
            </div>
            <p class="text-sm font-arabic text-slate-500">{{ surah.arabic }}</p>
          </div>
        </div>
      </div>

      <!-- Reading history -->
      <div class="mx-4 card">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Riwayat Bacaan</h2>
        <EmptyState
          v-if="!quranStore.logs?.length"
          illustration="📖"
          title="Belum ada catatan bacaan"
          description="Yuk mulai tilawah dan catat progresmu!"
        />
        <div v-else class="space-y-2">
          <div
            v-for="log in recentLogs"
            :key="log.id"
            class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
          >
            <div>
              <p class="text-sm font-medium text-slate-700">Hal. {{ log.pageFrom }}–{{ log.pageTo }}</p>
              <p class="text-xs text-slate-400">{{ formatDate(log.date) }}</p>
            </div>
            <span class="text-xs text-primary-600 font-semibold">
              {{ log.pageTo - log.pageFrom + 1 }} hal
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Target modal -->
    <ModalBase v-model="showTargetModal" title="Atur Target Khatam">
      <div class="p-5 space-y-4">
        <div>
          <label class="text-sm font-medium text-slate-700 mb-2 block">Mode target</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="mode in TARGET_MODES"
              :key="mode.value"
              @click="targetMode = mode.value"
              class="py-3 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95"
              :class="targetMode === mode.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-600'"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700 mb-2 block">
            {{ targetMode === 'pages_per_day' ? 'Halaman per hari' : 'Target khatam dalam (hari)' }}
          </label>
          <input v-model.number="targetValue" type="number" min="1" max="604" class="w-full input-sm" />
        </div>
        <button @click="saveTarget" class="w-full py-3 rounded-2xl bg-primary-600 text-white font-semibold text-sm active:scale-95 transition-all">
          Simpan Target
        </button>
      </div>
    </ModalBase>

    <!-- Bookmark modal -->
    <ModalBase v-model="showBookmarkModal" title="Tandai Posisi Bacaan">
      <div class="p-5 space-y-4">
        <div>
          <label class="text-sm font-medium text-slate-700 mb-2 block">Surah</label>
          <select v-model="bookmarkSurah" class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none">
            <option v-for="s in surahList" :key="s.number" :value="s">{{ s.number }}. {{ s.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700 mb-2 block">Ayat ke-</label>
          <input v-model.number="bookmarkAyah" type="number" min="1" :max="bookmarkSurah?.verses || 286" class="w-full input-sm" />
        </div>
        <button @click="saveBookmark" class="w-full py-3 rounded-2xl bg-amber-500 text-white font-semibold text-sm active:scale-95 transition-all">
          🔖 Simpan Bookmark
        </button>
      </div>
    </ModalBase>
  </PageWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { RouterLink } from 'vue-router'
import { Settings } from 'lucide-vue-next'

import PageWrapper from '@/components/layout/PageWrapper.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TopBar from '@/components/layout/TopBar.vue'
import CircularProgress from '@/components/quran/CircularProgress.vue'
import AudioPlayer from '@/components/quran/AudioPlayer.vue'
import ModalBase from '@/components/ui/ModalBase.vue'

import { useQuranStore } from '@/stores/quran'
import surahListRaw from '@/assets/data/surah-list.json'

const quranStore = useQuranStore()

// Normalize surah-list.json fields to consistent shape
const surahList = surahListRaw.map(s => ({
  number: s.id,
  name: s.name_latin,
  arabic: s.name_arabic,
  meaning: s.recommended?.notes || '',
  verses: s.verses,
  juz: s.juz,
})).sort((a, b) => a.number - b.number)

const featuredSurahs = surahListRaw
  .filter(s => s.recommended?.notes)
  .sort((a, b) => a.id - b.id)
  .slice(0, 8)
  .map(s => ({
    number: s.id,
    name: s.name_latin,
    arabic: s.name_arabic,
    meaning: s.recommended?.notes || '',
    verses: s.verses,
    juz: s.juz,
  }))

const readFrom = ref(null)
const readTo = ref(null)
const selectedSurahForAudio = ref(surahList[0])

const showTargetModal = ref(false)
const showBookmarkModal = ref(false)
const targetMode = ref(quranStore.goal?.type || 'pages_per_day')
const targetValue = ref(quranStore.goal?.value || 2)
const bookmarkSurah = ref(null)
const bookmarkAyah = ref(1)

const TARGET_MODES = [
  { value: 'pages_per_day', label: '📄 Halaman/Hari' },
  { value: 'khatam_days', label: '📅 Target Hari' },
]

const progressLabel = computed(() => `${quranStore.progressPercent}%`)

const recentLogs = computed(() => {
  return [...(quranStore.logs || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
})

function logReading() {
  if (!readFrom.value || !readTo.value || readTo.value < readFrom.value) return
  quranStore.addLog({ pageFrom: readFrom.value, pageTo: readTo.value, date: dayjs().format('YYYY-MM-DD') })
  readFrom.value = null
  readTo.value = null
  window.$toast?.('Bacaan dicatat 📖 Barakallahu fiik!', 'success')
}

function saveTarget() {
  quranStore.setTarget(targetMode.value, targetValue.value)
  showTargetModal.value = false
  window.$toast?.('Target disimpan ✨', 'success')
}

function saveBookmark() {
  if (!bookmarkSurah.value) return
  quranStore.setBookmark({
    surahName: bookmarkSurah.value.name,
    surahNumber: bookmarkSurah.value.number,
    ayah: bookmarkAyah.value,
    juz: bookmarkSurah.value.juz || '–',
  })
  showBookmarkModal.value = false
  window.$toast?.('Bookmark disimpan 🔖', 'success')
}

function formatDate(d) {
  return dayjs(d).format('D MMM YYYY')
}
</script>

<style scoped>
.input-sm {
  @apply w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary-300;
}
</style>
