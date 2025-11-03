
<template>
  <section class="card module-list">
    <div class="card-header">
      <h2 class="card-title">
        Registered Modules
        <span v-if="isLoading" class="loading-indicator">●</span>
      </h2>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchModules" :disabled="isLoading">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <div class="module-grid">
      <div v-if="isLoading && modules.length === 0" class="loading-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        <p>Loading modules...</p>
      </div>

      <div v-else-if="modules.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/>
          <line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
        <p>No modules registered</p>
        <small>Modules will appear here after registration via /api/register</small>
      </div>

      <div
        v-for="(module, index) in modules"
        :key="`${module.umid}-${module.status}-${updateKey}`"
        class="module-card"
        :class="{ 'cutoff-module-card': module.isCutoffModule, 'cutoff-active': module.cutoffActive }"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="selectModule(module)"
      >
        <div class="module-header">
          <div class="module-icon" :class="getStatusClass(module.status)">
            <svg v-if="module.status !== 'emergency'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6"/>
              <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
          <div class="module-status" :class="getStatusClass(module.status)">
            <span class="status-dot"></span>
            {{ module.status }}
          </div>
        </div>

        <div class="module-body">
          <h3 class="module-name">
            {{ module.umid }}
            <span v-if="module.isCutoffModule" class="cutoff-badge" :class="{ active: module.cutoffActive }">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              {{ module.cutoffActive ? 'ACTIVE' : 'CUTOFF' }}
            </span>
          </h3>
          <p class="module-type">{{ formatModuleType(module.moduleType) }}</p>

          <div class="module-stats">
            <div class="stat">
              <span class="stat-label">Data Points</span>
              <span class="stat-value">{{ module.dataCount || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Last Seen</span>
              <span class="stat-value">{{ formatLastSeen(module.lastSeen) }}</span>
            </div>
          </div>

          <!-- Emergency Alert -->
          <div v-if="module.emergency && module.emergency.isEmergency" class="emergency-alert">
            <div class="alert-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
              <span>Trigger Alert</span>
            </div>
            <div class="alert-items">
              <div v-for="trigger in module.emergency.triggeredFields" :key="trigger.field" class="alert-item">
                <span class="alert-field">{{ trigger.field }}</span>
                <span class="alert-value">{{ trigger.value }} {{ trigger.condition }} {{ trigger.threshold }}</span>
              </div>
            </div>
          </div>

          <div class="module-info">
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ formatRegisteredAt(module.registeredAt) }}
            </div>
          </div>

          <!-- Only show configure button for non-cutoff modules -->
          <div v-if="!module.isCutoffModule" class="module-footer">
            <div class="footer-actions">
              <button class="config-btn" @click.stop="openTriggerConfig(module)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"/>
                  <line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/>
                  <line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1" y1="14" x2="7" y2="14"/>
                  <line x1="9" y1="8" x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
                Configure Triggers
              </button>
              <button class="delete-btn" @click.stop="confirmDeleteModule(module)" title="Delete module">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Show cutoff status for cutoff modules -->
          <div v-else class="module-footer cutoff-status">
            <div class="cutoff-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>{{ module.cutoffActive ? 'Emergency Cutoff Active' : 'Cutoff Module' }}</span>
            </div>
            <button class="delete-btn-small" @click.stop="confirmDeleteModule(module)" title="Delete module">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Trigger Configuration Modal -->
    <div v-if="showTriggerModal" class="modal-overlay" @click="closeTriggerConfig">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Configure Triggers for {{ selectedModule?.umid }}</h3>
          <button class="close-btn" @click="closeTriggerConfig">×</button>
        </div>

        <div class="modal-body">
          <p class="modal-description">Set trigger conditions that will change the module status to EMERGENCY when met.</p>

          <div v-for="component in selectedModule?.typeComponents" :key="component" class="trigger-config">
            <div class="trigger-header">
              <label class="trigger-label">
                <input
                  type="checkbox"
                  v-model="triggerConfig[component].enabled"
                />
                <span>{{ component }}</span>
              </label>
            </div>

            <div v-if="triggerConfig[component].enabled" class="trigger-inputs">
              <div class="input-group">
                <label>Condition</label>
                <select v-model="triggerConfig[component].condition">
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>

              <div class="input-group">
                <label>Threshold</label>
                <input
                  type="number"
                  v-model.number="triggerConfig[component].threshold"
                  step="0.1"
                  placeholder="Enter value"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeTriggerConfig">Cancel</button>
          <button class="btn-save" @click="saveTriggerConfig">Save Triggers</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Module</h3>
          <button class="close-btn" @click="closeDeleteModal">×</button>
        </div>

        <div class="modal-body">
          <p class="modal-description warning">
            Are you sure you want to delete this module?
          </p>
          <div class="module-info-box">
            <p><strong>UMID:</strong> {{ moduleToDelete?.umid }}</p>
            <p><strong>Type:</strong> {{ moduleToDelete?.moduleType || 'Unknown' }}</p>
            <p v-if="moduleToDelete?.isCutoffModule" class="cutoff-warning">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              This is a cutoff module. Deleting it will affect emergency control.
            </p>
          </div>
          <p class="modal-description danger">
            This action cannot be undone.
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeleteModal">Cancel</button>
          <button class="btn-delete" @click="deleteModule">Delete Module</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'

const settingsStore = useSettingsStore()
const modules = ref([])
const isLoading = ref(false)
const updateKey = ref(0)
let refreshInterval = null

// Trigger configuration
const showTriggerModal = ref(false)
const selectedModule = ref(null)
const triggerConfig = ref({})

// Delete confirmation
const showDeleteModal = ref(false)
const moduleToDelete = ref(null)

const fetchModules = async () => {
  try {
    isLoading.value = true
    // Add cache busting to ensure fresh data
    const response = await fetch(`/api/modules?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    const data = await response.json()

    if (data.success && data.modules) {
      console.log('[ModuleList] Fetched modules:', data.modules.map(m => ({
        umid: m.umid,
        status: m.status,
        lastSeen: m.lastSeen
      })))
      // Force reactivity by creating a new array
      modules.value = [...data.modules]
      updateKey.value++ // Force component re-render
      console.log('[ModuleList] Updated modules.value, length:', modules.value.length, 'updateKey:', updateKey.value)

      // Force Vue to update the DOM
      await nextTick()
    }
  } catch (error) {
    console.error('Error fetching modules:', error)
  } finally {
    isLoading.value = false
  }
}

const formatModuleType = (type) => {
  if (!type) return 'Unknown'
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const formatRegisteredAt = (timestamp) => {
  if (!timestamp) return 'Unknown'
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getStatusClass = (status) => {
  return status?.toLowerCase() || 'unknown'
}

const selectModule = (module) => {
  console.log('Module selected:', module)
  // You can emit an event or navigate to a details page
}

// Trigger configuration functions
const openTriggerConfig = (module) => {
  selectedModule.value = module

  // Initialize trigger config for each component
  const config = {}
  module.typeComponents.forEach(component => {
    if (module.triggers && module.triggers[component]) {
      config[component] = { ...module.triggers[component] }
    } else {
      config[component] = {
        enabled: false,
        threshold: 0,
        condition: 'above'
      }
    }
  })

  triggerConfig.value = config
  showTriggerModal.value = true
}

const closeTriggerConfig = () => {
  showTriggerModal.value = false
  selectedModule.value = null
  triggerConfig.value = {}
}

const saveTriggerConfig = async () => {
  try {
    const response = await fetch('/api/modules', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        umid: selectedModule.value.umid,
        triggers: triggerConfig.value
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ Triggers saved successfully')
      closeTriggerConfig()
      // Refresh modules to show updated triggers
      await fetchModules()
    } else {
      console.error('❌ Failed to save triggers:', result.error)
      alert('Failed to save triggers: ' + result.error)
    }
  } catch (error) {
    console.error('❌ Error saving triggers:', error)
    alert('Error saving triggers. Please try again.')
  }
}

// Delete module functions
const confirmDeleteModule = (module) => {
  moduleToDelete.value = module
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  moduleToDelete.value = null
}

const deleteModule = async () => {
  if (!moduleToDelete.value) return

  try {
    const response = await fetch('/api/module-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        umid: moduleToDelete.value.umid
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ Module deleted successfully')
      closeDeleteModal()
      // Refresh modules list
      await fetchModules()
    } else {
      console.error('❌ Failed to delete module:', result.error)
      alert('Failed to delete module: ' + result.error)
    }
  } catch (error) {
    console.error('❌ Error deleting module:', error)
    alert('Error deleting module. Please try again.')
  }
}

// Setup auto-refresh based on settings
const setupAutoRefresh = () => {
  // Clear existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }

  // Only setup if auto-refresh is enabled
  if (settingsStore.enableAutoRefresh) {
    const intervalMs = settingsStore.refreshInterval * 1000 // Convert seconds to milliseconds
    console.log(`[ModuleList] Setting up auto-refresh every ${settingsStore.refreshInterval}s (${intervalMs}ms)`)
    refreshInterval = setInterval(fetchModules, intervalMs)
  } else {
    console.log('[ModuleList] Auto-refresh is disabled')
  }
}

// Watch for settings changes
watch(
  () => [settingsStore.enableAutoRefresh, settingsStore.refreshInterval],
  () => {
    console.log('[ModuleList] Settings changed, updating refresh interval')
    setupAutoRefresh()
  }
)

onMounted(async () => {
  // Load settings first
  await settingsStore.loadSettings()
  console.log('[ModuleList] Settings loaded:', {
    enableAutoRefresh: settingsStore.enableAutoRefresh,
    refreshInterval: settingsStore.refreshInterval,
    moduleActiveThreshold: settingsStore.moduleActiveThreshold,
    moduleInactiveThreshold: settingsStore.moduleInactiveThreshold
  })

  // Initial fetch
  await fetchModules()

  // Setup auto-refresh
  setupAutoRefresh()
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
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
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-indicator {
  color: var(--accent);
  animation: pulse 1s ease-in-out infinite;
  font-size: 1.2rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--bg);
  color: var(--text-primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.module-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  flex: 1;
}

.module-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.4s ease backwards;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: all 0.3s ease;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--accent);
}

/* Cutoff Module Card Styling */
.module-card.cutoff-module-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, var(--bg) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
}

.module-card.cutoff-module-card::before {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.module-card.cutoff-module-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

/* Active Cutoff Module Styling */
.module-card.cutoff-active {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, var(--bg) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 24px rgba(239, 68, 68, 0.15);
  animation: cutoffGlow 2s ease-in-out infinite;
}

.module-card.cutoff-active::before {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.module-card.cutoff-active:hover {
  border-color: #ef4444;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
}

@keyframes cutoffGlow {
  0%, 100% {
    box-shadow: 0 0 24px rgba(239, 68, 68, 0.15);
  }
  50% {
    box-shadow: 0 0 32px rgba(239, 68, 68, 0.25);
  }
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.module-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.module-icon.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.module-icon.offline {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.module-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.module-card:hover .module-icon {
  transform: scale(1.1);
}

.module-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.module-status.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.module-status.active .status-dot {
  background: #10b981;
}

.module-status.offline {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.module-status.offline .status-dot {
  background: #6b7280;
}

.module-status.inactive {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.module-status.inactive .status-dot {
  background: #f59e0b;
}

.module-status.emergency {
  background: rgba(220, 38, 38, 0.15);
  color: #dc2626;
  font-weight: 600;
  animation: emergencyPulse 2s ease-in-out infinite;
}

.module-status.emergency .status-dot {
  background: #dc2626;
  animation: emergencyDot 1s ease-in-out infinite;
}

.module-icon.emergency {
  background: rgba(220, 38, 38, 0.1);
  border-color: #dc2626;
  color: #dc2626;
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes emergencyPulse {
  0%, 100% {
    background: rgba(220, 38, 38, 0.15);
  }
  50% {
    background: rgba(220, 38, 38, 0.25);
  }
}

@keyframes emergencyDot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.module-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.module-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cutoff-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 1rem;
  font-size: 0.688rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  text-transform: uppercase;
}

.cutoff-badge svg {
  filter: drop-shadow(0 0 2px currentColor);
}

.cutoff-badge.active {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 2px 12px rgba(239, 68, 68, 0.25);
  animation: badgePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes badgePulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 2px 12px rgba(239, 68, 68, 0.25);
  }
  50% {
    opacity: 0.85;
    box-shadow: 0 2px 16px rgba(239, 68, 68, 0.35);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.module-type {
  font-size: 0.813rem;
  color: var(--text-secondary);
  margin: 0;
}

.module-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.688rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
}

.module-info {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.loading-state, .empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-tertiary);
}

.loading-state svg {
  animation: spin 2s linear infinite;
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.empty-state small {
  font-size: 0.75rem;
  opacity: 0.7;
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

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

/* Emergency Alert */
.emergency-alert {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.5rem;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-size: 0.813rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.alert-header svg {
  flex-shrink: 0;
}

.alert-items {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  padding: 0.375rem 0.5rem;
  background: var(--bg);
  border-radius: 4px;
}

.alert-field {
  font-weight: 600;
  color: var(--text-primary);
  text-transform: capitalize;
}

.alert-value {
  color: #dc2626;
  font-weight: 500;
}

.module-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.config-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.config-btn:hover {
  background: var(--surface);
  border-color: var(--text-secondary);
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cutoff-status {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.cutoff-active .cutoff-status {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.05) 100%);
  border-color: rgba(239, 68, 68, 0.3);
}

.cutoff-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  flex: 1;
}

.cutoff-active .cutoff-info {
  color: #ef4444;
}

.cutoff-info svg {
  flex-shrink: 0;
  animation: powerPulse 2s ease-in-out infinite;
}

.cutoff-active .cutoff-info svg {
  animation: powerPulse 1s ease-in-out infinite;
}

@keyframes powerPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}

.config-btn svg {
  flex-shrink: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--bg);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
}

.trigger-config {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.trigger-config:last-child {
  margin-bottom: 0;
}

.trigger-header {
  margin-bottom: 0.75rem;
}

.trigger-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.938rem;
  text-transform: capitalize;
}

.trigger-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.trigger-inputs {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.input-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-group select,
.input-group input {
  padding: 0.625rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.input-group select:focus,
.input-group input:focus {
  outline: none;
  border-color: var(--accent);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border);
}

.btn-cancel,
.btn-save {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-cancel:hover {
  background: var(--bg);
  color: var(--text-primary);
}

.btn-save {
  background: var(--text-primary);
  color: var(--bg);
}

.btn-save:hover {
  background: var(--text-secondary);
}

/* Delete button styles */
.footer-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #ff4444;
  border-radius: 6px;
  color: #ff4444;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #ff4444;
  color: white;
  transform: translateY(-1px);
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

.delete-btn-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid #ff4444;
  border-radius: 6px;
  color: #ff4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn-small:hover {
  background: #ff4444;
  color: white;
  transform: scale(1.05);
}

.delete-btn-small svg {
  width: 16px;
  height: 16px;
}

/* Delete modal styles */
.delete-modal {
  max-width: 500px;
}

.modal-description.warning {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.modal-description.danger {
  font-size: 0.875rem;
  color: #ff4444;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0;
}

.module-info-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.module-info-box p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: white;
}

.module-info-box p:first-child {
  margin-top: 0;
}

.module-info-box p:last-child {
  margin-bottom: 0;
}

.module-info-box strong {
  color: white;
}

.cutoff-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff9800;
  font-weight: 600;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.cutoff-warning svg {
  flex-shrink: 0;
}

.btn-delete {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ff4444;
  color: white;
}

.btn-delete:hover {
  background: #cc0000;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .trigger-inputs {
    grid-template-columns: 1fr;
  }
}
</style>
