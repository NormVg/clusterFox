<template>
  <div class="network-timeline">
    <div class="card-header">
      <div class="header-content">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>Network Activity Timeline</h3>
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

    <div v-if="loading && !timelineData.length" class="loading-state">
      <div class="spinner"></div>
      <p>Loading activity timeline...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg class="icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="timelineData.length" class="content">
      <div class="timeline-scroll">
        <div class="timeline-items">
          <div 
            v-for="item in timelineData" 
            :key="item.id"
            class="timeline-item"
            :class="[`status-${item.status}`]"
          >
            <div class="timeline-marker" :class="`marker-${item.status}`">
              <svg v-if="item.status === 'online'" class="marker-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="item.status === 'inactive'" class="marker-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="marker-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>

            <div class="timeline-content">
              <div class="module-header">
                <span class="module-id">{{ item.id }}</span>
                <span class="module-name">{{ item.name }}</span>
              </div>
              <div class="activity-info">
                <span class="activity-label">Last seen:</span>
                <span class="activity-time" :title="item.lastSeenDate">{{ item.timeAgo }}</span>
              </div>
              <div class="status-badge" :class="`badge-${item.status}`">
                {{ item.statusText }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="timeline-summary">
        <div class="summary-item">
          <span class="summary-label">Most Recent Activity:</span>
          <span class="summary-value">{{ mostRecentActivity }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Oldest Activity:</span>
          <span class="summary-value">{{ oldestActivity }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <svg class="icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p>No module activity data available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'

const timelineData = ref([])
const loading = ref(true)
const error = ref(null)
const settingsStore = useSettingsStore()
let refreshInterval = null

const formatTimeAgo = (lastSeen) => {
  const now = Date.now()
  const lastSeenTime = new Date(lastSeen).getTime()
  const diff = now - lastSeenTime

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h ago`
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`
  return `${seconds}s ago`
}

const getStatus = (lastSeen) => {
  const now = Date.now()
  const lastSeenTime = new Date(lastSeen).getTime()
  const timeSinceLastSeen = now - lastSeenTime

  // Use dynamic settings thresholds
  const activeThreshold = (settingsStore.moduleActiveThreshold || 300) * 1000 // Convert seconds to ms
  const inactiveThreshold = (settingsStore.moduleInactiveThreshold || 3600) * 1000 // Convert seconds to ms

  if (timeSinceLastSeen < activeThreshold) return { status: 'online', text: 'Online' }
  if (timeSinceLastSeen < inactiveThreshold) return { status: 'inactive', text: 'Inactive' }
  return { status: 'offline', text: 'Offline' }
}

const mostRecentActivity = computed(() => {
  if (!timelineData.value.length) return 'N/A'
  return timelineData.value[0].timeAgo
})

const oldestActivity = computed(() => {
  if (!timelineData.value.length) return 'N/A'
  return timelineData.value[timelineData.value.length - 1].timeAgo
})

const fetchTimelineData = async () => {
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

    // Sort by lastSeen (most recent first)
    const sortedModules = [...data.modules].sort((a, b) => {
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    })

    timelineData.value = sortedModules.map(module => {
      const statusInfo = getStatus(module.lastSeen)
      return {
        id: module.umid,
        name: module.moduleType || 'Unknown',
        lastSeen: module.lastSeen,
        lastSeenDate: new Date(module.lastSeen).toLocaleString(),
        timeAgo: formatTimeAgo(module.lastSeen),
        status: statusInfo.status,
        statusText: statusInfo.text
      }
    })
  } catch (err) {
    console.error('Error fetching timeline data:', err)
    error.value = 'Failed to load network activity timeline'
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchTimelineData()
}

onMounted(async () => {
  // Load settings first
  await settingsStore.loadSettings()
  
  // Then fetch data
  fetchTimelineData()
  
  // Auto-refresh every 10 seconds for real-time updates
  refreshInterval = setInterval(() => {
    fetchTimelineData()
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.network-timeline {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  max-height: 650px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  color: var(--text-tertiary);
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
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--text-secondary);
  flex: 1;
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
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.timeline-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.timeline-scroll::-webkit-scrollbar {
  width: 6px;
}

.timeline-scroll::-webkit-scrollbar-track {
  background: var(--bg);
  border-radius: 3px;
}

.timeline-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.timeline-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 8px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  border-left: 3px solid var(--border);
  transition: all 0.2s;
}

.timeline-item:hover {
  background: var(--surface);
  transform: translateX(4px);
}

.timeline-item.status-online {
  border-left-color: #10b981;
}

.timeline-item.status-inactive {
  border-left-color: #f59e0b;
}

.timeline-item.status-offline {
  border-left-color: #ef4444;
}

.timeline-marker {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.marker-online {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.marker-inactive {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.marker-offline {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.marker-icon {
  width: 16px;
  height: 16px;
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.module-id {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.module-name {
  color: var(--text-secondary);
  font-size: 0.813rem;
}

.activity-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
}

.activity-label {
  color: var(--text-tertiary);
}

.activity-time {
  color: var(--text-secondary);
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.badge-online {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.badge-inactive {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.badge-offline {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.timeline-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg);
  border-radius: 8px;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: 0.688rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .timeline-summary {
    grid-template-columns: 1fr;
  }

  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
