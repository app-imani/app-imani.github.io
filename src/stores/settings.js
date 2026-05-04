import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useGasApi } from '@/composables/useGasApi'

/**
 * Store Settings — Preferensi user, lokasi, notifikasi
 */
export const useSettingsStore = defineStore('settings', () => {
  const { get: lsGet, set: lsSet } = useLocalStorage()
  const { post: gasPost } = useGasApi()

  // State
  const userId = ref(lsGet('imani_settings_user_id', null))
  const displayName = ref(lsGet('imani_settings_display_name', ''))
  const isOnboarded = ref(lsGet('imani_settings_onboarded', false))
  const location = ref(lsGet('imani_settings_location', { city: '', country: 'Indonesia', latitude: null, longitude: null }))
  const notificationEnabled = ref(lsGet('imani_settings_notification', false))
  const notifPrayer = ref(lsGet('imani_settings_notif_prayer', true))
  const notifAmal = ref(lsGet('imani_settings_notif_amal', true))
  const notifFasting = ref(lsGet('imani_settings_notif_fasting', false))
  const prayerReminderMinutes = ref(lsGet('imani_settings_prayer_reminder_minutes', 10))
  const calculationMethod = ref(lsGet('imani_settings_calc_method', 20)) // MUI Indonesia
  const madzhab = ref(lsGet('imani_settings_madzhab', 'syafi\'i'))

  // Flat city/country accessors
  const city = computed({
    get: () => location.value?.city || '',
    set: (v) => { location.value = { ...location.value, city: v }; lsSet('imani_settings_location', location.value) },
  })
  const country = computed({
    get: () => location.value?.country || 'Indonesia',
    set: (v) => { location.value = { ...location.value, country: v }; lsSet('imani_settings_location', location.value) },
  })
  const calcMethod = computed({
    get: () => calculationMethod.value,
    set: (v) => { calculationMethod.value = v; lsSet('imani_settings_calc_method', v) },
  })

  // Computed
  const hasLocation = computed(() => !!location.value?.latitude)

  // Actions
  function setUser(id, name) {
    userId.value = id
    displayName.value = name
    lsSet('imani_settings_user_id', id)
    lsSet('imani_settings_display_name', name)
  }

  function setOnboarded(value = true) {
    isOnboarded.value = value
    lsSet('imani_settings_onboarded', value)
  }

  function setLocation(city, latitude, longitude) {
    const loc = { city, latitude, longitude }
    location.value = loc
    lsSet('imani_settings_location', loc)
  }

  function setNotification(enabled) {
    notificationEnabled.value = enabled
    lsSet('imani_settings_notification', enabled)
  }

  function setPrayerReminderMinutes(minutes) {
    prayerReminderMinutes.value = minutes
    lsSet('imani_settings_prayer_reminder_minutes', minutes)
  }

  function save() {
    lsSet('imani_settings_display_name', displayName.value)
    lsSet('imani_settings_notification', notificationEnabled.value)
    lsSet('imani_settings_notif_prayer', notifPrayer.value)
    lsSet('imani_settings_notif_amal', notifAmal.value)
    lsSet('imani_settings_notif_fasting', notifFasting.value)
    lsSet('imani_settings_calc_method', calculationMethod.value)
    lsSet('imani_settings_location', location.value)
  }

  async function saveUserProfile() {
    if (!userId.value) return
    try {
      await gasPost('saveUserProfile', {
        userId: userId.value,
        displayName: displayName.value,
        location: location.value,
      })
    } catch (err) {
      console.error('[settingsStore] Gagal sync profil:', err)
    }
  }

  return {
    userId, displayName, isOnboarded, location, notificationEnabled,
    notifPrayer, notifAmal, notifFasting,
    city, country, calcMethod,
    prayerReminderMinutes, calculationMethod, madzhab, hasLocation,
    setUser, setOnboarded, setLocation, setNotification, setPrayerReminderMinutes,
    save, saveUserProfile,
  }
})
