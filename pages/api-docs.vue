<template>
  <NuxtLayout>
    <div class="api-docs-container">
      <div class="page-header">
        <h1>API Documentation</h1>
        <p>Complete API reference with endpoints, status badges, and code examples</p>
      </div>

      <div class="nav-tabs">
        <button @click="activeTab = 'endpoints'" :class="{ active: activeTab === 'endpoints' }">
          API Endpoints
        </button>
        <button @click="activeTab = 'status'" :class="{ active: activeTab === 'status' }">
          Status Badges
        </button>
        <button @click="activeTab = 'examples'" :class="{ active: activeTab === 'examples' }">
          Examples
        </button>
      </div>

      <!-- Endpoints Tab -->
      <div v-if="activeTab === 'endpoints'" class="tab-content">
        <div class="api-section" v-for="section in apiSections" :key="section.title">
          <h2>{{ section.title }}</h2>
          <div v-for="endpoint in section.endpoints" :key="endpoint.path" class="endpoint">
            <div class="endpoint-header">
              <span :class="'method ' + endpoint.method">{{ endpoint.method }}</span>
              <span class="path">{{ endpoint.path }}</span>
            </div>
            <p>{{ endpoint.description }}</p>
          </div>
        </div>
      </div>

      <!-- Status Tab -->
      <div v-if="activeTab === 'status'" class="tab-content">
        <div class="status-section">
          <h2>System Status</h2>
          <div class="status-grid">
            <div class="status-item">
              <span class="badge healthy">● Healthy</span>
              <p>All modules online (100%)</p>
            </div>
            <div class="status-item">
              <span class="badge warning">● Degraded</span>
              <p>Some modules offline (1-99%)</p>
            </div>
            <div class="status-item">
              <span class="badge critical">● Critical</span>
              <p>No modules online (0%)</p>
            </div>
          </div>
        </div>

        <div class="status-section">
          <h2>Module Status</h2>
          <div class="status-grid">
            <div class="status-item">
              <span class="badge healthy">● Online</span>
              <p>Last seen < 30s</p>
            </div>
            <div class="status-item">
              <span class="badge warning">● Inactive</span>
              <p>Last seen 30-60s</p>
            </div>
            <div class="status-item">
              <span class="badge critical">● Offline</span>
              <p>Last seen > 60s</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Examples Tab -->
      <div v-if="activeTab === 'examples'" class="tab-content">
        <div class="example-section">
          <h2>Arduino/ESP32</h2>
          <pre><code>{{ arduinoExample }}</code></pre>
        </div>
        <div class="example-section">
          <h2>JavaScript</h2>
          <pre><code>{{ jsExample }}</code></pre>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('endpoints')

const apiSections = [
  {
    title: 'Module Management',
    endpoints: [
      { method: 'GET', path: '/api/register', description: 'Register new module or get existing session' },
      { method: 'GET', path: '/api/modules', description: 'Get all registered modules with status' },
      { method: 'PUT', path: '/api/modules', description: 'Update module triggers and configuration' },
      { method: 'POST', path: '/api/module-delete', description: 'Delete a module from the system' }
    ]
  },
  {
    title: 'Sensor Data',
    endpoints: [
      { method: 'POST', path: '/api/pool', description: 'Submit sensor readings from module' },
      { method: 'GET', path: '/api/sensor-data', description: 'Retrieve sensor readings with filters' },
      { method: 'GET', path: '/api/pool', description: 'Get pool statistics and recent activity' }
    ]
  },
  {
    title: 'Emergency System',
    endpoints: [
      { method: 'POST', path: '/api/emergency-tracker', description: 'Check modules for emergency conditions' },
      { method: 'GET', path: '/api/emergency-history', description: 'Get emergency history and current status' }
    ]
  },
  {
    title: 'System Status',
    endpoints: [
      { method: 'GET', path: '/api/uptime', description: 'Get server uptime information' },
      { method: 'GET', path: '/api/module-performance', description: 'Get performance metrics and rankings' },
      { method: 'GET', path: '/api/trigger-stats', description: 'Get statistics about configured triggers' }
    ]
  },
  {
    title: 'Settings',
    endpoints: [
      { method: 'GET', path: '/api/settings', description: 'Retrieve system configuration' },
      { method: 'POST', path: '/api/settings', description: 'Update system configuration' }
    ]
  }
]

const arduinoExample = `#include <WiFi.h>
#include <HTTPClient.h>

const char* server = "http://192.168.1.100:3000";
String sessionId = "";

void setup() {
  // Register module
  String url = String(server) + "/api/register?type=temp-sensor&umid=ESP32-001";
  HTTPClient http;
  http.begin(url);
  int code = http.GET();
  // Parse sessionId from response
}

void loop() {
  float temp = readTemperature();
  
  // Send data
  HTTPClient http;
  http.begin(String(server) + "/api/pool");
  http.addHeader("Content-Type", "application/json");
  String payload = "{\\"session_id\\":\\"" + sessionId + "\\",\\"data\\":{\\"temp\\":" + String(temp) + "}}";
  http.POST(payload);
  delay(5000);
}`

const jsExample = `// Fetch dashboard stats
async function getStats() {
  const [modules, sensors] = await Promise.all([
    fetch('/api/modules?_t=' + Date.now()),
    fetch('/api/sensor-data?limit=100')
  ]);
  return {
    modules: await modules.json(),
    sensors: await sensors.json()
  };
}

// Check emergencies
async function checkEmergency() {
  await fetch('/api/emergency-tracker', { method: 'POST' });
  const res = await fetch('/api/emergency-history');
  const data = await res.json();
  return data.current.isActive;
}`
</script>

<style scoped>
.api-docs-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--text-secondary);
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
  margin: 2rem 0;
  background: var(--surface);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.nav-tabs button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tabs button:hover {
  background: rgba(59, 130, 246, 0.1);
}

.nav-tabs button.active {
  background: var(--primary);
  color: white;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.api-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.api-section h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.endpoint {
  padding: 1rem;
  background: var(--bg);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.endpoint:last-child {
  margin-bottom: 0;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.method {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.method.GET {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.method.POST {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.method.PUT {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.path {
  font-family: monospace;
  color: var(--text-primary);
  font-weight: 500;
}

.endpoint p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.status-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.status-section h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.status-item {
  padding: 1rem;
  background: var(--bg);
  border-radius: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.badge.healthy {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid #10b981;
}

.badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid #f59e0b;
}

.badge.critical {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.status-item p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.example-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.example-section h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

pre {
  background: var(--bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', monospace;
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
