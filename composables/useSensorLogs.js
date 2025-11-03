import { ref, computed } from 'vue'

export function useSensorLogs() {
  // State
  const logs = ref([])
  const isLoading = ref(false)
  const settings = ref(null)
  const refreshInterval = ref(5000) // Default 5 seconds
  const previousModuleStatus = new Map()
  let isInitialLoad = true

  // Computed counts
  const errorCount = computed(() => logs.value.filter(log => log.type === 'error').length)
  const warningCount = computed(() => logs.value.filter(log => log.type === 'warning').length)
  const infoCount = computed(() => logs.value.filter(log => log.type === 'info').length)
  const successCount = computed(() => logs.value.filter(log => log.type === 'success').length)

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const result = await response.json()
      if (result.success && result.settings) {
        settings.value = result.settings
        // Use refreshInterval from settings (in seconds), convert to ms
        refreshInterval.value = (result.settings.refreshInterval || 5) * 1000
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  // Fetch logs from the JSON database
  const fetchLogs = async () => {
    try {
      console.log('🔄 Fetching logs from /api/logs...')
      const response = await fetch('/api/logs')
      const result = await response.json()

      console.log('📦 API Response:', result)

      if (result.success) {
        // Reverse the logs so newest appears at bottom
        logs.value = [...result.logs].reverse()
        console.log(`✅ Loaded ${result.logs.length} logs`)
      } else {
        console.error('❌ Failed to load logs:', result.error)
      }
    } catch (error) {
      console.error('❌ Error fetching logs:', error)
    }
  }

  // Process sensor data and module status, then save to database
  const fetchSensorData = async () => {
    try {
      isLoading.value = true

      // Fetch both sensor data and module status in parallel
      const [sensorResponse, moduleResponse] = await Promise.all([
        fetch('/api/sensor-data?limit=50'),
        fetch(`/api/modules?_t=${Date.now()}`)
      ])

      const sensorResult = await sensorResponse.json()
      const moduleResult = await moduleResponse.json()

      const newLogs = []

      // Process module status changes
      if (moduleResult.success && moduleResult.modules) {
        console.group('📊 Module Status Check')

        moduleResult.modules.forEach(module => {
          const prevStatus = previousModuleStatus.get(module.umid)
          const statusChanged = prevStatus !== undefined && prevStatus !== module.status
          const isFirstSeen = prevStatus === undefined

          // Log module status with emoji
          const emoji = module.status === 'active' ? '🟢' :
                        module.status === 'inactive' ? '🟡' : '🔴'

          if (statusChanged) {
            // Check if it's coming back from offline to active (blue indicator)
            const isRecovery = (prevStatus === 'offline' || prevStatus === 'inactive') && module.status === 'active'
            const changeEmoji = isRecovery ? '🔵' : emoji

            console.log(`%c${changeEmoji} ${module.umid}: ${prevStatus} → ${module.status}`,
                        isRecovery ? 'color: #3b82f6; font-weight: bold;' : '')

            // Add status change as a log entry with special type for recovery
            let logType = module.status === 'active' ? 'success' :
                          module.status === 'inactive' ? 'warning' : 'error'

            // Use 'info' type for recovery (will show as blue)
            if (isRecovery) {
              logType = 'info'
            }

            newLogs.push({
              type: logType,
              message: `Module ${module.umid} changed status: ${prevStatus} → ${module.status}${isRecovery ? ' 🔵' : ''}`,
              details: JSON.stringify({
                'Module UMID': module.umid,
                'Module Type': module.moduleType,
                'Previous Status': prevStatus,
                'New Status': module.status,
                'Recovery': isRecovery,
                'Type Components': module.typeComponents,
                'Data Count': module.dataCount,
                'Registered At': module.registeredAt,
                'Last Seen': module.lastSeen
              }, null, 2),
              rawData: module
            })
          } else if (isFirstSeen && !isInitialLoad) {
            // Only log "first seen" if it's not the initial page load
            console.log(`${emoji} ${module.umid}: ${module.status} (newly discovered)`)

            const logType = module.status === 'active' ? 'info' :
                           module.status === 'inactive' ? 'warning' : 'error'

            newLogs.push({
              type: logType,
              message: `New module discovered: ${module.umid} (${module.status})`,
              details: JSON.stringify({
                'Module UMID': module.umid,
                'Module Type': module.moduleType,
                'Current Status': module.status,
                'Type Components': module.typeComponents,
                'Data Count': module.dataCount,
                'Registered At': module.registeredAt,
                'Last Seen': module.lastSeen
              }, null, 2),
              rawData: module
            })
          } else {
            console.log(`${emoji} ${module.umid}: ${module.status}`)
          }

          // Update previous status
          previousModuleStatus.set(module.umid, module.status)
        })

        console.groupEnd()
      }

      // Save logs to database if there are any new logs
      if (newLogs.length > 0) {
        try {
          await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLogs)
          })
        } catch (error) {
          console.error('Error saving logs to database:', error)
        }
      }

      // Mark initial load as complete
      if (isInitialLoad) {
        isInitialLoad = false
      }

      // Fetch and display logs from database
      await fetchLogs()

    } catch (error) {
      console.error('Error fetching data:', error)

      // Try to save error log to database
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'error',
            message: 'Failed to fetch data from API',
            details: `Error: ${error.message}\nEndpoint: /api/sensor-data or /api/modules`
          })
        })
        await fetchLogs()
      } catch (logError) {
        console.error('Error logging error:', logError)
      }
    } finally {
      isLoading.value = false
    }
  }

  // Clear all logs from database
  const clearAllLogs = async () => {
    if (confirm('Are you sure you want to clear all logs from the database? This action cannot be undone.')) {
      try {
        await fetch('/api/logs', { method: 'DELETE' })
        await fetchLogs()
      } catch (error) {
        console.error('Error clearing logs:', error)
      }
    }
  }

  // Export logs to JSON file
  const exportLogs = async () => {
    try {
      const response = await fetch('/api/logs')
      const result = await response.json()

      if (result.success) {
        const dataStr = JSON.stringify(result, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `cf-logs-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  // Get filtered logs
  const getFilteredLogs = (filterType) => {
    if (filterType === 'all') return logs.value
    return logs.value.filter(log => log.type === filterType)
  }

  return {
    // State
    logs,
    isLoading,
    settings,
    refreshInterval,

    // Computed
    errorCount,
    warningCount,
    infoCount,
    successCount,

    // Methods
    fetchSettings,
    fetchLogs,
    fetchSensorData,
    clearAllLogs,
    exportLogs,
    getFilteredLogs
  }
}
