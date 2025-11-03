import { ref, computed } from 'vue'

export function useDataEntryRate() {
  // State
  const sensorData = ref([])
  const timeRange = ref('24h') // 1h, 6h, 24h, 7d
  const loading = ref(true)
  const entryRateData = ref({
    labels: [],
    counts: []
  })

  // Fetch sensor data
  const fetchSensorData = async () => {
    try {
      loading.value = true
      const response = await fetch('/api/sensor-data?limit=1000')
      const result = await response.json()

      if (result.success) {
        sensorData.value = result.data
        console.log('📊 Loaded sensor data for rate analysis:', sensorData.value.length, 'entries')
        calculateEntryRate()
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
    } finally {
      loading.value = false
    }
  }

  // Calculate data entry rate based on time range
  const calculateEntryRate = () => {
    if (sensorData.value.length === 0) {
      entryRateData.value = {
        labels: [],
        counts: []
      }
      return
    }

    const now = Date.now()
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }

    const rangeMs = ranges[timeRange.value]
    const startTime = now - rangeMs

    // Filter data within time range
    const filteredData = sensorData.value.filter(item => {
      const timestamp = new Date(item.timestamp).getTime()
      return timestamp >= startTime
    })

    console.log(`📈 Filtered ${filteredData.length} entries for ${timeRange.value} range`)

    // Group by time intervals
    const intervals = getIntervals(timeRange.value)
    const intervalMs = rangeMs / intervals

    const rateCounts = new Array(intervals).fill(0)
    const labels = []

    // Count entries per interval
    filteredData.forEach(item => {
      const timestamp = new Date(item.timestamp).getTime()
      const intervalIndex = Math.floor((timestamp - startTime) / intervalMs)
      if (intervalIndex >= 0 && intervalIndex < intervals) {
        rateCounts[intervalIndex]++
      }
    })

    // Generate labels
    for (let i = 0; i < intervals; i++) {
      const intervalTime = startTime + (i * intervalMs)
      labels.push(formatIntervalLabel(intervalTime, timeRange.value))
    }

    entryRateData.value = {
      labels,
      counts: rateCounts
    }

    console.log('✅ Entry rate calculated:', entryRateData.value)
  }

  // Get number of intervals based on time range
  const getIntervals = (range) => {
    const intervals = {
      '1h': 12,    // 5-minute intervals
      '6h': 24,    // 15-minute intervals
      '24h': 24,   // 1-hour intervals
      '7d': 28     // 6-hour intervals
    }
    return intervals[range] || 24
  }

  // Format interval label based on time range
  const formatIntervalLabel = (timestamp, range) => {
    const date = new Date(timestamp)

    if (range === '1h' || range === '6h') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (range === '24h') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit'
      })
    }
  }

  // Statistics
  const totalEntries = computed(() => {
    return entryRateData.value.counts?.reduce((sum, count) => sum + count, 0) || 0
  })

  const averageRate = computed(() => {
    if (entryRateData.value.counts?.length === 0) return 0
    return Math.round(totalEntries.value / entryRateData.value.counts.length)
  })

  const peakRate = computed(() => {
    if (entryRateData.value.counts?.length === 0) return 0
    return Math.max(...entryRateData.value.counts)
  })

  const changeTimeRange = (range) => {
    console.log('📊 Changing time range to:', range)
    timeRange.value = range
    calculateEntryRate()
  }

  return {
    // State
    loading,
    timeRange,
    entryRateData,

    // Computed
    totalEntries,
    averageRate,
    peakRate,

    // Methods
    fetchSensorData,
    calculateEntryRate,
    changeTimeRange
  }
}
