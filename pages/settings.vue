<template>
  <NuxtLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your ClusterFox server</p>
        </div>
        <button class="btn-primary" @click="saveAllSettings" :disabled="saving">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {{ saving ? 'Saving...' : 'Save All Settings' }}
        </button>
      </div>

      <div v-if="saveSuccess" class="success-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        ✅ Settings saved successfully to server/data/settings.json!
      </div>

      <div class="info-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        All settings are stored in <code>server/data/settings.json</code> (single source of truth)
      </div>

    <div class="settings-grid">
      <div class="card">
        <h2 class="section-title">Data Management</h2>
        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-label">
              <span>Maximum Sensor Readings</span>
              <small>How many sensor data entries to keep in history before deleting old ones</small>
            </div>
            <div class="input-with-unit">
              <input type="number" v-model.number="settingsStore.dataRetention" class="setting-input" min="100" step="100" />
              <span class="unit">readings</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span>Dashboard Refresh Rate</span>
              <small>How often the dashboard automatically updates with new data</small>
            </div>
            <div class="input-with-unit">
              <input type="number" v-model.number="settingsStore.refreshInterval" class="setting-input" min="1" max="60" />
              <span class="unit">seconds</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Module Status Thresholds</h2>
        <p class="section-description">Control when modules are marked as Online, Inactive, or Offline based on last communication time</p>
        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-label">
              <span>Online Status Timeout</span>
              <small>Module shows as <strong>Online</strong> if last seen within this time</small>
            </div>
            <div class="input-with-unit">
              <input type="number" v-model.number="settingsStore.moduleActiveThreshold" class="setting-input" min="5" max="300" />
              <span class="unit">seconds</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span>Inactive Status Timeout</span>
              <small>Module shows as <strong>Inactive</strong> if not seen for this long</small>
            </div>
            <div class="input-with-unit">
              <input type="number" v-model.number="settingsStore.moduleInactiveThreshold" class="setting-input" min="30" max="7200" />
              <span class="unit">seconds</span>
            </div>
          </div>

          <div class="status-explanation">
            <div class="status-flow">
              <div class="status-step">
                <div class="status-dot online"></div>
                <div>
                  <strong>Online</strong>
                  <span>&lt; {{ settingsStore.moduleActiveThreshold }}s</span>
                </div>
              </div>
              <div class="arrow">→</div>
              <div class="status-step">
                <div class="status-dot inactive"></div>
                <div>
                  <strong>Inactive</strong>
                  <span>{{ settingsStore.moduleActiveThreshold }}s - {{ settingsStore.moduleInactiveThreshold }}s</span>
                </div>
              </div>
              <div class="arrow">→</div>
              <div class="status-step">
                <div class="status-dot offline"></div>
                <div>
                  <strong>Offline</strong>
                  <span>&gt; {{ settingsStore.moduleInactiveThreshold }}s</span>
                </div>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="setting-item">
            <div class="setting-label">
              <span>Module Session Duration</span>
              <small>How long a module connection session stays valid before requiring re-registration</small>
            </div>
            <div class="input-with-unit">
              <input type="number" v-model.number="settingsStore.sessionTimeout" class="setting-input" min="1" max="168" />
              <span class="unit">hours</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span>Legacy Inactive Threshold</span>
              <small>Old threshold setting (kept for compatibility, use Online/Inactive timeouts above instead)</small>
            </div>
            <div class="input-with-unit">
              <input type="number" v-model.number="settingsStore.inactiveThreshold" class="setting-input" min="1" max="60" />
              <span class="unit">minutes</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="setting-item checkbox-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="settingsStore.enableNotifications" />
              <div>
                <span>Enable Notifications</span>
                <small>Show browser notifications for critical system events and module status changes</small>
              </div>
            </label>
          </div>

          <div class="setting-item checkbox-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="settingsStore.enableAutoRefresh" />
              <div>
                <span>Enable Auto-Refresh</span>
                <small>Automatically fetch latest data at the interval specified above</small>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Emergency Alert System</h2>
        <p class="section-description">Configure warnings when sensor values exceed safe thresholds</p>
        <div class="setting-group">
          <div class="setting-item checkbox-item">
            <label class="checkbox-label highlight">
              <input type="checkbox" v-model="settingsStore.enableEmergencyTriggers" />
              <div>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Enable Emergency Threshold Monitoring
                </span>
                <small>Activates emergency status when sensor readings exceed configured thresholds (e.g., temperature too high)</small>
              </div>
            </label>
          </div>

          <div class="setting-item checkbox-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="settingsStore.enableAudioAlerts" :disabled="!settingsStore.enableEmergencyTriggers" />
              <div>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                  Play Warning Sound
                </span>
                <small>Plays an audible alert when emergency conditions are detected (requires Emergency Monitoring enabled)</small>
              </div>
            </label>
          </div>

          <div class="setting-item" v-if="settingsStore.enableAudioAlerts">
            <button
              class="btn-test-audio"
              @click="toggleTestAudio"
              :disabled="!settingsStore.enableEmergencyTriggers"
            >
              <svg v-if="!isPlayingTest" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
              {{ isPlayingTest ? 'Stop Test Audio' : 'Test Warning Sound' }}
            </button>
          </div>

          <div class="info-note">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <strong>How Emergency Triggers Work</strong>
              <p>Each module can set its own threshold values (e.g., "alert if temperature > 40°C"). When a sensor reading exceeds these thresholds, the module's status changes to "EMERGENCY" and optionally plays a warning sound. Configure individual thresholds on the <strong>Modules</strong> page.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">API Endpoints</h2>
        <div class="endpoint-list">
          <div class="endpoint-item">
            <span class="method get">GET</span>
            <code>/api/register</code>
            <span class="endpoint-desc">Register modules</span>
          </div>
          <div class="endpoint-item">
            <span class="method get">GET</span>
            <code>/api/modules</code>
            <span class="endpoint-desc">List modules</span>
          </div>
          <div class="endpoint-item">
            <span class="method get">GET</span>
            <code>/api/pool</code>
            <span class="endpoint-desc">Submit sensor data</span>
          </div>
          <div class="endpoint-item">
            <span class="method get">GET</span>
            <code>/api/sensor-data</code>
            <span class="endpoint-desc">Retrieve sensor data</span>
          </div>
          <div class="endpoint-item">
            <span class="method post">POST</span>
            <code>/api/reset</code>
            <span class="endpoint-desc">Reset database</span>
          </div>
        </div>

        <div class="api-actions">
          <button class="btn-secondary" @click="viewDocs">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            View Full API Documentation
          </button>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title danger">Danger Zone</h2>
        <div class="danger-actions">
          <div class="danger-item">
            <div>
              <h3>Reset Database</h3>
              <p>Delete all modules and sensor data permanently</p>
            </div>
            <button class="btn-danger" @click="resetDatabase">Reset Database</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useRouter } from 'vue-router'

const settingsStore = useSettingsStore()
const router = useRouter()
const saving = ref(false)
const saveSuccess = ref(false)
const isPlayingTest = ref(false)
let testAudio = null

// Load settings from store on mount
onMounted(async () => {
  await settingsStore.loadSettings()
})

const toggleTestAudio = () => {
  if (isPlayingTest.value) {
    // Stop audio
    if (testAudio) {
      testAudio.pause()
      testAudio.currentTime = 0
      testAudio = null
    }
    isPlayingTest.value = false
  } else {
    // Play audio
    try {
      testAudio = new Audio('/warning.mp3')
      testAudio.play()
      isPlayingTest.value = true

      testAudio.onended = () => {
        isPlayingTest.value = false
        testAudio = null
      }

      testAudio.onerror = () => {
        alert('⚠️ Warning audio file not found. Please add warning.mp3 to the /public folder.')
        isPlayingTest.value = false
        testAudio = null
      }
    } catch (error) {
      console.error('Error playing test audio:', error)
      isPlayingTest.value = false
    }
  }
}

const saveAllSettings = async () => {
  saving.value = true
  const success = await settingsStore.saveSettings()

  setTimeout(() => {
    saving.value = false
    if (success) {
      saveSuccess.value = true
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    }
  }, 500)
}

const viewDocs = () => {
  router.push('/api-docs')
}

const resetDatabase = async () => {
  if (!confirm('⚠️ Are you sure you want to reset the entire database? This will delete all modules and sensor data. This action cannot be undone!')) {
    return
  }

  try {
    const response = await fetch('/api/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (data.success) {
      alert('✅ Database reset successfully!')
      router.push('/')
    } else {
      alert('❌ Failed to reset database: ' + data.message)
    }
  } catch (error) {
    console.error('Error resetting database:', error)
    alert('❌ Error resetting database: ' + error.message)
  }
}
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-header p {
  font-size: 0.938rem;
  color: var(--text-secondary);
  margin: 0;
}

.success-message {
  padding: 1rem 1.25rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: var(--success);
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  animation: slideInDown 0.3s ease;
}

.info-message {
  padding: 1rem 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #60a5fa;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-message code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.813rem;
  color: var(--accent);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  animation: fadeInScale 0.4s ease;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.section-title.danger {
  color: #ef4444;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.setting-label {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.setting-label span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-label small {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.setting-input {
  width: 120px;
  padding: 0.5rem 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.setting-input:focus {
  outline: none;
  border-color: var(--accent);
}

.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.endpoint-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 6px;
  font-size: 0.813rem;
}

.method {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.688rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.method.get {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.method.post {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.endpoint-item code {
  font-family: 'Monaco', 'Courier New', monospace;
  color: var(--text-primary);
  flex: 1;
}

.endpoint-desc {
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.card-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.btn-primary {
  padding: 0.75rem 1.25rem;
  background: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 6px;
  color: var(--bg);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: transparent;
  color: var(--accent);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.api-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--surface);
  transform: translateY(-1px);
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}

.danger-item h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.danger-item p {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.btn-danger {
  padding: 0.625rem 1rem;
  background: #ef4444;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: var(--accent);
  flex-shrink: 0;
}

.checkbox-label input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label > div {
  flex: 1;
  min-width: 0;
}

.checkbox-label span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
}

.checkbox-label span svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.checkbox-label.highlight span {
  color: #dc2626;
}

.checkbox-label small {
  display: block;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.info-note {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
}

.info-note svg {
  flex-shrink: 0;
  color: #3b82f6;
  margin-top: 0.125rem;
}

.info-note strong {
  font-size: 0.875rem;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.info-note p {
  font-size: 0.813rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.btn-test-audio {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.75rem;
  margin-left: 2.25rem;
}

.btn-test-audio:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.btn-test-audio:active:not(:disabled) {
  transform: translateY(0);
}

.btn-test-audio:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-test-audio svg {
  width: 16px;
  height: 16px;
}

.section-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: -0.5rem 0 1.5rem 0;
  line-height: 1.5;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-with-unit .setting-input {
  flex: 1;
  max-width: 150px;
}

.input-with-unit .unit {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
  padding-left: 0.5rem;
  border-left: 2px solid var(--border);
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 1.5rem 0;
}

.status-explanation {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}

.status-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 140px;
}

.status-step > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-step strong {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.status-step span {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.status-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
}

.status-dot.inactive {
  background: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
}

.status-dot.offline {
  background: #ef4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
}

.arrow {
  color: var(--text-tertiary);
  font-size: 1.25rem;
  flex-shrink: 0;
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

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .setting-input {
    width: 100%;
  }

  .save-section {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .btn-large {
    width: 100%;
  }
}
</style>
