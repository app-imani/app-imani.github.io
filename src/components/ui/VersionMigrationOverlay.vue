<template>
  <!-- ════════════════════════════════════════════════════════════
       VersionMigrationOverlay
       Ditampilkan saat useVersionGuard mendeteksi versi baru.
       Menutupi seluruh layar; blokir interaksi sampai selesai.
  ════════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="fade-overlay">
      <div
        v-if="migrationState.active.value"
        class="fixed inset-0 z-[999] flex flex-col items-center justify-center px-6"
        style="background: linear-gradient(135deg, #1a0533 0%, #2d0a5e 50%, #1a0533 100%);"
        aria-live="assertive"
        role="alertdialog"
        aria-label="Pembaruan aplikasi sedang berjalan"
      >
        <!-- Dekorasi blur circles -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
          <div class="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-pink-600/15 blur-3xl animate-pulse" style="animation-delay: 1s;" />
          <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-violet-500/10 blur-2xl animate-pulse" style="animation-delay: 2s;" />
        </div>

        <!-- Card utama -->
        <div class="relative w-full max-w-sm">
          <!-- App icon -->
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div class="w-20 h-20 rounded-[22px] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-800/50">
                <img src="/pwa-192x192.png" alt="Imani" class="w-14 h-14 rounded-xl" onerror="this.style.display='none'" />
                <span class="text-3xl absolute" v-if="iconFallback">✨</span>
              </div>
              <!-- Animated ring -->
              <div class="absolute inset-0 rounded-[22px] border-2 border-purple-400/40 animate-ping" style="animation-duration: 2s;" />
            </div>
          </div>

          <!-- Title -->
          <div class="text-center mb-8">
            <h2 class="text-white text-xl font-bold mb-1">Pembaruan Tersedia</h2>
            <p class="text-purple-200/70 text-sm">
              Versi baru <span class="text-purple-300 font-semibold">{{ migrationState.newVersion.value }}</span> sedang dipasang
            </p>
          </div>

          <!-- Progress area -->
          <div class="bg-white/5 rounded-2xl border border-white/10 p-5 backdrop-blur-sm">
            <!-- Step indicator -->
            <div class="flex items-center gap-3 mb-4">
              <!-- Spinner / check icon -->
              <div class="flex-shrink-0">
                <div
                  v-if="migrationState.phase.value !== 'done'"
                  class="w-8 h-8 rounded-full border-2 border-purple-400/40 border-t-purple-400 animate-spin"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>

              <!-- Message -->
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm font-medium leading-tight truncate">
                  {{ migrationState.message.value || 'Mempersiapkan pembaruan...' }}
                </p>
                <p class="text-purple-300/50 text-xs mt-0.5">{{ phaseLabel }}</p>
              </div>

              <!-- Percentage -->
              <span class="text-purple-300 text-sm font-bold flex-shrink-0">
                {{ migrationState.progress.value }}%
              </span>
            </div>

            <!-- Progress bar -->
            <div class="relative h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                class="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                :style="progressBarStyle"
              />
              <!-- Shimmer -->
              <div
                v-if="migrationState.phase.value !== 'done'"
                class="absolute inset-y-0 w-20 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              />
            </div>

            <!-- Step list -->
            <div class="mt-4 space-y-2">
              <div
                v-for="step in steps"
                :key="step.phase"
                class="flex items-center gap-2.5 text-xs transition-all duration-300"
                :class="getStepClass(step)"
              >
                <div class="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center">
                  <!-- Done -->
                  <svg v-if="isStepDone(step)" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="5" fill="#10b981"/>
                    <path d="M3 5l1.5 1.5L7 3.5" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <!-- Active -->
                  <div v-else-if="isStepActive(step)" class="w-3.5 h-3.5 rounded-full border-2 border-purple-400/60 border-t-purple-400 animate-spin" />
                  <!-- Pending -->
                  <div v-else class="w-3 h-3 rounded-full bg-white/15" />
                </div>
                <span>{{ step.label }}</span>
              </div>
            </div>
          </div>

          <!-- Warning note -->
          <p class="mt-5 text-center text-purple-200/40 text-xs leading-relaxed px-2">
            Jangan tutup aplikasi ini. Data kamu sedang diamankan ke server sebelum pembaruan.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { migrationState } from '@/composables/useVersionGuard'

const iconFallback = ref(false)

const steps = [
  { phase: 'flushing', phases: ['flushing'],         label: 'Mengirim data yang tertunda ke server' },
  { phase: 'syncing',  phases: ['syncing', 'flushing'], label: 'Menyinkronkan amalan & sholat (14 hari)' },
  { phase: 'clearing', phases: ['clearing'],          label: 'Membersihkan cache lama' },
  { phase: 'done',     phases: ['done'],              label: 'Pembaruan selesai' },
]

const phaseOrder = ['', 'flushing', 'syncing', 'clearing', 'done']

function phaseIndex(phase) {
  return phaseOrder.indexOf(phase)
}

function isStepDone(step) {
  const current = phaseIndex(migrationState.phase.value)
  return step.phases.every(p => phaseIndex(p) < current)
    || (migrationState.phase.value === 'done')
}

function isStepActive(step) {
  return step.phases.includes(migrationState.phase.value)
}

function getStepClass(step) {
  if (migrationState.phase.value === 'done') return 'text-emerald-400/80'
  if (isStepDone(step)) return 'text-emerald-400/80'
  if (isStepActive(step)) return 'text-white'
  return 'text-white/25'
}

const phaseLabel = computed(() => {
  const labels = {
    flushing: 'Memproses antrian offline...',
    syncing:  'Sinkronisasi ke Google Sheets...',
    clearing: 'Membersihkan penyimpanan lokal...',
    done:     'Berhasil!',
  }
  return labels[migrationState.phase.value] || ''
})

const progressBarStyle = computed(() => {
  const p = migrationState.progress.value
  const isDone = migrationState.phase.value === 'done'
  return {
    width: `${p}%`,
    background: isDone
      ? 'linear-gradient(90deg, #10b981, #34d399)'
      : 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)',
  }
})
</script>

<style scoped>
.fade-overlay-enter-active { transition: opacity 0.3s ease; }
.fade-overlay-leave-active { transition: opacity 0.4s ease; }
.fade-overlay-enter-from,
.fade-overlay-leave-to { opacity: 0; }

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(400%); }
}
.animate-shimmer { animation: shimmer 2s infinite linear; }
</style>
