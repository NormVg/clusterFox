// Composable for auto-refresh functionality
import { ref, onUnmounted, unref } from 'vue'

export const useAutoRefresh = (callback, intervalMs = 5000) => {
  const isRefreshing = ref(false)
  let intervalId = null
  let currentInterval = unref(intervalMs)

  const startAutoRefresh = (newInterval) => {
    // Use new interval if provided, otherwise use current
    if (newInterval !== undefined) {
      currentInterval = unref(newInterval)
    }

    // Stop existing interval if any
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

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
    }, currentInterval)

    console.log(`🔄 Auto-refresh started (${currentInterval / 1000}s interval)`)
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
