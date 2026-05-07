<template>
  <div
    class="relative overflow-hidden bg-white rounded-2xl border transition-all duration-200 active:scale-[0.98]"
    :class="isCompleted
      ? 'border-emerald-200 shadow-sm shadow-emerald-100'
      : 'border-slate-100 shadow-sm'"
    @click="handleToggle"
  >
    <!-- Completed gradient strip on left -->
    <div
      v-if="isCompleted"
      class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500"
    />

    <div class="px-4 py-3.5 pl-5">
      <div class="flex items-start gap-3">
        <!-- Icon circle -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
          :class="isCompleted ? 'bg-emerald-100' : 'bg-slate-50'"
        >
          <span class="text-xl">{{ item.icon }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <!-- Title row -->
          <div class="flex items-center gap-2 flex-wrap mb-0.5">
            <p class="text-sm font-bold text-slate-800">{{ item.title }}</p>
            <span v-if="isFridayItem && isFriday"
              class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
              Hari Jum'at ⭐
            </span>
            <span v-if="item.time_window"
              class="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
              {{ item.time_window.start }}–{{ item.time_window.end }}
            </span>
          </div>

          <!-- Arabic -->
          <p class="font-arabic text-sm text-slate-600 leading-loose" dir="rtl">{{ item.arabic }}</p>

          <!-- Counter for tilawah -->
          <div v-if="item.type === 'counter_pages'" class="mt-2" @click.stop>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-slate-500 font-medium">
                <span :class="isCompleted ? 'text-emerald-600 font-bold' : ''">{{ todayPages }}</span>
                <span class="text-slate-400"> / {{ targetPages }} hlm</span>
              </span>
              <div class="flex gap-1.5">
                <button
                  v-for="p in [1, 5, 10]"
                  :key="p"
                  @click="amalStore.incrementTilawah(p)"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-90"
                  :class="isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-100 text-primary-700'"
                >
                  +{{ p }}
                </button>
              </div>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden" :class="isCompleted ? 'bg-emerald-100' : 'bg-slate-100'">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-primary-400 to-primary-600'"
                :style="{ width: `${Math.min((todayPages / targetPages) * 100, 100)}%` }"
              />
            </div>
          </div>

          <!-- Counter for sholawat/istighfar -->
          <div v-else-if="item.type === 'counter'" class="mt-2 flex items-center gap-2" @click.stop>
            <span class="text-xs font-semibold" :class="isCompleted ? 'text-emerald-600' : 'text-slate-500'">
              {{ todayCount }}/{{ item.default_target }}
            </span>
            <div class="flex-1 h-1.5 rounded-full overflow-hidden" :class="isCompleted ? 'bg-emerald-100' : 'bg-slate-100'">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="isCompleted ? 'bg-emerald-400' : 'bg-primary-400'"
                :style="{ width: `${Math.min((todayCount / item.default_target) * 100, 100)}%` }"
              />
            </div>
          </div>

          <!-- Dalil -->
          <p class="text-[10px] mt-2 font-medium" :class="isCompleted ? 'text-emerald-500' : 'text-primary-400'">
            📚 {{ item.dalil }}
          </p>
        </div>

        <!-- Checkbox for toggle type -->
        <div v-if="item.type === 'toggle'"
          class="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all duration-200"
          :class="isCompleted
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-transparent shadow-md shadow-emerald-200'
            : 'border-slate-200'"
        >
          <Transition name="check-pop">
            <Check v-if="isCompleted" :size="13" class="text-white" :stroke-width="3" />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { useAmalStore } from '@/stores/amal'

const props = defineProps({
  item: { type: Object, required: true },
})

const amalStore = useAmalStore()
const isFriday = computed(() => new Date().getDay() === 5)
const isFridayItem = computed(() => props.item.friday_only)

const isCompleted = computed(() => {
  const log = amalStore.todayLog
  if (props.item.amal_key) return !!log[props.item.amal_key]
  if (props.item.type === 'toggle') return !!log.sunnah?.[props.item.store_key]
  if (props.item.type === 'counter') return (log.sunnah?.[props.item.store_key] || 0) >= props.item.default_target
  if (props.item.type === 'counter_pages') return (log.sunnah?.tilawah_pages || 0) >= (amalStore.sunnahConfig?.tilawah_target_pages || 2)
  return false
})

const todayPages = computed(() => amalStore.todayLog.sunnah?.tilawah_pages || 0)
const targetPages = computed(() => amalStore.sunnahConfig?.tilawah_target_pages || 2)
const todayCount = computed(() => amalStore.todayLog.sunnah?.[props.item.store_key] || 0)

function handleToggle() {
  if (props.item.type === 'counter_pages') return
  if (props.item.type === 'counter') {
    // increment by 1 on card tap for counter type
    const log = amalStore.todayLog
    const current = log.sunnah?.[props.item.store_key] || 0
    if (current < props.item.default_target) {
      // Use toggleSunnah-like approach: direct increment
      const today = new Date().toISOString().split('T')[0]
      if (!amalStore.logs[today]) amalStore.logs[today] = amalStore.createEmptyLog()
      if (!amalStore.logs[today].sunnah) amalStore.logs[today].sunnah = {}
      amalStore.logs[today].sunnah[props.item.store_key] = current + 1
      amalStore.saveToStorage()
    }
    return
  }
  if (props.item.amal_key) {
    amalStore.toggleAmal(props.item.amal_key)
  } else if (props.item.type === 'toggle') {
    amalStore.toggleSunnah(props.item.store_key)
  }
}
</script>

<style scoped>
.check-pop-enter-active { transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.check-pop-enter-from { opacity: 0; transform: scale(0); }
.check-pop-enter-to { opacity: 1; transform: scale(1); }
</style>
