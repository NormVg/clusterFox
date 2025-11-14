<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <ChartControls
        v-model:selectedDataField="selectedDataField"
        v-model:timeRange="timeRange"
        :availableFields="availableFields"
        :formatFieldName="formatFieldName"
        @fieldChange="updateChart"
        @rangeChange="fetchData"
      />
    </div>

    <div class="chart-container">
      <canvas ref="canvas"></canvas>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        Loading chart data...
      </div>
      <div v-if="!loading && dataPoints.length === 0" class="no-data">
        📊 No sensor data available
      </div>
      <div v-if="!loading && dataPoints.length > 0 && availableFields.length === 0" class="info-message">
        ⚠️ No data fields found. Check console for details.
      </div>
      <div v-if="!loading && dataPoints.length > 0 && availableFields.length > 0 && !selectedDataField" class="info-message">
        👆 Select a data field above to visualize
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRealtimeChart } from '~/composables/useRealtimeChart'
import { useSettingsStore } from '~/stores/settings'
import ChartControls from './ChartControls.vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  title: {
    type: String,
    default: 'Sensor Data Over Time'
  }
})

const {
  selectedDataField,
  availableFields,
  timeRange,
  dataPoints,
  loading,
  formatFieldName,
  fetchData,
  onDataFetched,
  getChartLabels,
  getChartValues,
  getFieldColor
} = useRealtimeChart()

const canvas = ref(null)
let chartInstance = null
let refreshInterval = null

// Register callback to update chart when data is fetched
onDataFetched(() => {
  console.log('📊 Data fetched callback triggered')
  nextTick(() => {
    updateChart()
  })
})

const updateChart = () => {
  // Destroy existing chart if no field selected or no data
  if (!selectedDataField.value || dataPoints.value.length === 0) {
    if (chartInstance) {
      console.log('🗑️ Destroying chart (no field or no data)')
      chartInstance.destroy()
      chartInstance = null
    }
    return
  }

  if (!canvas.value) {
    console.warn('⚠️ Canvas not ready')
    return
  }

  console.log('📈 Updating chart with field:', selectedDataField.value)

  // Get data from composable
  const labels = getChartLabels()

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  // Create datasets
  let datasets = []

  if (selectedDataField.value === 'all') {
    // Show all fields
    const allFields = availableFields.value.filter(f => f !== 'all')
    datasets = allFields.map(field => {
      const values = dataPoints.value.map(point => {
        const value = point.data?.[field]
        return parseFloat(value) || 0
      })
      const colors = getFieldColor(field)
      return {
        label: formatFieldName(field),
        data: values,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: colors.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    })
  } else {
    // Show single field
    const values = getChartValues()
    const colors = getFieldColor(selectedDataField.value)
    datasets = [{
      label: formatFieldName(selectedDataField.value),
      data: values,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: colors.border,
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  }

  // Create new chart
  const ctx = canvas.value.getContext('2d')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: 'rgb(156, 163, 175)',
            font: {
              size: 12,
              family: 'system-ui'
            },
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgb(156, 163, 175)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(156, 163, 175, 0.1)'
          },
          ticks: {
            color: 'rgb(156, 163, 175)',
            maxRotation: 45,
            minRotation: 0,
            font: {
              size: 10
            }
          }
        },
        y: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(156, 163, 175, 0.1)'
          },
          ticks: {
            color: 'rgb(156, 163, 175)',
            font: {
              size: 11
            }
          }
        }
      }
    }
  })
}

// Watch for data changes and update chart
watch([dataPoints, selectedDataField], () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

onMounted(async () => {
  console.log('🚀 RealtimeChart mounted')
  const settingsStore = useSettingsStore()
  await settingsStore.loadSettings()
  const intervalMs = (settingsStore.refreshInterval || 10) * 1000

  await fetchData()
  refreshInterval = setInterval(() => {
    console.log('⏰ Auto-refresh triggered')
    fetchData()
  }, intervalMs)
})

onUnmounted(() => {
  console.log('👋 RealtimeChart unmounting')
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.chart-header h3 {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.loading,
.no-data,
.info-message {
  position: absolute;
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
