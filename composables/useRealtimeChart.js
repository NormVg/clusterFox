import { ref } from 'vue'

export function useRealtimeChart() {
  // State
  const selectedDataField = ref('')
  const availableFields = ref([])
  const timeRange = ref('25')
  const dataPoints = ref([])
  const loading = ref(true)
  let onDataFetchedCallback = null

  // Register callback for when data is fetched
  const onDataFetched = (callback) => {
    onDataFetchedCallback = callback
  }

  // Format field name for display
  const formatFieldName = (field) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Extract all unique data fields from fetched data
  const extractDataFields = () => {
    const fieldsSet = new Set()

    console.log('📊 Extracting fields from', dataPoints.value.length, 'data points')

    dataPoints.value.forEach((point, index) => {
      if (point.data && typeof point.data === 'object') {
        const keys = Object.keys(point.data)
        if (index === 0) console.log(`  - Found keys:`, keys)
        keys.forEach(key => {
          fieldsSet.add(key)
        })
      }
    })

    availableFields.value = Array.from(fieldsSet).sort()
    console.log('✅ Available fields:', availableFields.value)

    // Auto-select first field if none selected
    if (availableFields.value.length > 0 && !selectedDataField.value) {
      selectedDataField.value = availableFields.value[0]
      console.log('🎯 Auto-selected field:', selectedDataField.value)
    } else if (availableFields.value.length === 0) {
      console.warn('⚠️ No fields found in data!')
    }
  }

  // Fetch sensor data from API
  const fetchData = async () => {
    try {
      loading.value = true
      const url = `/api/sensor-data?limit=${timeRange.value}`

      console.log('🔄 Fetching data from:', url)
      const response = await fetch(url)
      const data = await response.json()

      console.log('📦 API Response:', {
        success: data.success,
        count: data.count,
        total: data.total,
        firstItem: data.data?.[0]
      })

      if (data.success) {
        dataPoints.value = data.data.reverse() // Oldest first for chart
        console.log('📈 Data points loaded:', dataPoints.value.length)
        if (dataPoints.value.length > 0) {
          console.log('Sample data point:', {
            session_id: dataPoints.value[0].session_id,
            umid: dataPoints.value[0].umid,
            data: dataPoints.value[0].data
          })
        }
        extractDataFields()

        // Call callback if registered
        if (onDataFetchedCallback) {
          onDataFetchedCallback()
        }
      } else {
        console.error('❌ API returned success: false')
      }
    } catch (error) {
      console.error('❌ Error fetching sensor data:', error)
    } finally {
      loading.value = false
    }
  }

  // Get chart data labels
  const getChartLabels = () => {
    return dataPoints.value.map(point => {
      return new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    })
  }

  // Get chart data values
  const getChartValues = () => {
    return dataPoints.value.map(point => {
      const value = point.data?.[selectedDataField.value]
      return parseFloat(value) || 0
    })
  }

  // Get color scheme based on field name
  const getFieldColor = (fieldName) => {
    const colors = {
      temp: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgb(59, 130, 246)' },
      temperature: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgb(59, 130, 246)' },
      humi: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgb(34, 197, 94)' },
      humidity: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgb(34, 197, 94)' },
      pressure: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgb(168, 85, 247)' },
      light: { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgb(251, 191, 36)' }
    }

    const key = fieldName.toLowerCase()
    for (const [colorKey, value] of Object.entries(colors)) {
      if (key.includes(colorKey)) return value
    }

    return { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgb(156, 163, 175)' }
  }

  return {
    // State
    selectedDataField,
    availableFields,
    timeRange,
    dataPoints,
    loading,

    // Methods
    formatFieldName,
    extractDataFields,
    fetchData,
    onDataFetched,
    getChartLabels,
    getChartValues,
    getFieldColor
  }
}
