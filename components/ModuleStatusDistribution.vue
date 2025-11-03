<template>
  <div class="status-distribution">
    <div class="card-header">
      <div class="header-content">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3>Module Status Distribution</h3>
      </div>
      <button @click="refreshData" class="refresh-btn" :disabled="loading">
        <svg v-if="!loading" class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="icon-small spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <div v-if="loading && !statusData" class="loading-state">
      <div class="spinner"></div>
      <p>Loading module status...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg class="icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="statusData" class="content">
      <!-- Visual Bar Chart -->
      <div class="distribution-bar">
        <div 
          v-if="statusData.online > 0"
          class="bar-segment online" 
          :style="{ width: getPercentage(statusData.online) + '%' }"
          :title="`Online: ${statusData.online} (${getPercentage(statusData.online)}%)`"
        ></div>
        <div 
          v-if="statusData.inactive > 0"
          class="bar-segment inactive" 
          :style="{ width: getPercentage(statusData.inactive) + '%' }"
          :title="`Inactive: ${statusData.inactive} (${getPercentage(statusData.inactive)}%)`"
        ></div>
        <div 
          v-if="statusData.offline > 0"
          class="bar-segment offline" 
          :style="{ width: getPercentage(statusData.offline) + '%' }"
          :title="`Offline: ${statusData.offline} (${getPercentage(statusData.offline)}%)`"
        ></div>
      </div>

      <!-- Status Cards -->
      <div class="status-grid">
        <div class="status-card online-card">
          <div class="status-indicator online"></div>
          <div class="status-info">
            <div class="status-count">{{ statusData.online }}</div>
            <div class="status-label">Online</div>
            <div class="status-percentage">{{ getPercentage(statusData.online) }}%</div>
          </div>
        </div>

        <div class="status-card inactive-card">
          <div class="status-indicator inactive"></div>
          <div class="status-info">
            <div class="status-count">{{ statusData.inactive }}</div>
            <div class="status-label">Inactive</div>
            <div class="status-percentage">{{ getPercentage(statusData.inactive) }}%</div>
          </div>
        </div>

        <div class="status-card offline-card">
          <div class="status-indicator offline"></div>
          <div class="status-info">
            <div class="status-count">{{ statusData.offline }}</div>
            <div class="status-label">Offline</div>
            <div class="status-percentage">{{ getPercentage(statusData.offline) }}%</div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="summary">
        <span class="total-label">Total Modules:</span>
        <span class="total-value">{{ statusData.total }}</span>
        <span class="last-updated">Updated {{ lastUpdated }}</span>
      </div>

      <!-- Alert if all offline -->
      <div v-if="statusData.offline === statusData.total" class="alert-box">
        <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="alert-content">
          <strong>All Modules Offline</strong>
          <p>No modules have reported in the last {{ formatThreshold(settingsStore.moduleInactiveThreshold) }}. Check network connectivity.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'

const statusData = ref(null)
const loading = ref(true)
const error = ref(null)
const lastUpdateTime = ref(null)
const settingsStore = useSettingsStore()
let refreshInterval = null

const lastUpdated = computed(() => {
  if (!lastUpdateTime.value) return ''
  const seconds = Math.floor((Date.now() - lastUpdateTime.value) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
})

const getPercentage = (count) => {
  if (!statusData.value || statusData.value.total === 0) return 0
  return Math.round((count / statusData.value.total) * 100)
}

const formatThreshold = (seconds) => {
  if (!seconds) return 'hour'
  if (seconds < 60) return `${seconds} seconds`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`
  const hours = Math.floor(minutes / 60)
  return `${hours} hour${hours > 1 ? 's' : ''}`
}

const fetchStatusData = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch(`/api/modules?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    const data = await response.json()

    if (!data.success) {
      throw new Error('Failed to fetch module data')
    }

    // Calculate real-time status using dynamic settings
    const now = Date.now()
    const activeThreshold = (settingsStore.moduleActiveThreshold || 300) * 1000 // Convert seconds to ms
    const inactiveThreshold = (settingsStore.moduleInactiveThreshold || 3600) * 1000 // Convert seconds to ms
    
    let onlineCount = 0
    let inactiveCount = 0
    let offlineCount = 0
    
    data.modules.forEach(m => {
      const lastSeenTime = new Date(m.lastSeen).getTime()
      const timeSinceLastSeen = now - lastSeenTime
      
      if (timeSinceLastSeen < activeThreshold) {
        onlineCount++
      } else if (timeSinceLastSeen < inactiveThreshold) {
        inactiveCount++
      } else {
        offlineCount++
      }
    })

    statusData.value = {
      online: onlineCount,
      inactive: inactiveCount,
      offline: offlineCount,
      total: data.modules.length
    }

    lastUpdateTime.value = Date.now()
  } catch (err) {
    console.error('Error fetching status data:', err)
    error.value = 'Failed to load module status data'
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchStatusData()
}

onMounted(async () => {
  // Load settings first
  await settingsStore.loadSettings()
  
  // Then fetch data
  fetchStatusData()
  
  // Auto-refresh every 10 seconds for real-time updates
  refreshInterval = setInterval(() => {
    fetchStatusData()
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.status-distribution {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.icon {
  width: 24px;
  height: 24px;
  color: var(--text-primary);
}

.icon-small {
  width: 18px;
  height: 18px;
}

.icon-large {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

.refresh-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}

.refresh-btn:hover:not(:disabled) {
  background: var(--bg);
  border-color: var(--text-primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.distribution-bar {
  display: flex;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg);
  border: 1px solid var(--border);
}

.bar-segment {
  transition: width 0.3s ease;
  cursor: pointer;
  position: relative;
}

.bar-segment:hover {
  opacity: 0.8;
}

.bar-segment.online {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.bar-segment.inactive {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.bar-segment.offline {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.status-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.status-card:hover {
  background: var(--surface);
  transform: translateY(-2px);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.online {
  background: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
}

.status-indicator.inactive {
  background: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
}

.status-indicator.offline {
  background: #ef4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
}

.status-info {
  flex: 1;
}

.status-count {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.status-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.status-percentage {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 600;
}

.summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.total-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.total-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.last-updated {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.alert-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
}

.alert-icon {
  width: 24px;
  height: 24px;
  color: var(--error);
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content strong {
  display: block;
  color: var(--error);
  font-size: 0.875rem;
  margin-bottom: 4px;
  font-weight: 600;
}

.alert-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.813rem;
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }

  .summary {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
