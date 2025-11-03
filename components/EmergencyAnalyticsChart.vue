<template>
  <div class="emergency-analytics">
    <div class="header">
      <div class="header-content">
        <div class="header-icon" :class="{ pulse: emergencyModules.length > 0 }">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <h3>Emergency Alerts</h3>
          <p>Active emergency modules and triggered conditions</p>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading emergency data...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
    </div>

    <div v-else class="content">
      <!-- Quick Stats -->
      <div class="stats-row">
        <div class="stat-card emergency">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalEmergencies }}</div>
            <div class="stat-label">Active Emergencies</div>
          </div>
        </div>

        <div class="stat-card critical">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.criticalAlerts }}</div>
            <div class="stat-label">Critical Alerts</div>
          </div>
        </div>

        <div class="stat-card types">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.moduleTypes }}</div>
            <div class="stat-label">Module Types</div>
          </div>
        </div>
      </div>

      <!-- No Emergencies State -->
      <div v-if="emergencyModules.length === 0" class="no-emergencies">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h4>All Systems Normal</h4>
        <p>No emergency conditions detected</p>
      </div>

      <!-- Emergency Modules List -->
      <div v-else class="emergency-list">
        <div
          v-for="module in emergencyModules"
          :key="module.umid"
          class="emergency-card"
        >
          <div class="emergency-header">
            <div class="module-info">
              <div class="module-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                  <line x1="6" y1="6" x2="6.01" y2="6"/>
                  <line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
              </div>
              <div>
                <h4>{{ module.umid }}</h4>
                <p>{{ module.moduleType }}</p>
              </div>
            </div>
            <div class="emergency-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              EMERGENCY
            </div>
          </div>

          <div class="triggers-section">
            <h5>Triggered Conditions</h5>
            <div class="trigger-list">
              <div
                v-for="(trigger, idx) in module.triggeredConditions"
                :key="idx"
                class="trigger-item"
              >
                <span class="trigger-field">{{ trigger.field }}</span>
                <span class="trigger-value">{{ trigger.value.toFixed(1) }}</span>
                <span class="trigger-condition">
                  {{ trigger.condition }} {{ trigger.threshold }}
                </span>
              </div>
            </div>
          </div>

          <div class="emergency-footer">
            <span class="last-seen">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Last seen {{ getTimeAgo(module.lastSeen) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEmergencyAnalytics } from '~/composables/useEmergencyAudio'

const {
  emergencyModules,
  isLoading
} = useEmergencyAnalytics()

// Compute stats from emergency modules
const stats = computed(() => {
  const modules = emergencyModules.value || []
  const uniqueTypes = new Set(modules.map(m => m.moduleType))

  return {
    totalEmergencies: modules.length,
    criticalAlerts: modules.filter(m => m.emergency?.triggeredFields?.length > 1).length,
    moduleTypes: uniqueTypes.size
  }
})

const error = computed(() => null)

let refreshInterval = null

const getTimeAgo = (timestamp) => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

// No need for onMounted/onUnmounted - the composable handles auto-refresh
</script>

<style scoped>
.emergency-analytics {
  background: var(--surface);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-icon.pulse {
  animation: emergencyPulse 2s ease-in-out infinite;
}

.header-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.header-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.header-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--border);
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  width: 3rem;
  height: 3rem;
  color: #dc2626;
}

.error-state p {
  color: var(--text-secondary);
  font-size: 0.938rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem;
  background: var(--bg);
  border-radius: 0.625rem;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.stat-card.emergency {
  border-color: rgba(220, 38, 38, 0.3);
}

.stat-card.critical {
  border-color: rgba(245, 158, 11, 0.3);
}

.stat-card .stat-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-card.emergency .stat-icon {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

.stat-card.critical .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.stat-card.types .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.stat-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.813rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.no-emergencies {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--bg);
  border-radius: 0.75rem;
  border: 2px dashed var(--border);
}

.no-emergencies svg {
  width: 4rem;
  height: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.no-emergencies h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.no-emergencies p {
  font-size: 0.938rem;
  color: var(--text-secondary);
  margin: 0;
}

.emergency-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.emergency-card {
  background: var(--bg);
  border: 2px solid #dc2626;
  border-radius: 0.75rem;
  padding: 1.25rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.emergency-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.module-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.module-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.module-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.module-info h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  font-family: 'Monaco', monospace;
}

.module-info p {
  font-size: 0.813rem;
  color: var(--text-secondary);
  margin: 0;
}

.emergency-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  animation: pulse 2s ease-in-out infinite;
}

.emergency-badge svg {
  width: 1rem;
  height: 1rem;
}

.triggers-section {
  margin-bottom: 1rem;
}

.triggers-section h5 {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.trigger-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trigger-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  background: rgba(220, 38, 38, 0.05);
  border-radius: 0.375rem;
  border-left: 3px solid #dc2626;
}

.trigger-field {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
}

.trigger-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #dc2626;
  text-align: center;
}

.trigger-condition {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: right;
}

.emergency-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.last-seen {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.last-seen svg {
  width: 0.875rem;
  height: 0.875rem;
}

@keyframes emergencyPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .emergency-list {
    grid-template-columns: 1fr;
  }

  .trigger-item {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .trigger-value,
  .trigger-condition {
    text-align: left;
  }
}
</style>
