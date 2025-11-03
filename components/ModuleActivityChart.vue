<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="header-content">
        <h3>{{ title }}</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Total Modules</span>
            <span class="stat-value">{{ totalModules }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Active</span>
            <span class="stat-value active">{{ activePercentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-wrapper">
        <canvas ref="canvas"></canvas>
      </div>

      <div class="status-legend">
        <div class="legend-item">
          <span class="legend-dot active"></span>
          <span class="legend-label">Active</span>
          <span class="legend-count">{{ statusCounts.active }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot inactive"></span>
          <span class="legend-label">Inactive</span>
          <span class="legend-count">{{ statusCounts.inactive }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot offline"></span>
          <span class="legend-label">Offline</span>
          <span class="legend-count">{{ statusCounts.offline }}</span>
        </div>
        <div v-if="statusCounts.emergency > 0" class="legend-item">
          <span class="legend-dot emergency"></span>
          <span class="legend-label">Emergency</span>
          <span class="legend-count">{{ statusCounts.emergency }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        Loading modules...
      </div>
      <div v-if="!loading && totalModules === 0" class="no-data">
        📊 No modules registered
      </div>
    </div>

    <!-- Module list -->
    <div v-if="!loading && totalModules > 0" class="module-list">
      <div class="list-header">Recent Activity</div>
      <div class="list-items">
        <div
          v-for="module in activityTimeline.slice(0, 5)"
          :key="module.umid"
          class="list-item"
        >
          <span class="module-status" :class="module.status">●</span>
          <span class="module-name">{{ module.umid }}</span>
          <span class="module-time">{{ formatTime(module.lastSeen) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useModuleActivity } from '~/composables/useModuleActivity'
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
Chart.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
)

defineProps({
  title: {
    type: String,
    default: 'Module Activity Status'
  }
})

const {
  modules,
  loading,
  statusCounts,
  totalModules,
  activePercentage,
  activityTimeline,
  fetchModules
} = useModuleActivity()

const canvas = ref(null)
let chartInstance = null
let refreshInterval = null

const updateChart = () => {
  if (!canvas.value || totalModules.value === 0) {
    console.log('⏭️ Skipping chart update: canvas not ready or no modules')
    return
  }

  try {
    console.log('📊 Updating module activity chart')

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

  // Build chart data arrays
  const labels = ['Active', 'Inactive', 'Offline']
  const data = [
    statusCounts.value.active,
    statusCounts.value.inactive,
    statusCounts.value.offline
  ]
  const backgroundColors = [
    'rgba(34, 197, 94, 0.8)',   // Green for active
    'rgba(251, 191, 36, 0.8)',  // Yellow for inactive
    'rgba(107, 114, 128, 0.8)'  // Gray for offline
  ]
  const borderColors = [
    'rgb(34, 197, 94)',
    'rgb(251, 191, 36)',
    'rgb(107, 114, 128)'
  ]

  // Add emergency if there are any
  if (statusCounts.value.emergency > 0) {
    labels.unshift('Emergency')
    data.unshift(statusCounts.value.emergency)
    backgroundColors.unshift('rgba(220, 38, 38, 0.9)')
    borderColors.unshift('rgb(220, 38, 38)')
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
  } catch (error) {
    console.error('❌ Error creating chart:', error)
  }
}

// Format time relative
const formatTime = (timestamp) => {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Watch for data changes
watch([statusCounts, totalModules], () => {
  if (canvas.value) {
    nextTick(() => {
      updateChart()
    })
  }
}, { deep: true })

onMounted(async () => {
  console.log('🚀 ModuleActivityChart mounted')
  await nextTick() // Ensure DOM is ready
  await fetchModules()
  nextTick(() => {
    updateChart() // Initial chart render
  })
  refreshInterval = setInterval(() => {
    console.log('⏰ Refreshing module activity')
    fetchModules()
  }, 10000) // Refresh every 10 seconds
})

onUnmounted(() => {
  console.log('👋 ModuleActivityChart unmounting')
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
  margin-bottom: 1.5rem;
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

.stat-value.active {
  color: #22c55e;
}

.chart-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2rem;
  min-height: 200px;
}

.chart-wrapper {
  flex: 0 0 200px;
  height: 200px;
  position: relative;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.status-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background: var(--border);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.active {
  background: #22c55e;
}

.legend-dot.inactive {
  background: #fbbf24;
}

.legend-dot.offline {
  background: #6b7280;
}

.legend-dot.emergency {
  background: #dc2626;
  animation: emergencyPulse 1.5s ease-in-out infinite;
}

@keyframes emergencyPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.legend-dot.emergency {
  background: #dc2626;
  animation: emergencyPulse 1.5s ease-in-out infinite;
}

@keyframes emergencyPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.legend-label {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.legend-count {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.module-list {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.list-header {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg);
  border-radius: 6px;
  font-size: 0.813rem;
  transition: all 0.2s ease;
}

.list-item:hover {
  background: var(--border);
}

.module-status {
  font-size: 0.625rem;
  flex-shrink: 0;
}

.module-status.active {
  color: #22c55e;
}

.module-status.inactive {
  color: #fbbf24;
}

.module-status.offline {
  color: #6b7280;
}

.module-name {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-time {
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.loading,
.no-data {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
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
  .chart-container {
    flex-direction: column;
  }

  .chart-wrapper {
    flex: none;
  }

  .status-legend {
    width: 100%;
  }
}
</style>
