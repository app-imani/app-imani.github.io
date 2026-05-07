/**
 * useOfflineSync — Antrian sinkronisasi data ke GAS backend saat kembali online
 *
 * Cara pakai di store:
 *   const { offlineSave } = useOfflineSync()
 *   await offlineSave('savePrayerLog', payload, gasPost)  // otomatis queue jika offline
 *
 * Setup sekali di App.vue:
 *   useOfflineSync().watchOnline(gasPost)
 */
import { ref } from 'vue'
import { idb } from './useIndexedDB'

const MAX_RETRIES = 5

/** Global reactive state — satu instance untuk seluruh app */
export const syncState = {
  isOnline:     ref(typeof navigator !== 'undefined' ? navigator.onLine : true),
  isFlushing:   ref(false),
  pendingCount: ref(0),
}

// Update isOnline saat status jaringan berubah
if (typeof window !== 'undefined') {
  window.addEventListener('online',  () => { syncState.isOnline.value = true })
  window.addEventListener('offline', () => { syncState.isOnline.value = false })
}

export function useOfflineSync() {
  /**
   * Simpan operasi ke IDB queue untuk di-sync nanti.
   * Jika sedang online → coba langsung via onlinePost.
   * Jika offline atau gagal → simpan ke IndexedDB queue.
   *
   * @param {string}    action      — nama action GAS (mis. 'savePrayerLog')
   * @param {Object}    data        — payload data
   * @param {Function=} onlinePost  — fungsi post GAS (dari useGasApi)
   * @returns {Promise<boolean>}    — true jika berhasil langsung, false jika masuk queue
   */
  async function offlineSave(action, data, onlinePost = null) {
    if (syncState.isOnline.value && onlinePost) {
      try {
        const result = await onlinePost(action, data)
        if (result?.success !== false) {
          console.debug(`[OfflineSync] ✓ Sent: ${action}`)
          return true
        }
      } catch {
        // gagal → masuk queue
      }
    }

    // Simpan ke IndexedDB queue
    await idb.enqueue({ action, data })
    await _updatePendingCount()
    console.debug(`[OfflineSync] Queued: ${action}`)
    return false
  }

  /**
   * Flush semua item di queue ke backend.
   * @param {Function} postFn — fungsi post dari useGasApi
   */
  async function flushQueue(postFn) {
    if (syncState.isFlushing.value) return
    if (!syncState.isOnline.value) return

    const queue = await idb.getQueue()
    if (!queue.length) return

    syncState.isFlushing.value = true
    console.log(`[OfflineSync] Flushing ${queue.length} item(s)...`)

    for (const item of queue) {
      if ((item.retries || 0) >= MAX_RETRIES) {
        await idb.dequeue(item.id)
        continue
      }

      try {
        const result = await postFn(item.action, item.data)
        if (result?.success !== false) {
          await idb.dequeue(item.id)
          console.log(`[OfflineSync] ✓ Synced: ${item.action}`)
        } else {
          await idb.incrementRetry(item.id)
        }
      } catch {
        await idb.incrementRetry(item.id)
        console.warn(`[OfflineSync] Retry ${(item.retries || 0) + 1}/${MAX_RETRIES}: ${item.action}`)
      }
    }

    await idb.pruneFailedQueue(MAX_RETRIES)
    await _updatePendingCount()
    syncState.isFlushing.value = false
    console.log('[OfflineSync] Flush complete')
  }

  /**
   * Setup listener online sekali di App.vue.
   * Setiap kali jaringan kembali → langsung flush semua queue.
   * @param {Function} postFn — fungsi post dari useGasApi
   */
  function watchOnline(postFn) {
    // Flush saat pertama kali dipanggil (jika sudah online)
    flushQueue(postFn)

    // Flush setiap kembali online
    window.addEventListener('online', () => {
      console.log('[OfflineSync] Kembali online — flushing queue...')
      flushQueue(postFn)
    })
  }

  async function _updatePendingCount() {
    const q = await idb.getQueue()
    syncState.pendingCount.value = q.length
  }

  return { offlineSave, flushQueue, watchOnline, syncState }
}

