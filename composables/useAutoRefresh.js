// Composable for auto-refresh functionality
import { ref, onUnmounted, unref, computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'

export const useAutoRefresh = (callback, intervalMs = null) => {
  const settingsStore = useSettingsStore()
  const isRefreshing = ref(false)
  let intervalId = null
  
  // Use settings refreshInterval if no interval provided, otherwise use provided interval
  const currentInterval = computed(() => {
    if (intervalMs !== null) {
      return unref(intervalMs)
    }
    return (settingsStore.refreshInterval || 10) * 1000 // Convert seconds to ms
  })

  const startAutoRefresh = (newInterval) => {
    // Stop existing interval if any
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    // Get interval to use (newInterval overrides, otherwise use computed currentInterval)
    const intervalToUse = newInterval !== undefined ? unref(newInterval) : currentInterval.value

    // Start new interval
    intervalId = setInterval(async () => {
      console.log('⏰ Auto-refresh triggered at', new Date().toLocaleTimeString())
      isRefreshing.value = true
      try {
        await callback()
      } catch (error) {
        console.error('❌ Auto-refresh error:', error)
      } finally {
        isRefreshing.value = false
      }
    }, intervalToUse)

    console.log(`🔄 Auto-refresh started (${intervalToUse / 1000}s interval)`)
  }

  const stopAutoRefresh = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
      console.log('⏸️ Auto-refresh stopped')
    }
  }

  const manualRefresh = async () => {
    console.log('🔃 Manual refresh triggered')
    isRefreshing.value = true
    try {
      await callback()
    } catch (error) {
      console.error('❌ Manual refresh error:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    isRefreshing,
    startAutoRefresh,
    stopAutoRefresh,
    manualRefresh
  }
}
