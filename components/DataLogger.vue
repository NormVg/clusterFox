<template>
  <section class="card data-logger">
    <div class="card-header">
      <h2 class="card-title">
        Sensor Data Logger
        <span v-if="isLoading" class="loading-indicator">●</span>
      </h2>
      <SensorLogFilters
        v-model="filter"
        :isLoading="isLoading"
        @export="exportLogs"
        @clear="clearAllLogs"
        @refresh="fetchSensorData"
      />
    </div>

    <SensorLogStats
      :successCount="successCount"
      :errorCount="errorCount"
      :warningCount="warningCount"
      :infoCount="infoCount"
    />

    <div class="logger-container" ref="loggerContainer">
      <SensorLogEntry
        v-for="(log, index) in filteredLogs"
        :key="log.id"
        :log="log"
        :index="index"
      />


      <div v-if="isLoading && logs.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        <p>Loading sensor data...</p>
      </div>

      <div v-else-if="filteredLogs.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <p>No sensor data available</p>
        <small>Modules will appear here when they send data via /api/pool</small>
      </div>
    </div>

    <div class="logger-footer">
      <span class="log-count">{{ filteredLogs.length }} of {{ logs.length }} entries</span>
      <div class="footer-actions">
        <span class="refresh-info">Auto-refresh: {{ (refreshInterval / 1000) }}s</span>
        <button class="auto-scroll-btn" :class="{ 'active': autoScroll }" @click="autoScroll = !autoScroll">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="7 13 12 18 17 13"/>
            <polyline points="7 6 12 11 17 6"/>
          </svg>
          Auto-scroll
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useSensorLogs } from '~/composables/useSensorLogs'
import SensorLogStats from './SensorLogStats.vue'
import SensorLogEntry from './SensorLogEntry.vue'
import SensorLogFilters from './SensorLogFilters.vue'

const {
  logs,
  isLoading,
  refreshInterval,
  errorCount,
  warningCount,
  infoCount,
  successCount,
  fetchSettings,
  fetchLogs,
  fetchSensorData,
  clearAllLogs,
  exportLogs,
  getFilteredLogs
} = useSensorLogs()

const filter = ref('all')
const autoScroll = ref(true)
const loggerContainer = ref(null)

// Auto-refresh timer
let refreshTimer

// Filtered logs
const filteredLogs = computed(() => getFilteredLogs(filter.value))

// Auto-scroll to bottom (where new logs appear)
const scrollToBottom = () => {
  if (autoScroll.value && loggerContainer.value) {
    nextTick(() => {
      loggerContainer.value.scrollTop = loggerContainer.value.scrollHeight
    })
  }
}

// Watch for new logs and scroll
watch(() => logs.value.length, () => {
  scrollToBottom()
})

// Lifecycle hooks
onMounted(async () => {
  // Fetch settings first
  await fetchSettings()

  // Initial fetch from database
  fetchLogs()

  // Check for module status changes
  fetchSensorData()

  // Auto-refresh logs using dynamic interval from settings
  refreshTimer = setInterval(() => {
    fetchLogs()
  }, refreshInterval.value)

  // Check module status every 10 seconds
  setInterval(() => {
    fetchSensorData()
  }, 10000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0;
  animation: fadeInScale 0.4s ease;
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: 600px;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
}

.card-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-indicator {
  color: var(--accent);
  animation: pulse 1s ease-in-out infinite;
  font-size: 1.2rem;
  line-height: 0;
}

.logger-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-tertiary);
  padding: 2rem;
}

.empty-state svg {
  opacity: 0.5;
  animation: spin 2s linear infinite;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
}

.empty-state small {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  opacity: 0.7;
}

.logger-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.log-count {
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-info {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-style: italic;
}

.auto-scroll-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.813rem;
  font-weight: 500;
  font-family: inherit;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.auto-scroll-btn:hover {
  background: var(--bg);
  color: var(--text-primary);
}

.auto-scroll-btn.active {
  background: var(--accent);
  color: var(--surface);
  border-color: var(--accent);
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .card {
    height: 500px;
  }
}
</style>
