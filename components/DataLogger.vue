<template>
  <section class="card data-logger">
    <div class="card-header">
      <h2 class="card-title">Data Logger</h2>
      <div class="header-actions">
        <button
          class="filter-btn"
          :class="{ 'active': filter === 'all' }"
          @click="filter = 'all'"
        >
          All
        </button>
        <button
          class="filter-btn"
          :class="{ 'active': filter === 'error' }"
          @click="filter = 'error'"
        >
          Errors
        </button>
        <button
          class="filter-btn"
          :class="{ 'active': filter === 'warning' }"
          @click="filter = 'warning'"
        >
          Warnings
        </button>
        <button
          class="filter-btn"
          :class="{ 'active': filter === 'info' }"
          @click="filter = 'info'"
        >
          Info
        </button>
        <button class="clear-btn" @click="clearLogs" title="Clear logs">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="logger-stats">
      <div class="stat-item">
        <span class="stat-icon error">●</span>
        <span class="stat-count">{{ errorCount }}</span>
        <span class="stat-label">Errors</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon warning">●</span>
        <span class="stat-count">{{ warningCount }}</span>
        <span class="stat-label">Warnings</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon info">●</span>
        <span class="stat-count">{{ infoCount }}</span>
        <span class="stat-label">Info</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon success">●</span>
        <span class="stat-count">{{ successCount }}</span>
        <span class="stat-label">Success</span>
      </div>
    </div>

    <div class="logger-container" ref="loggerContainer">
      <div
        v-for="(log, index) in filteredLogs"
        :key="log.id"
        class="log-entry"
        :class="log.type"
        :style="{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }"
        @click="toggleLogExpand(log.id)"
      >
        <div class="log-header">
          <span class="log-icon" :class="log.type">
            <svg v-if="log.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <svg v-else-if="log.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg v-else-if="log.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </span>
          <span class="log-timestamp">{{ log.timestamp }}</span>
          <span class="log-message">{{ log.message }}</span>
          <span v-if="log.details" class="expand-icon" :class="{ 'expanded': expandedLogs.includes(log.id) }">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>
        <div v-if="log.details && expandedLogs.includes(log.id)" class="log-details">
          <pre>{{ log.details }}</pre>
        </div>
      </div>

      <div v-if="filteredLogs.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <p>No logs to display</p>
      </div>
    </div>

    <div class="logger-footer">
      <span class="log-count">{{ filteredLogs.length }} of {{ logs.length }} logs</span>
      <button class="auto-scroll-btn" :class="{ 'active': autoScroll }" @click="autoScroll = !autoScroll">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="7 13 12 18 17 13"/>
          <polyline points="7 6 12 11 17 6"/>
        </svg>
        Auto-scroll
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const logs = ref([
  {
    id: 1,
    type: 'info',
    message: 'System initialized successfully',
    timestamp: '10:32:15',
    details: null
  },
  {
    id: 2,
    type: 'success',
    message: 'Database connection established',
    timestamp: '10:32:18',
    details: 'Connected to PostgreSQL database\nHost: localhost:5432\nDatabase: clusterfox_db'
  },
  {
    id: 3,
    type: 'info',
    message: 'Loading user preferences',
    timestamp: '10:32:20',
    details: null
  },
  {
    id: 4,
    type: 'warning',
    message: 'API rate limit approaching (85% used)',
    timestamp: '10:32:45',
    details: 'Current usage: 850/1000 requests\nResets in: 15 minutes'
  },
  {
    id: 5,
    type: 'success',
    message: 'Cache cleared successfully',
    timestamp: '10:33:02',
    details: null
  },
  {
    id: 6,
    type: 'error',
    message: 'Failed to fetch user analytics',
    timestamp: '10:33:15',
    details: 'Error: Network timeout\nEndpoint: /api/v1/analytics\nStatus: 504 Gateway Timeout\nRetrying in 5 seconds...'
  },
  {
    id: 7,
    type: 'info',
    message: 'Background sync started',
    timestamp: '10:33:30',
    details: null
  },
  {
    id: 8,
    type: 'warning',
    message: 'High memory usage detected (78%)',
    timestamp: '10:33:45',
    details: 'Current: 6.2GB / 8GB\nRecommendation: Consider restarting services'
  }
])

const filter = ref('all')
const autoScroll = ref(true)
const expandedLogs = ref([])
const loggerContainer = ref(null)
let logIdCounter = 9

// Computed counts
const errorCount = computed(() => logs.value.filter(log => log.type === 'error').length)
const warningCount = computed(() => logs.value.filter(log => log.type === 'warning').length)
const infoCount = computed(() => logs.value.filter(log => log.type === 'info').length)
const successCount = computed(() => logs.value.filter(log => log.type === 'success').length)

// Filtered logs
const filteredLogs = computed(() => {
  if (filter.value === 'all') return logs.value
  return logs.value.filter(log => log.type === filter.value)
})

// Toggle log expansion
const toggleLogExpand = (logId) => {
  const index = expandedLogs.value.indexOf(logId)
  if (index > -1) {
    expandedLogs.value.splice(index, 1)
  } else {
    expandedLogs.value.push(logId)
  }
}

// Clear all logs
const clearLogs = () => {
  logs.value = []
  expandedLogs.value = []
}

// Add new log (for demo - simulates real-time logging)
const addRandomLog = () => {
  const types = ['info', 'success', 'warning', 'error']
  const messages = {
    info: ['Processing request', 'User session started', 'Background task queued', 'Data sync in progress'],
    success: ['Operation completed', 'File uploaded successfully', 'Settings saved', 'Backup created'],
    warning: ['Resource usage high', 'Slow query detected', 'Cache miss rate elevated', 'Connection pool saturation'],
    error: ['Request failed', 'Database query timeout', 'Authentication failed', 'Service unavailable']
  }

  const type = types[Math.floor(Math.random() * types.length)]
  const messageList = messages[type]
  const message = messageList[Math.floor(Math.random() * messageList.length)]

  const now = new Date()
  const timestamp = now.toLocaleTimeString('en-US', { hour12: false })

  const hasDetails = Math.random() > 0.6
  const details = hasDetails ? `Additional information:\nTimestamp: ${now.toISOString()}\nProcess ID: ${Math.floor(Math.random() * 10000)}\nThread: ${Math.floor(Math.random() * 100)}` : null

  logs.value.push({
    id: logIdCounter++,
    type,
    message,
    timestamp,
    details
  })

  // Keep only last 50 logs
  if (logs.value.length > 50) {
    logs.value.shift()
  }
}

// Auto-scroll to bottom
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

// Simulate real-time logging
let logInterval
onMounted(() => {
  logInterval = setInterval(() => {
    if (Math.random() > 0.3) { // 70% chance to add a log
      addRandomLog()
    }
  }, 3000) // Add log every 3 seconds
})

onUnmounted(() => {
  if (logInterval) {
    clearInterval(logInterval)
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
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn {
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
}

.filter-btn:hover {
  background: var(--bg);
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--accent);
  color: var(--surface);
  border-color: var(--accent);
}

.clear-btn {
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background: var(--bg);
  color: var(--text-primary);
  transform: scale(1.05);
}

.logger-stats {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.813rem;
}

.stat-icon {
  font-size: 0.75rem;
  animation: pulse 2s ease-in-out infinite;
}

.stat-icon.error {
  color: #ef4444;
}

.stat-icon.warning {
  color: #f59e0b;
}

.stat-icon.info {
  color: #3b82f6;
}

.stat-icon.success {
  color: #22c55e;
}

.stat-count {
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
}

.logger-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-entry {
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  animation: slideInLeft 0.3s ease backwards;
}

.log-entry:hover {
  background: var(--bg);
}

.log-entry.error {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.log-entry.warning {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.log-entry.info {
  border-left-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.log-entry.success {
  border-left-color: #22c55e;
  background: rgba(34, 197, 94, 0.05);
}

.log-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.log-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-icon.error {
  color: #ef4444;
}

.log-icon.warning {
  color: #f59e0b;
}

.log-icon.info {
  color: #3b82f6;
}

.log-icon.success {
  color: #22c55e;
}

.log-timestamp {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.log-message {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
}

.expand-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.log-details {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 6px;
  animation: expandDown 0.2s ease;
}

.log-details pre {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  line-height: 1.5;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-tertiary);
  padding: 2rem;
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
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

  .logger-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
