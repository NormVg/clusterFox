<template>
  <div class="system-health">
    <div class="health-header">
      <h3>System Health</h3>
      <span class="status-badge" :class="overallStatus">{{ overallStatus }}</span>
    </div>

    <div class="health-metrics">
      <div class="metric">
        <div class="metric-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span>Active Modules</span>
        </div>
        <div class="metric-value">
          <span class="value">{{ stats.activeModules }}</span>
          <span class="total">/ {{ stats.totalModules }}</span>
        </div>
        <div class="metric-bar">
          <div class="bar-fill" :style="{ width: modulePercentage + '%' }"></div>
        </div>
      </div>

      <div class="metric">
        <div class="metric-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Data Rate</span>
        </div>
        <div class="metric-value">
          <span class="value">{{ stats.dataRate }}</span>
          <span class="unit">entries/min</span>
        </div>
        <div class="metric-trend" :class="dataTrend">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline :points="dataTrend === 'up' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
          </svg>
        </div>
      </div>

      <div class="metric">
        <div class="metric-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M2 12h20"/>
          </svg>
          <span>Total Readings</span>
        </div>
        <div class="metric-value">
          <span class="value">{{ formatNumber(stats.totalReadings) }}</span>
        </div>
      </div>

      <div class="metric">
        <div class="metric-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Uptime</span>
        </div>
        <div class="metric-value">
          <span class="value">{{ uptime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const stats = ref({
  activeModules: 0,
  totalModules: 0,
  dataRate: 0,
  totalReadings: 0,
  lastMinuteCount: 0
})

const startTime = ref(Date.now())
const dataTrend = ref('up')
const isUpdating = ref(false)
let refreshInterval = null

const modulePercentage = computed(() => {
  if (stats.value.totalModules === 0) return 0
  return (stats.value.activeModules / stats.value.totalModules) * 100
})

const overallStatus = computed(() => {
  const percentage = modulePercentage.value
  if (percentage >= 80) return 'healthy'
  if (percentage >= 50) return 'degraded'
  return 'critical'
})

const uptime = computed(() => {
  const now = Date.now()
  const diff = now - startTime.value
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
})

const fetchStats = async () => {
  // Skip if already updating
  if (isUpdating.value) return

  isUpdating.value = true

  try {
    // Fetch both endpoints in parallel for faster loading
    const [modulesResponse, sensorResponse] = await Promise.all([
      fetch('/api/modules'),
      fetch('/api/sensor-data?limit=100') // Reduced from 1000 to 100 for faster response
    ])

    const modulesData = await modulesResponse.json()
    const sensorData = await sensorResponse.json()

    // Process modules data
    if (modulesData.success) {
      const now = Date.now()
      const activeModules = modulesData.modules.filter(m => {
        const lastSeen = new Date(m.lastSeen).getTime()
        return (now - lastSeen) < 300000 // Active if seen in last 5 minutes
      })

      stats.value.activeModules = activeModules.length
      stats.value.totalModules = modulesData.modules.length
    }

    // Process sensor data
    if (sensorData.success) {
      // Get total count from all modules instead of from limited sensor data
      const totalCount = modulesData.modules.reduce((sum, m) => sum + (m.dataCount || 0), 0)
      stats.value.totalReadings = totalCount

      // Calculate data rate (entries per minute from last minute)
      const oneMinuteAgo = Date.now() - 60000
      const recentReadings = sensorData.data.filter(r =>
        new Date(r.timestamp).getTime() > oneMinuteAgo
      )

      const currentMinuteCount = recentReadings.length
      if (stats.value.lastMinuteCount > 0) {
        dataTrend.value = currentMinuteCount >= stats.value.lastMinuteCount ? 'up' : 'down'
      }
      stats.value.lastMinuteCount = currentMinuteCount
      stats.value.dataRate = currentMinuteCount
    }
  } catch (error) {
    console.error('Error fetching system stats:', error)
  } finally {
    isUpdating.value = false
  }
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

onMounted(() => {
  fetchStats()
  refreshInterval = setInterval(fetchStats, 5000) // Refresh every 5 seconds (faster updates)

  // Update uptime every minute
  setInterval(() => {
    uptime.value
  }, 60000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.system-health {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  animation: fadeInScale 0.4s ease;
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.health-header h3 {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-badge.healthy {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
}

.status-badge.degraded {
  background: rgba(251, 191, 36, 0.1);
  color: var(--warning);
}

.status-badge.critical {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

.health-metrics {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.metric-label svg {
  color: var(--accent);
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  position: relative;
}

.metric-value .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.metric-value .total,
.metric-value .unit {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.metric-bar {
  height: 4px;
  background: var(--bg);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--success));
  transition: width 0.5s ease;
}

.metric-trend {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
}

.metric-trend.up {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
}

.metric-trend.down {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
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
  .metric-value .value {
    font-size: 1.25rem;
  }
}
</style>
