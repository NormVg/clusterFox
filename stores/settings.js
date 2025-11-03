import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const dataRetention = ref(10000)
  const refreshInterval = ref(10)
  const sessionTimeout = ref(24)
  const inactiveThreshold = ref(15)
  const enableNotifications = ref(true)
  const enableAutoRefresh = ref(true)
  const theme = ref('dark')
  const sidebarCollapsed = ref(false)

  // Module status thresholds (in seconds)
  const moduleActiveThreshold = ref(300)      // 5 minutes = 300 seconds
  const moduleInactiveThreshold = ref(3600)   // 1 hour = 3600 seconds

  // Emergency trigger settings
  const enableEmergencyTriggers = ref(true)
  const enableAudioAlerts = ref(true)

  // Getters
  const getAllSettings = computed(() => ({
    dataRetention: dataRetention.value,
    refreshInterval: refreshInterval.value,
    sessionTimeout: sessionTimeout.value,
    inactiveThreshold: inactiveThreshold.value,
    enableNotifications: enableNotifications.value,
    enableAutoRefresh: enableAutoRefresh.value,
    theme: theme.value,
    sidebarCollapsed: sidebarCollapsed.value,
    moduleActiveThreshold: moduleActiveThreshold.value,
    moduleInactiveThreshold: moduleInactiveThreshold.value,
    enableEmergencyTriggers: enableEmergencyTriggers.value,
    enableAudioAlerts: enableAudioAlerts.value
  }))

  // Actions
  async function loadSettings() {
    try {
      // Load from API (JSON file) - single source of truth
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (data.success && data.settings) {
        const settings = data.settings
        if (settings.dataRetention !== undefined) dataRetention.value = settings.dataRetention
        if (settings.refreshInterval !== undefined) refreshInterval.value = settings.refreshInterval
        if (settings.sessionTimeout !== undefined) sessionTimeout.value = settings.sessionTimeout
        if (settings.inactiveThreshold !== undefined) inactiveThreshold.value = settings.inactiveThreshold
        if (settings.enableNotifications !== undefined) enableNotifications.value = settings.enableNotifications
        if (settings.enableAutoRefresh !== undefined) enableAutoRefresh.value = settings.enableAutoRefresh
        if (settings.theme !== undefined) theme.value = settings.theme
        if (settings.sidebarCollapsed !== undefined) sidebarCollapsed.value = settings.sidebarCollapsed
        if (settings.moduleActiveThreshold !== undefined) moduleActiveThreshold.value = settings.moduleActiveThreshold
        if (settings.moduleInactiveThreshold !== undefined) moduleInactiveThreshold.value = settings.moduleInactiveThreshold
        if (settings.enableEmergencyTriggers !== undefined) enableEmergencyTriggers.value = settings.enableEmergencyTriggers
        if (settings.enableAudioAlerts !== undefined) enableAudioAlerts.value = settings.enableAudioAlerts
      }
    } catch (error) {
      console.error('Error loading settings from JSON file:', error)
    }
  }

  async function saveSettings() {
    try {
      const settings = getAllSettings.value

      // Save to API (JSON file) - single source of truth
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error saving settings to JSON file:', error)
      return false
    }
  }

  function updateSetting(key, value) {
    const settingsMap = {
      dataRetention, refreshInterval, sessionTimeout, inactiveThreshold,
      enableNotifications, enableAutoRefresh, theme, sidebarCollapsed,
      moduleActiveThreshold, moduleInactiveThreshold,
      enableEmergencyTriggers, enableAudioAlerts
    }

    if (settingsMap[key]) {
      settingsMap[key].value = value
    }
  }

  async function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    await saveSettings()
  }

  async function setTheme(newTheme) {
    theme.value = newTheme
    await saveSettings()
  }

  function resetToDefaults() {
    dataRetention.value = 10000
    refreshInterval.value = 10
    sessionTimeout.value = 24
    inactiveThreshold.value = 15
    enableNotifications.value = true
    enableAutoRefresh.value = true
    theme.value = 'dark'
    sidebarCollapsed.value = false
    moduleActiveThreshold.value = 300
    moduleInactiveThreshold.value = 3600
    enableEmergencyTriggers.value = true
    enableAudioAlerts.value = true
    saveSettings()
  }

  return {
    // State
    dataRetention,
    refreshInterval,
    sessionTimeout,
    inactiveThreshold,
    enableNotifications,
    enableAutoRefresh,
    theme,
    sidebarCollapsed,
    moduleActiveThreshold,
    moduleInactiveThreshold,
    enableEmergencyTriggers,
    enableAudioAlerts,
    // Getters
    getAllSettings,
    // Actions
    loadSettings,
    saveSettings,
    updateSetting,
    toggleSidebar,
    setTheme,
    resetToDefaults
  }
})
