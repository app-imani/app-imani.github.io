/**
 * useIndexedDB — Wrapper IndexedDB untuk offline storage Imani
 *
 * Database: imani_offline
 * Stores:
 *   - kv          : key-value umum (seperti localStorage tapi lebih besar)
 *   - sync_queue  : antrian operasi yang belum ter-sync ke backend
 */

const DB_NAME    = 'imani_offline'
const DB_VERSION = 1

/** @type {IDBDatabase|null} */
let _db = null

/**
 * Buka (atau buat) IndexedDB. Singleton — hanya buka sekali.
 * @returns {Promise<IDBDatabase>}
 */
function openDb() {
  if (_db) return Promise.resolve(_db)

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = e.target.result

      // KV store — general key-value
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv')
      }

      // Sync queue — tiap entry adalah satu operasi backend yang tertunda
      if (!db.objectStoreNames.contains('sync_queue')) {
        const sq = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
        sq.createIndex('by_store', 'store', { unique: false })
      }
    }

    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db) }
    req.onerror    = (e) => reject(e.target.error)
  })
}

/** Bungkus operasi IDBRequest dalam Promise */
function req2promise(getReq) {
  return new Promise((resolve, reject) => {
    const r   = getReq()
    r.onsuccess = () => resolve(r.result)
    r.onerror   = () => reject(r.error)
  })
}

// ── Public API ────────────────────────────────────────────────────────────────

export const idb = {
  // ── KV store ──────────────────────────────────────────────────────────────

  /** Simpan nilai ke KV store */
  async set(key, value) {
    const db = await openDb()
    return req2promise(() => {
      const tx = db.transaction('kv', 'readwrite')
      return tx.objectStore('kv').put(value, key)
    })
  },

  /** Ambil nilai dari KV store */
  async get(key, fallback = null) {
    try {
      const db  = await openDb()
      const val = await req2promise(() => db.transaction('kv').objectStore('kv').get(key))
      return val !== undefined ? val : fallback
    } catch {
      return fallback
    }
  },

  /** Hapus key dari KV store */
  async del(key) {
    const db = await openDb()
    return req2promise(() => {
      const tx = db.transaction('kv', 'readwrite')
      return tx.objectStore('kv').delete(key)
    })
  },

  /** Ambil semua key yang diawali prefix */
  async getByPrefix(prefix) {
    try {
      const db      = await openDb()
      const result  = {}
      await new Promise((resolve, reject) => {
        const tx  = db.transaction('kv')
        const req = tx.objectStore('kv').openCursor()
        req.onsuccess = (e) => {
          const cursor = e.target.result
          if (!cursor) { resolve(); return }
          if (String(cursor.key).startsWith(prefix)) result[cursor.key] = cursor.value
          cursor.continue()
        }
        req.onerror = () => reject(req.error)
      })
      return result
    } catch {
      return {}
    }
  },

  // ── Sync queue ────────────────────────────────────────────────────────────

  /**
   * Tambah operasi ke antrian sync
   * @param {{ store: string, action: string, data: Object }} entry
   */
  async enqueue(entry) {
    const db = await openDb()
    return req2promise(() => {
      const tx = db.transaction('sync_queue', 'readwrite')
      return tx.objectStore('sync_queue').add({
        ...entry,
        enqueuedAt: Date.now(),
        retries:    0,
      })
    })
  },

  /** Ambil semua item di antrian sync, diurutkan dari terlama */
  async getQueue() {
    try {
      const db = await openDb()
      return req2promise(() => db.transaction('sync_queue').objectStore('sync_queue').getAll())
    } catch {
      return []
    }
  },

  /** Hapus satu item dari antrian setelah berhasil di-sync */
  async dequeue(id) {
    const db = await openDb()
    return req2promise(() => {
      const tx = db.transaction('sync_queue', 'readwrite')
      return tx.objectStore('sync_queue').delete(id)
    })
  },

  /** Update retry counter untuk item yang gagal */
  async incrementRetry(id) {
    const db = await openDb()
    const item = await req2promise(() => db.transaction('sync_queue').objectStore('sync_queue').get(id))
    if (!item) return
    item.retries = (item.retries || 0) + 1
    item.lastRetry = Date.now()
    return req2promise(() => {
      const tx = db.transaction('sync_queue', 'readwrite')
      return tx.objectStore('sync_queue').put(item)
    })
  },

  /** Hapus semua item antrian yang sudah melebihi batas retry */
  async pruneFailedQueue(maxRetries = 5) {
    const queue = await this.getQueue()
    for (const item of queue) {
      if ((item.retries || 0) >= maxRetries) await this.dequeue(item.id)
    }
  },
}

export function useIndexedDB() {
  return idb
}
