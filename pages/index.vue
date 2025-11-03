<template>
  <NuxtLayout>
    <div class="dashboard-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Dashboard</h1>
          <p>Real-time overview of your IoT network</p>
        </div>
        <div class="header-actions">
          <button class="refresh-btn" @click="refreshAll" :disabled="refreshing">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: refreshing }">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <StatCard
          label="Active Modules"
          :value="stats.activeModules.toString()"
          :change="`${stats.totalModules} total`"
          change-type="info"
        />
        <StatCard
          label="Sensor Readings"
          :value="stats.totalReadings.toString()"
          :change="`${stats.dataRate}/min`"
          change-type="positive"
        />
        <StatCard
          label="System Status"
          :value="stats.systemStatus"
          :change="stats.uptime"
          change-type="positive"
        />
        <StatCard
          label="Active Alerts"
          :value="stats.activeAlerts.toString()"
          :change="stats.alertsChange"
          :change-type="stats.activeAlerts > 0 ? 'negative' : 'positive'"
        />
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- System Health -->
        <div class="grid-section full-width">
          <SystemHealth />
        </div>

        <!-- Quick Actions -->
        <div class="grid-section full-width">
          <QuickActions />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import StatCard from '~/components/StatCard.vue'
import SystemHealth from '~/components/SystemHealth.vue'
import QuickActions from '~/components/QuickActions.vue'

const settingsStore = useSettingsStore()
const refreshing = ref(false)
const stats = ref({
  activeModules: 0,
  totalModules: 0,
  totalReadings: 0,
  dataRate: 0,
  systemStatus: 'Healthy',
  uptime: '0m',
  activeAlerts: 0,
  alertsChange: 'No alerts'
})

const startTime = Date.now()
let refreshInterval = null

const fetchStats = async () => {
  try {
    // Fetch modules with cache-busting
    const modulesResponse = await fetch(`/api/modules?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    const modulesData = await modulesResponse.json()

    if (modulesData.success) {
      // Use the status calculated by the API (respects settings)
      const activeModules = modulesData.modules.filter(m => m.status === 'active')

      stats.value.activeModules = activeModules.length
      stats.value.totalModules = modulesData.modules.length
      stats.value.systemStatus = activeModules.length === modulesData.modules.length ? 'Healthy' : 'Degraded'
    }

    // Fetch sensor data
    const sensorResponse = await fetch('/api/sensor-data?limit=1000')
    const sensorData = await sensorResponse.json()

    if (sensorData.success) {
      stats.value.totalReadings = sensorData.data.length

      // Calculate data rate
      const oneMinuteAgo = Date.now() - 60000
      const recentReadings = sensorData.data.filter(r =>
        new Date(r.timestamp).getTime() > oneMinuteAgo
      )
      stats.value.dataRate = recentReadings.length

      // Count alerts (high temperature or abnormal values)
      const alerts = sensorData.data.filter(r => {
        const temp = r.data?.temperature
        const value = r.data?.value
        return (temp && temp > 35) || (value && (value < 10 || value > 90))
      }).length

      stats.value.activeAlerts = alerts
      stats.value.alertsChange = alerts > 0 ? `${alerts} issues detected` : 'All good'
    }

    // Update uptime
    const uptime = Date.now() - startTime
    const hours = Math.floor(uptime / 3600000)
    const minutes = Math.floor((uptime % 3600000) / 60000)
    stats.value.uptime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const refreshAll = async () => {
  refreshing.value = true
  await fetchStats()
  setTimeout(() => {
    refreshing.value = false
  }, 500)
}

const setupAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }

  if (settingsStore.enableAutoRefresh) {
    const intervalMs = settingsStore.refreshInterval * 1000
    console.log(`[Dashboard] Auto-refresh enabled: every ${settingsStore.refreshInterval}s`)
    refreshInterval = setInterval(fetchStats, intervalMs)
  } else {
    console.log('[Dashboard] Auto-refresh disabled')
  }
}

onMounted(async () => {
  // Load settings first
  await settingsStore.loadSettings()
  console.log('[Dashboard] Settings loaded:', {
    refreshInterval: settingsStore.refreshInterval,
    enableAutoRefresh: settingsStore.enableAutoRefresh
  })

  // Initial fetch
  await fetchStats()

  // Setup auto-refresh
  setupAutoRefresh()

  // Watch for settings changes
  watch(() => [settingsStore.refreshInterval, settingsStore.enableAutoRefresh], () => {
    console.log('[Dashboard] Settings changed, updating refresh interval')
    setupAutoRefresh()
  })
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dashboard-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.header-content p {
  font-size: 0.938rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--bg);
  border-color: var(--accent);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.grid-section.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
