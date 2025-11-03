// Composable for managing activity logs
import { ref } from 'vue'

export const useActivityLogs = (limit = 10) => {
  const logs = ref([])
  const logStats = ref({})

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/logs?limit=${limit}&_t=${Date.now()}`)
      const data = await response.json()

      if (data.success) {
        logs.value = [...data.logs].reverse()
        logStats.value = data.stats || {}
        console.log(`📋 Loaded ${logs.value.length} logs`)
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Error fetching logs:', error)
      return false
    }
  }

  const getLogIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: '🔵'
    }
    return icons[type] || '📝'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`

    return date.toLocaleString()
  }

  return {
    logs,
    logStats,
    fetchLogs,
    getLogIcon,
    formatTime
  }
}
