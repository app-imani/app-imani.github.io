<template>
  <div class="px-4 py-2">

    <!-- Privacy notice -->
    <div class="flex items-center gap-2 mb-4 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
      <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        <Lock :size="12" class="text-slate-400" />
      </div>
      <p class="text-xs text-slate-500 leading-relaxed">Hanya kamu yang bisa membaca muhasabah ini 🔒</p>
    </div>

    <!-- Already filled today -->
    <div v-if="todayMuhasabah.filled && !isEditing" class="space-y-3">
      <!-- Done header -->
      <div class="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-center shadow-md">
        <span class="text-3xl block mb-1.5">✨</span>
        <p class="text-white font-bold text-sm">Muhasabah hari ini sudah terisi</p>
        <p class="text-white/70 text-xs mt-0.5">{{ formatTime(todayMuhasabah.timestamp) }}</p>
      </div>

      <!-- Filled answers -->
      <div
        v-for="q in filledQuestions"
        :key="q.key"
        class="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
      >
        <p class="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-2">{{ q.label }}</p>
        <p class="text-sm text-slate-700 leading-relaxed italic">"{{ q.value }}"</p>
      </div>

      <button
        @click="isEditing = true"
        class="w-full py-3 rounded-2xl border-2 border-indigo-200 text-indigo-600 text-sm font-semibold active:scale-95 transition-transform"
      >
        ✏️ Edit Muhasabah
      </button>
    </div>

    <!-- Form — available after 20:00 OR when editing -->
    <div v-else-if="showForm" class="space-y-4">
      <!-- Header card -->
      <div class="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 p-5 text-center shadow-lg relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
        <span class="text-3xl block mb-2 relative">🌙</span>
        <p class="text-white font-bold text-base relative">Muhasabah Malam</p>
        <p class="text-white/70 text-xs mt-1 relative leading-relaxed">Refleksi diri di penghujung hari — jawab semampumu</p>
      </div>

      <!-- Questions -->
      <div v-for="q in currentQuestions" :key="q.key" class="space-y-2">
        <label class="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span class="text-sm">{{ q.emoji }}</span>
          {{ q.label }}
        </label>
        <textarea
          v-model="form[q.key]"
          :placeholder="q.placeholder"
          rows="2"
          class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder-slate-300 resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all leading-relaxed shadow-sm"
        />
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2.5">
        <button
          @click="submitMuhasabah"
          :disabled="!hasAnyAnswer"
          class="flex-1 py-3.5 rounded-2xl font-bold text-sm disabled:opacity-40 active:scale-95 transition-all shadow-md"
          :class="hasAnyAnswer
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-200'
            : 'bg-slate-100 text-slate-400'"
        >
          Simpan Muhasabah ✨
        </button>
        <button
          @click="isEditing ? (isEditing = false) : (skipped = true)"
          class="px-4 py-3.5 rounded-2xl bg-slate-100 text-slate-500 text-sm font-semibold active:scale-95 transition-transform"
        >
          {{ isEditing ? 'Batal' : 'Lewati' }}
        </button>
      </div>
    </div>

    <!-- Too early (before 20:00, not editing, not filled) -->
    <div v-else-if="!skipped" class="text-center py-10">
      <div class="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <span class="text-4xl">🌤️</span>
      </div>
      <p class="text-sm font-bold text-slate-700 mb-1">Muhasabah dibuka pukul 20:00</p>
      <p class="text-xs text-slate-400 leading-relaxed max-w-48 mx-auto">
        Waktu terbaik refleksi diri adalah di penghujung hari ✨
      </p>
    </div>

    <!-- Skipped state -->
    <div v-else class="text-center py-8">
      <p class="text-sm text-slate-500">Muhasabah dilewati hari ini</p>
      <button @click="skipped = false" class="mt-2 text-xs text-indigo-500 font-medium underline">
        Isi sekarang
      </button>
    </div>

    <!-- Closing quote after save -->
    <Transition name="slide-up">
      <div v-if="showClosingQuote" class="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-5 text-center">
        <p class="font-arabic text-base text-indigo-800 leading-loose mb-2">{{ closingQuote.arabic }}</p>
        <p class="text-sm text-indigo-700 italic leading-relaxed mb-1">{{ closingQuote.text }}</p>
        <p class="text-xs text-indigo-400 font-medium">{{ closingQuote.source }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Lock } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'
import questionsData from '@/assets/data/muhasabah_questions.json'
import quotesData from '@/assets/data/islamic_quotes.json'

const amalStore = useAmalStore()

const todayMuhasabah = computed(() => amalStore.todayLog.muhasabah || { filled: false })
const isEditing = ref(false)
const showClosingQuote = ref(false)
const skipped = ref(false)

const questionIndex = computed(() => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return dayOfYear % questionsData.length
})

const todayQuestion = computed(() => questionsData[questionIndex.value])

const currentQuestions = computed(() => [
  { key: 'syukur', emoji: '🌸', label: 'Bersyukur', placeholder: todayQuestion.value.syukur },
  { key: 'amal_terbaik', emoji: '✨', label: 'Amalan Terbaik Hari Ini', placeholder: todayQuestion.value.amal },
  { key: 'perbaikan', emoji: '💪', label: 'Yang Akan Diperbaiki Besok', placeholder: todayQuestion.value.perbaikan },
])

const filledQuestions = computed(() => {
  const m = todayMuhasabah.value
  return [
    m.syukur && { key: 'syukur', label: '🌸 Syukur', value: m.syukur },
    m.amal_terbaik && { key: 'amal', label: '✨ Amalan Terbaik', value: m.amal_terbaik },
    m.perbaikan && { key: 'perbaikan', label: '💪 Perbaikan', value: m.perbaikan },
  ].filter(Boolean)
})

const form = ref({ syukur: '', amal_terbaik: '', perbaikan: '' })
const hasAnyAnswer = computed(() => Object.values(form.value).some(v => v.trim().length > 0))

// Show form: after 20:00 OR if editing OR already filled (handled separately)
const showForm = computed(() => {
  if (isEditing.value) return true
  if (todayMuhasabah.value.filled) return false
  if (skipped.value) return false
  return new Date().getHours() >= 20
})

const closingQuote = computed(() => {
  const relevant = quotesData.filter(q => q.category !== 'motivasi')
  return relevant[questionIndex.value % relevant.length] || relevant[0]
})

function submitMuhasabah() {
  amalStore.saveMuhasabah({
    syukur: form.value.syukur,
    amal_terbaik: form.value.amal_terbaik,
    perbaikan: form.value.perbaikan,
    question_id: todayQuestion.value.id,
  })
  form.value = { syukur: '', amal_terbaik: '', perbaikan: '' }
  isEditing.value = false
  showClosingQuote.value = true
  setTimeout(() => showClosingQuote.value = false, 8000)
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.35s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
