<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="header-content">
        <h3>{{ title }}</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ totalEntries }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Avg/interval</span>
            <span class="stat-value">{{ averageRate }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Peak</span>
            <span class="stat-value">{{ peakRate }}</span>
          </div>
        </div>
      </div>
      <div class="time-range-selector">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          :class="['range-btn', { active: timeRange === range.value }]"
          @click="changeTimeRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="canvas"></canvas>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        Loading data...
      </div>
      <div v-if="!loading && totalEntries === 0" class="no-data">
        📊 No data entries in this time range
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useDataEntryRate } from '~/composables/useDataEntryRate'
import { useSettingsStore } from '~/stores/settings'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
)

defineProps({
  title: {
    type: String,
    default: 'Data Entry Rate'
  }
})

const {
  loading,
  timeRange,
  entryRateData,
  totalEntries,
  averageRate,
  peakRate,
  fetchSensorData,
  changeTimeRange
} = useDataEntryRate()

const canvas = ref(null)
let chartInstance = null
let refreshInterval = null

const timeRanges = [
  { label: '1H', value: '1h' },
  { label: '6H', value: '6h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' }
]

const updateChart = () => {
  if (!canvas.value || !entryRateData.value.labels || !entryRateData.value.labels.length) {
    console.log('⏭️ Skipping chart update: canvas or data not ready')
    return
  }

  try {
    console.log('📊 Updating data entry rate chart')

    // Destroy existing chart
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    const ctx = canvas.value.getContext('2d')
    if (!ctx) {
      console.error('❌ Could not get canvas context')
      return
    }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: entryRateData.value.labels,
      datasets: [{
        label: 'Data Entries',
        data: entryRateData.value.counts,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4
      }]
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
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Entries: ${context.parsed.y}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgb(156, 163, 175)',
            maxRotation: 45,
            minRotation: 45,
            font: {
              size: 10
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          },
          ticks: {
            color: 'rgb(156, 163, 175)',
            font: {
              size: 11
            },
            precision: 0
          }
        }
      }
    }
  })
  } catch (error) {
    console.error('❌ Error creating chart:', error)
  }
}

// Watch for data changes
watch(entryRateData, () => {
  if (canvas.value) {
    nextTick(() => {
      updateChart()
    })
  }
}, { deep: true })

onMounted(async () => {
  console.log('🚀 DataEntryRateChart mounted')
  const settingsStore = useSettingsStore()
  await settingsStore.loadSettings()
  const intervalMs = (settingsStore.refreshInterval || 10) * 1000

  await nextTick() // Ensure DOM is ready
  await fetchSensorData()
  nextTick(() => {
    updateChart() // Initial chart render
  })
  refreshInterval = setInterval(() => {
    console.log('⏰ Refreshing data entry rate')
    fetchSensorData()
  }, intervalMs)
})

onUnmounted(() => {
  console.log('👋 DataEntryRateChart unmounting')
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
  animation: fadeInScale 0.4s ease;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-content h3 {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent);
}

.time-range-selector {
  display: flex;
  gap: 0.5rem;
  background: var(--bg);
  padding: 0.25rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.range-btn {
  padding: 0.5rem 1rem;
  font-size: 0.813rem;
  font-weight: 600;
  font-family: inherit;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.range-btn:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.range-btn.active {
  background: var(--text-primary);
  color: var(--surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  width: 100%;
  height: 300px;
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
.no-data {
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
  }

  .stats {
    flex-wrap: wrap;
  }

  .time-range-selector {
    width: 100%;
  }

  .range-btn {
    flex: 1;
  }
}
</style>
