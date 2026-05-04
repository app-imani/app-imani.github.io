<template>
  <!-- Symptom chips selector -->
  <div>
    <p class="text-sm font-semibold text-slate-600 mb-3">Gejala</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="symptom in symptoms"
        :key="symptom.value"
        @click="toggle(symptom.value)"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95"
        :class="selected.includes(symptom.value)
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white text-slate-600 border-slate-200'"
      >
        <span>{{ symptom.emoji }}</span>
        {{ symptom.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selected: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:selected'])

const symptoms = [
  { value: 'kram', emoji: '😣', label: 'Kram' },
  { value: 'sakit_punggung', emoji: '🦴', label: 'Sakit Punggung' },
  { value: 'kembung', emoji: '🫃', label: 'Kembung' },
  { value: 'pusing', emoji: '😵', label: 'Pusing' },
  { value: 'mual', emoji: '🤢', label: 'Mual' },
  { value: 'lemas', emoji: '😮‍💨', label: 'Lemas' },
  { value: 'jerawat', emoji: '🔴', label: 'Jerawat' },
  { value: 'mood_swing', emoji: '🌊', label: 'Mood Swing' },
  { value: 'pendarahan_lebat', emoji: '💧', label: 'Pendarahan Lebat' },
  { value: 'bercak', emoji: '🩸', label: 'Bercak' },
  { value: 'nyeri_dada', emoji: '💔', label: 'Nyeri Dada' },
]

function toggle(value) {
  const current = [...props.selected]
  const idx = current.indexOf(value)
  if (idx === -1) {
    current.push(value)
  } else {
    current.splice(idx, 1)
  }
  emit('update:selected', current)
}
</script>
