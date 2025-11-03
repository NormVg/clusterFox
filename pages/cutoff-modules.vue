<template>
  <NuxtLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Cutoff Modules</h1>
          <p>Manage automatic emergency cutoff system</p>
        </div>
        <button class="btn-primary" @click="refreshData">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>

      <!-- Info Banner -->
      <div class="info-banner">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <div>
          <strong>How it works:</strong> Map your sensor modules to cutoff modules. When a sensor enters emergency status, its mapped cutoff module will automatically activate.
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ cutoffModules.length }}</div>
            <div class="stat-label">Cutoff Modules</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activeCutoffs }}</div>
            <div class="stat-label">Active Cutoffs</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ mappings.length }}</div>
            <div class="stat-label">Mapped Connections</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ regularModules.length }}</div>
            <div class="stat-label">Source Modules</div>
          </div>
        </div>
      </div>

      <!-- Module Mapping (Full Width at Top) -->
      <div class="card">
        <h2 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
          Module Mappings
        </h2>

        <!-- Add Mapping Form -->
          <div class="mapping-form">
            <div class="form-group">
              <label>Source Module (Sensor)</label>
              <select v-model="newMapping.sourceModuleUmid">
                <option value="">Select source module...</option>
                <option v-for="module in regularModules" :key="module.umid" :value="module.umid">
                  {{ module.umid }} ({{ module.moduleType }})
                </option>
              </select>
            </div>

            <div class="arrow-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>

            <div class="form-group">
              <label>Cutoff Module (Target)</label>
              <select v-model="newMapping.cutoffModuleUmid">
                <option value="">Select cutoff module...</option>
                <option v-for="module in cutoffModules" :key="module.umid" :value="module.umid">
                  {{ module.umid }} ({{ module.moduleType }})
                </option>
              </select>
            </div>

            <button
              class="btn-primary"
              @click="addMapping"
              :disabled="!newMapping.sourceModuleUmid || !newMapping.cutoffModuleUmid"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Mapping
            </button>
          </div>

          <!-- Mappings List -->
          <div v-if="mappings.length === 0" class="empty-state small">
            <p>No mappings configured</p>
            <small>Create a mapping to enable automatic cutoff</small>
          </div>

          <div v-else class="mappings-list">
            <div v-for="mapping in enrichedMappings" :key="mapping.sourceModuleUmid" class="mapping-item">
              <div class="mapping-source">
                <div class="mapping-label">Source</div>
                <div class="mapping-module">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  <span>{{ mapping.sourceModule?.umid || 'Unknown' }}</span>
                </div>
                <div class="mapping-type">{{ formatModuleType(mapping.sourceModule?.moduleType) || '-' }}</div>
              </div>

              <div class="mapping-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>

              <div class="mapping-target">
                <div class="mapping-label">Cutoff</div>
                <div class="mapping-module">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  <span>{{ mapping.cutoffModule?.umid || 'Unknown' }}</span>
                </div>
                <div class="mapping-type">{{ formatModuleType(mapping.cutoffModule?.moduleType) || '-' }}</div>
                <span v-if="mapping.cutoffModule?.cutoffActive" class="mini-badge active">ACTIVE</span>
              </div>

              <button class="btn-remove" @click="removeMapping(mapping.sourceModuleUmid)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      <!-- Cutoff Modules List (Full Width at Bottom) -->
      <div class="card">
        <h2 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          Cutoff Modules
        </h2>

        <div v-if="cutoffModules.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <p>No cutoff modules registered</p>
          <small>Register a module with isCutoffModule: true</small>
        </div>

        <div v-else class="module-list">
          <div v-for="module in cutoffModules" :key="module.umid" class="module-item" :class="{ active: module.cutoffActive }">
            <div class="module-header">
              <div class="module-icon" :class="{ active: module.cutoffActive }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div class="module-info">
                <div class="module-name">{{ module.umid }}</div>
                <div class="module-type">{{ formatModuleType(module.moduleType) }}</div>
              </div>
              <span class="status-badge" :class="{ active: module.cutoffActive, inactive: !module.cutoffActive }">
                {{ module.cutoffActive ? 'ACTIVE' : 'STANDBY' }}
              </span>
            </div>

            <div v-if="module.cutoffActive" class="module-details">
              <div class="detail-row">
                <span class="detail-label">Triggered By:</span>
                <span class="detail-value" :class="{ 'manual-trigger': module.triggeredBy === 'manual' }">
                  {{ module.triggeredBy === 'manual' ? 'Manual Override' : module.triggeredBy || 'Automatic' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Activated At:</span>
                <span class="detail-value">{{ formatTime(module.lastTriggeredAt) }}</span>
              </div>
            </div>

            <div class="module-actions">
              <button
                class="btn-small"
                :class="module.cutoffActive ? 'btn-danger' : 'btn-success'"
                @click="toggleCutoff(module)"
              >
                <svg v-if="module.cutoffActive" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                {{ module.cutoffActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const cutoffModules = ref([])
const regularModules = ref([])
const mappings = ref([])
const allModules = ref([])

const newMapping = ref({
  sourceModuleUmid: '',
  cutoffModuleUmid: ''
})

const activeCutoffs = computed(() => {
  return cutoffModules.value.filter(m => m.cutoffActive).length
})

const enrichedMappings = computed(() => {
  return mappings.value.map(mapping => {
    const sourceModule = allModules.value.find(m => m.umid === mapping.sourceModuleUmid)
    const cutoffModule = cutoffModules.value.find(m => m.umid === mapping.cutoffModuleUmid)
    return {
      ...mapping,
      sourceModule,
      cutoffModule
    }
  })
})

const fetchData = async () => {
  try {
    // Fetch all modules
    const modulesRes = await fetch('/api/modules')
    const modulesData = await modulesRes.json()

    if (modulesData.success) {
      allModules.value = modulesData.modules
      cutoffModules.value = modulesData.modules.filter(m => m.isCutoffModule)
      regularModules.value = modulesData.modules.filter(m => !m.isCutoffModule)
    }

    // Fetch mappings
    const mappingsRes = await fetch('/api/module-mapping')
    const mappingsData = await mappingsRes.json()

    if (mappingsData.success) {
      mappings.value = mappingsData.mappings
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const addMapping = async () => {
  try {
    const response = await fetch('/api/module-mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceModuleUmid: newMapping.value.sourceModuleUmid,
        cutoffModuleUmid: newMapping.value.cutoffModuleUmid,
        action: 'add'
      })
    })

    const data = await response.json()

    if (data.success) {
      mappings.value = data.mappings
      newMapping.value = { sourceModuleUmid: '', cutoffModuleUmid: '' }
    }
  } catch (error) {
    console.error('Error adding mapping:', error)
  }
}

const removeMapping = async (sourceModuleUmid) => {
  if (!confirm('Remove this mapping?')) return

  try {
    const response = await fetch('/api/module-mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceModuleUmid,
        action: 'remove'
      })
    })

    const data = await response.json()

    if (data.success) {
      mappings.value = data.mappings
    }
  } catch (error) {
    console.error('Error removing mapping:', error)
  }
}

const toggleCutoff = async (module) => {
  const action = module.cutoffActive ? 'deactivate' : 'activate'

  try {
    const response = await fetch('/api/cutoff-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cutoffModuleUmid: module.umid,
        action,
        triggeredBy: 'manual'
      })
    })

    const data = await response.json()

    if (data.success) {
      await fetchData()
    }
  } catch (error) {
    console.error('Error toggling cutoff:', error)
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const formatModuleType = (type) => {
  if (!type) return 'Unknown'
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const refreshData = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
  // Auto-refresh every 5 seconds
  setInterval(fetchData, 5000)
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: var(--text-secondary);
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #374151;
  color: #6b7280;
}

.info-banner {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid #ffffff;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  color: #e5e7eb;
}

.info-banner svg {
  flex-shrink: 0;
  color: #ffffff;
  margin-top: 0.125rem;
}

.info-banner strong {
  color: #ffffff;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.stat-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.card {
  margin-bottom: 2rem;
}

.card:last-child {
  margin-bottom: 0;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: 1rem;
}

.empty-state.small {
  padding: 2rem 1rem;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-item {
  padding: 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.module-item.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(16, 185, 129, 0.2);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2), 0 4px 16px rgba(16, 185, 129, 0.3);
  }
}

.module-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.module-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border-radius: 0.5rem;
  border: 2px solid var(--border);
}

.module-icon.active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.module-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary);
}

.module-icon.active svg {
  color: #10b981;
}

.module-info {
  flex: 1;
}

.module-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.module-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.inactive {
  background: var(--surface);
  color: var(--text-secondary);
}

.module-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  background: rgba(16, 185, 129, 0.03);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.813rem;
  margin-bottom: 0.5rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.manual-trigger {
  color: #f59e0b !important;
  font-weight: 600;
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

.module-actions {
  margin-top: 1rem;
}

.btn-small {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.btn-success:hover {
  background: rgba(16, 185, 129, 0.2);
}

.btn-danger {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.btn-danger:hover {
  background: rgba(220, 38, 38, 0.2);
}

.mapping-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: end;
  padding: 1.5rem;
  background: var(--bg);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.form-group select {
  padding: 0.625rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  width: 100%;
  max-width: 100%;
}

.arrow-icon {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.mappings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mapping-item {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  position: relative;
}

.mapping-source,
.mapping-target {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 180px;
  max-width: 100%;
}

.mapping-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.mapping-module {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
}

.mapping-module span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mapping-module svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.mapping-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mapping-arrow {
  color: var(--accent);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.625rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.mini-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.btn-remove {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  align-self: flex-start;
}

.btn-remove svg {
  width: 16px;
  height: 16px;
}

.btn-remove:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: #dc2626;
  color: #dc2626;
}

@media (max-width: 1024px) {
  .arrow-icon {
    transform: rotate(90deg);
  }

  .mapping-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .mapping-source,
  .mapping-target {
    width: 100%;
    max-width: 100%;
  }

  .btn-remove {
    align-self: flex-end;
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .form-group {
    min-width: 100%;
    max-width: 100%;
  }

  .mapping-form {
    padding: 1rem;
  }
}
</style>
