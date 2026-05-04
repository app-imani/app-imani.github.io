/**
 * useLocalStorage — Composable wrapper untuk localStorage
 * Konvensi key: imani_{module}_{key}
 */
export function useLocalStorage() {
  /**
   * Simpan data ke localStorage (auto-serialize JSON)
   * @param {string} key
   * @param {any} value
   */
  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error(`[localStorage] Failed to set "${key}":`, err)
    }
  }

  /**
   * Ambil data dari localStorage (auto-deserialize JSON)
   * @param {string} key
   * @param {any} defaultValue - nilai default jika tidak ada
   * @returns {any}
   */
  function get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item)
    } catch (err) {
      console.error(`[localStorage] Failed to get "${key}":`, err)
      return defaultValue
    }
  }

  /**
   * Hapus item dari localStorage
   * @param {string} key
   */
  function remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.error(`[localStorage] Failed to remove "${key}":`, err)
    }
  }

  /**
   * Hapus semua data Imani dari localStorage
   */
  function clearAll() {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('imani_'))
    keys.forEach((k) => localStorage.removeItem(k))
  }

  /**
   * Cek apakah key ada
   * @param {string} key
   * @returns {boolean}
   */
  function has(key) {
    return localStorage.getItem(key) !== null
  }

  return { set, get, remove, clearAll, has }
}
