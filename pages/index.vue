<template>
  <NuxtLayout>
    <div class="dashboard-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Dashboard</h1>
            <div class="status-indicator" :class="getSystemHealthClass()">
              <span class="status-dot"></span>
              <span>{{ stats.systemStatus }}</span>
            </div>
          </div>
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

      <!-- Enhanced Stats Overview -->
      <div class="stats-grid">
        <ActiveEmergencyCard
          :count="stats.activeAlerts"
          :message="stats.alertsChange"
        />
        <StatCard
          label="Active Modules"
          :value="stats.activeModules.toString()"
          :change="`${stats.totalModules} total`"
          change-type="info"
        />
        <StatCard
          label="Sensor Readings"
          :value="formatNumber(stats.totalReadings)"
          :change="`${stats.dataRate}/min`"
          change-type="positive"
        />
        <StatCard
          label="Network Uptime"
          :value="stats.uptime"
          :change="`Started ${stats.startedAt}`"
          change-type="positive"
        />
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- System Health -->
        <div class="grid-section full-width">
          <SystemHealth />
        </div>

        <!-- Module Status Distribution (Full Width) -->
        <div class="grid-section full-width">
          <ModuleStatusDistribution />
        </div>

        <!-- Network Activity Timeline & Predictive Maintenance Row (Half Screen Each) -->
        <div class="grid-section half-width">
          <NetworkActivityTimeline />
        </div>
        <div class="grid-section half-width">
          <PredictiveMaintenanceCard />
        </div>

        <!-- Data Quality Metrics (Full Width) -->
        <div class="grid-section full-width">
          <DataQualityMetrics />
        </div>

        <!-- Performance Scoreboard (Full Width) -->
        <div class="grid-section full-width">
          <PerformanceScoreboard />
        </div>

        <!-- Realtime Chart -->
        <div class="grid-section full-width">
          <RealtimeChart />
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
import ActiveEmergencyCard from '~/components/ActiveEmergencyCard.vue'
import SystemHealth from '~/components/SystemHealth.vue'
import QuickActions from '~/components/QuickActions.vue'
import PerformanceScoreboard from '~/components/PerformanceScoreboard.vue'
import PredictiveMaintenanceCard from '~/components/PredictiveMaintenanceCard.vue'
import DataQualityMetrics from '~/components/DataQualityMetrics.vue'
import RealtimeChart from '~/components/RealtimeChart.vue'
import ModuleStatusDistribution from '~/components/ModuleStatusDistribution.vue'
import NetworkActivityTimeline from '~/components/NetworkActivityTimeline.vue'

const settingsStore = useSettingsStore()
const refreshing = ref(false)
const stats = ref({
  activeModules: 0,
  totalModules: 0,
  totalReadings: 0,
  dataRate: 0,
  systemStatus: 'Healthy',
  uptime: '0m',
  startedAt: 'now',
  activeAlerts: 0,
  alertsChange: 'All good'
})

let refreshInterval = null

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const getSystemHealthClass = () => {
  if (stats.value.systemStatus === 'Healthy') return 'status-healthy'
  if (stats.value.systemStatus === 'Degraded') return 'status-warning'
  return 'status-critical'
}

const fetchStats = async () => {
  try {
    console.log('[Dashboard] Fetching stats...')
    
    // Fetch all data in parallel with cache-busting
    const timestamp = Date.now()
    const [modulesResponse, sensorResponse, uptimeResponse] = await Promise.all([
      fetch(`/api/modules?_t=${timestamp}`),
      fetch(`/api/sensor-data?limit=1000&_t=${timestamp}`),
      fetch(`/api/uptime?_t=${timestamp}`)
    ])
    
    if (!modulesResponse.ok || !sensorResponse.ok || !uptimeResponse.ok) {
      throw new Error('One or more API calls failed')
    }
    
    const modulesData = await modulesResponse.json()
    const sensorData = await sensorResponse.json()
    const uptimeData = await uptimeResponse.json()

    console.log('[Dashboard] Modules loaded:', modulesData.success)
    console.log('[Dashboard] Sensor data loaded:', sensorData.success)
    console.log('[Dashboard] Uptime loaded:', uptimeData.success)

    // STEP 1: Calculate module status
    if (modulesData.success && modulesData.modules) {
      const now = Date.now()
      const activeThreshold = (settingsStore.moduleActiveThreshold || 300) * 1000
      const inactiveThreshold = (settingsStore.moduleInactiveThreshold || 3600) * 1000
      
      let onlineCount = 0
      let offlineCount = 0
      
      modulesData.modules.forEach(m => {
        const lastSeenTime = new Date(m.lastSeen).getTime()
        const timeSince = now - lastSeenTime
        
        if (timeSince < activeThreshold) {
          onlineCount++
        } else {
          offlineCount++
        }
      })

      stats.value.activeModules = onlineCount
      stats.value.totalModules = modulesData.modules.length
      
      // System status
      if (offlineCount === modulesData.modules.length) {
        stats.value.systemStatus = 'Critical'
      } else if (onlineCount === 0) {
        stats.value.systemStatus = 'Degraded'
      } else if (onlineCount === modulesData.modules.length) {
        stats.value.systemStatus = 'Healthy'
      } else {
        stats.value.systemStatus = 'Degraded'
      }

      // Total readings
      stats.value.totalReadings = modulesData.modules.reduce((sum, m) => sum + (m.dataCount || 0), 0)

      // Live emergency count from modules
      const liveEmergencyCount = modulesData.modules.filter(m => m.emergency && m.emergency.isEmergency).length
      stats.value.activeAlerts = liveEmergencyCount
      stats.value.alertsChange = liveEmergencyCount > 0
        ? `${liveEmergencyCount} emergency trigger${liveEmergencyCount > 1 ? 's' : ''} active`
        : 'All good'
      
      console.log('[Dashboard] Module stats:', {
        active: stats.value.activeModules,
        total: stats.value.totalModules,
        status: stats.value.systemStatus
      })
    }

    // STEP 2: Calculate data rate
    if (sensorData.success && sensorData.data) {
      const oneMinuteAgo = Date.now() - 60000
      const recentReadings = sensorData.data.filter(r =>
        new Date(r.timestamp).getTime() > oneMinuteAgo
      )
      stats.value.dataRate = recentReadings.length
      
      console.log('[Dashboard] Data rate:', stats.value.dataRate)
    }

    // STEP 3: Update uptime
    if (uptimeData.success) {
      stats.value.uptime = uptimeData.formatted
      
      const startDate = new Date(uptimeData.startTime)
      stats.value.startedAt = startDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
      
      console.log('[Dashboard] Uptime:', stats.value.uptime)
    }

    console.log('[Dashboard] ✅ Stats updated successfully')

  } catch (error) {
    console.error('[Dashboard] ❌ Error fetching stats:', error)
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
  max-width: 1600px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.813rem;
  font-weight: 600;
}

.status-indicator.status-healthy {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-indicator.status-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-indicator.status-critical {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
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
  background: #000000;
  border: 1px solid #000000;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: white;
  color: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  min-width: 0;
}

.grid-section {
  min-width: 0;
  overflow: hidden;
}

.grid-section.full-width {
  grid-column: 1 / -1;
}

.grid-section.half-width {
  grid-column: span 1;
}

@media (max-width: 1024px) {
  .grid-section.half-width {
    grid-column: 1 / -1;
  }
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
