<template>
  <!-- Prayer check item untuk satu waktu sholat -->
  <div
    class="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0"
    :class="prayer.isUdzur ? 'opacity-40' : ''"
  >
    <!-- Icon sholat -->
    <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="iconBg">
      <component :is="prayerIcon" :size="16" :class="iconColor" />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <p class="text-sm font-semibold text-slate-800">{{ prayer.name }}</p>
        <span v-if="prayer.time" class="text-xs text-slate-400">{{ prayer.time }}</span>
      </div>
      <!-- Status badge -->
      <span v-if="currentStatus" class="text-xs font-medium" :class="statusColor">
        {{ statusLabel }}
      </span>
    </div>

    <!-- Status selector button -->
    <button
      v-if="!prayer.isUdzur"
      @click="$emit('openStatus', prayer.key)"
      class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all active:scale-90"
      :class="currentStatus ? 'bg-primary-600 border-primary-600' : 'border-slate-200 bg-white'"
    >
      <Check v-if="currentStatus && currentStatus !== 'skip'" :size="16" class="text-white" :stroke-width="3" />
      <X v-else-if="currentStatus === 'skip'" :size="16" class="text-slate-400" />
      <Plus v-else :size="16" class="text-slate-300" />
    </button>

    <!-- Udzur indicator -->
    <div v-if="prayer.isUdzur" class="shrink-0 text-xs text-slate-400 italic">Udzur</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, X, Plus, Sun, Sunset, Moon, Star, Clock } from 'lucide-vue-next'

const props = defineProps({
  prayer: { type: Object, required: true }, // { key, name, time, isUdzur }
  status: { type: String, default: null },
})

defineEmits(['openStatus'])

const currentStatus = computed(() => props.status)

const PRAYER_ICONS = { fajr: Sun, dhuhr: Clock, asr: Sunset, maghrib: Moon, isha: Star }
const prayerIcon = computed(() => PRAYER_ICONS[props.prayer.key] || Sun)

const iconBg = computed(() => {
  if (currentStatus.value && currentStatus.value !== 'skip') return 'bg-primary-100'
  if (currentStatus.value === 'skip') return 'bg-red-50'
  return 'bg-slate-100'
})

const iconColor = computed(() => {
  if (currentStatus.value && currentStatus.value !== 'skip') return 'text-primary-600'
  return 'text-slate-400'
})

const STATUS_LABELS = {
  tepat_waktu: '✓ Tepat Waktu',
  terlambat: '⏰ Terlambat',
  berjamaah: '🕌 Berjamaah',
  munfarid: '🤲 Munfarid',
  skip: '✗ Tidak Sholat',
}

const STATUS_COLORS = {
  tepat_waktu: 'text-primary-600',
  berjamaah: 'text-emerald-600',
  terlambat: 'text-amber-500',
  munfarid: 'text-sky-500',
  skip: 'text-red-400',
}

const statusLabel = computed(() => STATUS_LABELS[currentStatus.value] || '')
const statusColor = computed(() => STATUS_COLORS[currentStatus.value] || 'text-slate-400')
</script>
