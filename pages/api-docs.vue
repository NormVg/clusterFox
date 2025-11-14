<template>
  <NuxtLayout>
    <div class="api-docs-container">
      <div class="page-header">
        <h1>API Documentation</h1>
        <p>Complete API reference for IoT module management, sensor data collection, and emergency systems</p>
      </div>

      <div class="nav-tabs">
        <button @click="activeTab = 'overview'" :class="{ active: activeTab === 'overview' }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>Overview</span>
        </button>
        <button @click="activeTab = 'endpoints'" :class="{ active: activeTab === 'endpoints' }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span>API Endpoints</span>
        </button>
        <button @click="activeTab = 'data-flow'" :class="{ active: activeTab === 'data-flow' }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span>Data Flow</span>
        </button>
        <button @click="activeTab = 'examples'" :class="{ active: activeTab === 'examples' }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          <span>Code Examples</span>
        </button>
        <button @click="activeTab = 'status'" :class="{ active: activeTab === 'status' }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Status Codes</span>
        </button>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="overview-section">
          <h2>System Architecture</h2>
          <div class="architecture-grid">
            <div class="arch-item">
              <h3>IoT Modules</h3>
              <p>Arduino/ESP32 devices with sensors that register and send data</p>
              <ul>
                <li>Auto-registration with unique session IDs</li>
                <li>Continuous sensor data transmission</li>
                <li>Emergency threshold monitoring</li>
                <li>Cutoff module automation</li>
              </ul>
            </div>
            <div class="arch-item">
              <h3>Dashboard</h3>
              <p>Nuxt 3 web application for monitoring and management</p>
              <ul>
                <li>Real-time module status</li>
                <li>Sensor data visualization</li>
                <li>Emergency alert system</li>
                <li>AI-powered insights</li>
              </ul>
            </div>
            <div class="arch-item">
              <h3>Data Storage</h3>
              <p>File-based JSON storage for modules and sensor data</p>
              <ul>
                <li>modules.json - Module registry</li>
                <li>sensor-data.json - Sensor readings</li>
                <li>emergency-history.json - Emergency logs</li>
                <li>settings.json - System configuration</li>
              </ul>
            </div>
            <div class="arch-item">
              <h3>AI Integration</h3>
              <p>Google Gemini AI for insights and anomaly detection</p>
              <ul>
                <li>Automated insights generation</li>
                <li>Anomaly detection</li>
                <li>Performance recommendations</li>
                <li>Token usage management</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="overview-section">
          <h2>Data Flow Process</h2>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Module Registration</h4>
                <p>IoT modules register via <code>GET /api/register</code> with UMID and type, receive session ID</p>
              </div>
            </div>
            <div class="flow-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Data Transmission</h4>
                <p>Modules send sensor data via <code>POST /api/pool</code> using session ID for authentication</p>
              </div>
            </div>
            <div class="flow-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Emergency Detection</h4>
                <p>System checks thresholds, triggers alerts, and activates cutoff modules automatically</p>
              </div>
            </div>
            <div class="flow-step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Dashboard Updates</h4>
                <p>Web interface polls APIs for real-time updates, displays charts and status indicators</p>
              </div>
            </div>
          </div>
        </div>

        <div class="overview-section">
          <h2>Authentication & Security</h2>
          <div class="security-grid">
            <div class="security-item">
              <h4>Session-Based Auth</h4>
              <p>Each module receives a unique 64-character hex session ID for API authentication</p>
            </div>
            <div class="security-item">
              <h4>UMID Validation</h4>
              <p>Unique Module IDs prevent conflicts and ensure data integrity</p>
            </div>
            <div class="security-item">
              <h4>Rate Limiting</h4>
              <p>AI endpoints have token-based rate limiting to prevent abuse</p>
            </div>
            <div class="security-item">
              <h4>Data Retention</h4>
              <p>Automatic cleanup keeps last 10,000 sensor readings to manage storage</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Endpoints Tab -->
      <div v-if="activeTab === 'endpoints'" class="tab-content">
        <div class="api-section" v-for="section in apiSections" :key="section.title">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="section.icon"></svg>
            {{ section.title }}
          </h2>
          <div v-for="endpoint in section.endpoints" :key="endpoint.path" class="endpoint">
            <div class="endpoint-header">
              <span :class="'method ' + endpoint.method">{{ endpoint.method }}</span>
              <span class="path">{{ endpoint.path }}</span>
              <span v-if="endpoint.auth" class="auth-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Auth Required
              </span>
            </div>
            <p class="endpoint-description">{{ endpoint.description }}</p>

            <!-- Parameters -->
            <div v-if="endpoint.params" class="endpoint-params">
              <h4>Parameters:</h4>
              <div class="param-list">
                <div v-for="param in endpoint.params" :key="param.name" class="param">
                  <code>{{ param.name }}</code>
                  <span class="param-type">{{ param.type }}</span>
                  <span v-if="param.required" class="required">Required</span>
                  <p>{{ param.description }}</p>
                </div>
              </div>
            </div>

            <!-- Response -->
            <div v-if="endpoint.response" class="endpoint-response">
              <h4>Response:</h4>
              <pre><code>{{ endpoint.response }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Flow Tab -->
      <div v-if="activeTab === 'data-flow'" class="tab-content">
        <div class="flow-section">
          <h2>IoT Module → Server Flow</h2>
          <div class="flow-diagram">
            <div class="flow-box module">
              <h3>IoT Module</h3>
              <p>Arduino/ESP32</p>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-box api">
              <h3>Registration API</h3>
              <p>GET /api/register</p>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-box server">
              <h3>Server</h3>
              <p>Session ID Generated</p>
            </div>
          </div>

          <div class="flow-diagram">
            <div class="flow-box module">
              <h3>Sensor Data</h3>
              <p>Temperature, Humidity, etc.</p>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-box api">
              <h3>Data API</h3>
              <p>POST /api/pool</p>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-box storage">
              <h3>Storage</h3>
              <p>sensor-data.json</p>
            </div>
          </div>
        </div>

        <div class="flow-section">
          <h2>Emergency Detection Flow</h2>
          <div class="emergency-flow">
            <div class="emergency-step">
              <h4>1. Threshold Check</h4>
              <p>System compares latest sensor values against configured thresholds</p>
              <code>temperature > 35°C → EMERGENCY</code>
            </div>
            <div class="emergency-step">
              <h4>2. Emergency Triggered</h4>
              <p>Module status changes to "emergency", audio alerts activated</p>
              <code>status: "emergency", isEmergency: true</code>
            </div>
            <div class="emergency-step">
              <h4>3. Cutoff Activation</h4>
              <p>Mapped cutoff modules automatically activated for safety</p>
              <code>cutoffActive: true, triggeredBy: "sensor-001"</code>
            </div>
            <div class="emergency-step">
              <h4>4. Dashboard Alerts</h4>
              <p>Real-time updates, audio warnings, visual indicators</p>
              <code>Emergency Alert Playing</code>
            </div>
          </div>
        </div>

        <div class="flow-section">
          <h2>Dashboard Update Cycle</h2>
          <div class="dashboard-cycle">
            <div class="cycle-item">
              <h4>Every 2 seconds</h4>
              <ul>
                <li>Emergency status check</li>
                <li>Audio alert management</li>
                <li>Module status updates</li>
              </ul>
            </div>
            <div class="cycle-item">
              <h4>Every 10 seconds</h4>
              <ul>
                <li>Dashboard statistics</li>
                <li>Chart data refresh</li>
                <li>Performance metrics</li>
              </ul>
            </div>
            <div class="cycle-item">
              <h4>On Demand</h4>
              <ul>
                <li>AI insights generation</li>
                <li>Settings updates</li>
                <li>Manual data refresh</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Examples Tab -->
      <div v-if="activeTab === 'examples'" class="tab-content">
        <div class="example-section">
          <h2>Arduino/ESP32 Module Code</h2>
          <div class="code-tabs">
            <button @click="codeTab = 'registration'" :class="{ active: codeTab === 'registration' }">Registration</button>
            <button @click="codeTab = 'data-sending'" :class="{ active: codeTab === 'data-sending' }">Data Sending</button>
            <button @click="codeTab = 'complete'" :class="{ active: codeTab === 'complete' }">Complete Example</button>
          </div>

          <div v-if="codeTab === 'registration'">
            <pre><code>{{ registrationExample }}</code></pre>
          </div>
          <div v-if="codeTab === 'data-sending'">
            <pre><code>{{ dataSendingExample }}</code></pre>
          </div>
          <div v-if="codeTab === 'complete'">
            <pre><code>{{ completeArduinoExample }}</code></pre>
          </div>
        </div>

        <div class="example-section">
          <h2>JavaScript/Web Client</h2>
          <div class="code-tabs">
            <button @click="jsCodeTab = 'dashboard'" :class="{ active: jsCodeTab === 'dashboard' }">Dashboard Data</button>
            <button @click="jsCodeTab = 'emergency'" :class="{ active: jsCodeTab === 'emergency' }">Emergency Check</button>
            <button @click="jsCodeTab = 'settings'" :class="{ active: jsCodeTab === 'settings' }">Settings API</button>
          </div>

          <div v-if="jsCodeTab === 'dashboard'">
            <pre><code>{{ dashboardExample }}</code></pre>
          </div>
          <div v-if="jsCodeTab === 'emergency'">
            <pre><code>{{ emergencyExample }}</code></pre>
          </div>
          <div v-if="jsCodeTab === 'settings'">
            <pre><code>{{ settingsExample }}</code></pre>
          </div>
        </div>

        <div class="example-section">
          <h2>Python Simulator</h2>
          <pre><code>{{ pythonExample }}</code></pre>
        </div>

        <div class="example-section">
          <h2>cURL Commands</h2>
          <div class="curl-examples">
            <div class="curl-example">
              <h4>Register Module</h4>
              <pre><code>{{ curlRegister }}</code></pre>
            </div>
            <div class="curl-example">
              <h4>Send Sensor Data</h4>
              <pre><code>{{ curlSendData }}</code></pre>
            </div>
            <div class="curl-example">
              <h4>Get Module Status</h4>
              <pre><code>{{ curlGetModules }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Tab -->
      <div v-if="activeTab === 'status'" class="tab-content">
        <div class="status-section">
          <h2>System Health Status</h2>
          <div class="status-grid">
            <div class="status-item">
              <span class="badge healthy">● Healthy</span>
              <p>All modules online and responding</p>
              <small>100% modules active within 5 minutes</small>
            </div>
            <div class="status-item">
              <span class="badge warning">● Degraded</span>
              <p>Some modules offline or inactive</p>
              <small>1-99% modules active</small>
            </div>
            <div class="status-item">
              <span class="badge critical">● Critical</span>
              <p>No modules responding</p>
              <small>0% modules active</small>
            </div>
          </div>
        </div>

        <div class="status-section">
          <h2>Module Status Indicators</h2>
          <div class="status-grid">
            <div class="status-item">
              <span class="badge healthy">● Active</span>
              <p>Last seen within active threshold</p>
              <small>Default: &lt; 5 minutes (300s)</small>
            </div>
            <div class="status-item">
              <span class="badge warning">● Inactive</span>
              <p>Last seen within inactive threshold</p>
              <small>Default: 5 minutes - 1 hour</small>
            </div>
            <div class="status-item">
              <span class="badge critical">● Offline</span>
              <p>Last seen beyond inactive threshold</p>
              <small>Default: &gt; 1 hour (3600s)</small>
            </div>
            <div class="status-item">
              <span class="badge emergency">● Emergency</span>
              <p>Sensor thresholds exceeded</p>
              <small>Triggers audio alerts & cutoffs</small>
            </div>
          </div>
        </div>

        <div class="status-section">
          <h2>HTTP Response Codes</h2>
          <div class="http-codes">
            <div class="code-group">
              <h4>Success (2xx)</h4>
              <div class="code-item">
                <code>200 OK</code>
                <p>Request successful, data returned</p>
              </div>
            </div>
            <div class="code-group">
              <h4>Client Error (4xx)</h4>
              <div class="code-item">
                <code>400 Bad Request</code>
                <p>Missing required parameters</p>
              </div>
              <div class="code-item">
                <code>401 Unauthorized</code>
                <p>Invalid session ID</p>
              </div>
              <div class="code-item">
                <code>404 Not Found</code>
                <p>Module or resource not found</p>
              </div>
              <div class="code-item">
                <code>429 Too Many Requests</code>
                <p>Rate limit exceeded (AI endpoints)</p>
              </div>
            </div>
            <div class="code-group">
              <h4>Server Error (5xx)</h4>
              <div class="code-item">
                <code>500 Internal Server Error</code>
                <p>Database or processing error</p>
              </div>
            </div>
          </div>
        </div>

        <div class="status-section">
          <h2>Error Response Format</h2>
          <pre><code>{
  "success": false,
  "error": "Missing required parameter: session_id",
  "message": "Please provide session ID",
  "code": "MISSING_SESSION_ID"
}</code></pre>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('overview')
const codeTab = ref('registration')
const jsCodeTab = ref('dashboard')

const apiSections = [
  {
    title: 'Module Management',
    icon: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    endpoints: [
      {
        method: 'GET',
        path: '/api/register',
        description: 'Register new IoT module and receive session ID for authentication',
        params: [
          { name: 'type', type: 'string', required: true, description: 'Module type (e.g., "temperature-sensor")' },
          { name: 'umid', type: 'string', required: true, description: 'Unique Module ID (e.g., "ESP32-001")' }
        ],
        response: `{
  "success": true,
  "message": "Module registered successfully",
  "session_id": "a1b2c3d4e5f6...",
  "umid": "ESP32-001",
  "moduleType": "temperature-sensor",
  "status": "new"
}`
      },
      {
        method: 'GET',
        path: '/api/modules',
        description: 'Get all registered modules with real-time status and emergency information',
        params: [
          { name: 'session_id', type: 'string', required: false, description: 'Filter by specific session ID' }
        ],
        response: `{
  "success": true,
  "count": 5,
  "modules": [
    {
      "umid": "ESP32-001",
      "moduleType": "temperature-sensor",
      "status": "active",
      "emergency": { "isEmergency": false },
      "lastSeen": "2025-11-05T10:30:00Z",
      "dataCount": 1250
    }
  ]
}`
      },
      {
        method: 'PUT',
        path: '/api/modules',
        description: 'Update module configuration including emergency thresholds',
        auth: true,
        params: [
          { name: 'umid', type: 'string', required: true, description: 'Module to update' },
          { name: 'triggers', type: 'object', required: false, description: 'Emergency threshold configuration' }
        ]
      },
      {
        method: 'POST',
        path: '/api/module-delete',
        description: 'Remove module from system permanently',
        auth: true
      }
    ]
  },
  {
    title: 'Sensor Data Collection',
    icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    endpoints: [
      {
        method: 'POST',
        path: '/api/pool',
        description: 'Submit sensor readings from IoT modules (primary data ingestion endpoint)',
        auth: true,
        params: [
          { name: 'session_id', type: 'string', required: true, description: 'Module session ID from registration' },
          { name: 'umid', type: 'string', required: true, description: 'Module unique identifier' },
          { name: 'data', type: 'object', required: true, description: 'Sensor readings (temperature, humidity, etc.)' }
        ],
        response: `{
  "success": true,
  "message": "Sensor data stored successfully",
  "dataPoint": {
    "umid": "ESP32-001",
    "data": { "temperature": 25.5, "humidity": 60 },
    "timestamp": "2025-11-05T10:30:00Z"
  }
}`
      },
      {
        method: 'GET',
        path: '/api/pool',
        description: 'Legacy endpoint for sensor data submission via query parameters',
        auth: true,
        params: [
          { name: 'session_id', type: 'string', required: true, description: 'Module session ID' },
          { name: '*', type: 'any', required: true, description: 'Sensor data as query parameters' }
        ]
      },
      {
        method: 'GET',
        path: '/api/sensor-data',
        description: 'Retrieve stored sensor readings with filtering and pagination',
        params: [
          { name: 'session_id', type: 'string', required: false, description: 'Filter by module session' },
          { name: 'limit', type: 'integer', required: false, description: 'Max records to return (default: 100)' }
        ],
        response: `{
  "success": true,
  "count": 50,
  "total": 1250,
  "data": [
    {
      "umid": "ESP32-001",
      "data": { "temperature": 25.5 },
      "timestamp": "2025-11-05T10:30:00Z"
    }
  ]
}`
      }
    ]
  },
  {
    title: 'Emergency & Safety System',
    icon: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    endpoints: [
      {
        method: 'POST',
        path: '/api/emergency-tracker',
        description: 'Trigger emergency detection check across all modules'
      },
      {
        method: 'GET',
        path: '/api/emergency-history',
        description: 'Get emergency event history and current emergency status',
        response: `{
  "success": true,
  "current": {
    "isActive": true,
    "count": 2,
    "modules": ["ESP32-001", "ESP32-003"]
  },
  "history": [...]
}`
      },
      {
        method: 'GET',
        path: '/api/cutoff-modules',
        description: 'Get all cutoff/relay modules for emergency automation'
      },
      {
        method: 'POST',
        path: '/api/cutoff-trigger',
        description: 'Manually activate or deactivate cutoff modules'
      },
      {
        method: 'GET',
        path: '/api/module-mapping',
        description: 'Get sensor-to-cutoff module mappings'
      },
      {
        method: 'POST',
        path: '/api/module-mapping',
        description: 'Create or remove sensor-to-cutoff mappings'
      }
    ]
  },
  {
    title: 'AI & Analytics',
    icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    endpoints: [
      {
        method: 'GET',
        path: '/api/ai/insights',
        description: 'Generate AI-powered insights using Google Gemini',
        response: `{
  "success": true,
  "insights": {
    "summary": "Network operating normally...",
    "recommendations": ["Consider adding backup sensors"],
    "criticalIssues": [],
    "opportunities": ["Optimize data collection intervals"]
  },
  "tokenUsage": 1250
}`
      },
      {
        method: 'GET',
        path: '/api/ai/anomalies',
        description: 'Detect anomalies in sensor data patterns'
      },
      {
        method: 'POST',
        path: '/api/ai/chat',
        description: 'Chat with AI about your IoT network'
      },
      {
        method: 'GET',
        path: '/api/ai/token-usage',
        description: 'Get AI API token usage statistics'
      }
    ]
  },
  {
    title: 'System Monitoring',
    icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    endpoints: [
      {
        method: 'GET',
        path: '/api/uptime',
        description: 'Get server uptime and performance information',
        response: `{
  "success": true,
  "uptime": { "days": 5, "hours": 12, "minutes": 30 },
  "formatted": "5d 12h 30m",
  "startTime": 1730459130000
}`
      },
      {
        method: 'GET',
        path: '/api/module-performance',
        description: 'Get module performance metrics and rankings'
      },
      {
        method: 'GET',
        path: '/api/trigger-stats',
        description: 'Get statistics about configured emergency triggers'
      },
      {
        method: 'GET',
        path: '/api/dashboard-stats',
        description: 'Get aggregated dashboard statistics'
      },
      {
        method: 'GET',
        path: '/api/data-quality',
        description: 'Get data quality metrics and health scores'
      }
    ]
  },
  {
    title: 'Configuration & Logs',
    icon: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>',
    endpoints: [
      {
        method: 'GET',
        path: '/api/settings',
        description: 'Retrieve system configuration and thresholds',
        response: `{
  "success": true,
  "settings": {
    "moduleActiveThreshold": 300,
    "moduleInactiveThreshold": 3600,
    "enableEmergencyTriggers": true,
    "enableAudioAlerts": true
  }
}`
      },
      {
        method: 'POST',
        path: '/api/settings',
        description: 'Update system configuration'
      },
      {
        method: 'GET',
        path: '/api/logs',
        description: 'Get system activity logs with filtering',
        params: [
          { name: 'limit', type: 'integer', required: false, description: 'Max logs to return' },
          { name: 'type', type: 'string', required: false, description: 'Filter by log type' },
          { name: 'offset', type: 'integer', required: false, description: 'Pagination offset' }
        ]
      },
      {
        method: 'POST',
        path: '/api/logs',
        description: 'Create new log entry'
      },
      {
        method: 'DELETE',
        path: '/api/logs',
        description: 'Clear system logs'
      },
      {
        method: 'POST',
        path: '/api/reset',
        description: 'Reset system data (development only)'
      }
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

// Code Examples
const registrationExample = `// Module Registration
String registerModule() {
  String url = BASE_URL + "/api/register?type=" + MODULE_TYPE + "&umid=" + UMID;

  HTTPClient http;
  http.begin(url);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String response = http.getString();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);

    if (doc["success"]) {
      return doc["session_id"].as<String>();
    }
  }

  http.end();
  return "";
}`

const dataSendingExample = `// Send Sensor Data
bool sendSensorData(String sessionId, float temp, float humidity) {
  DynamicJsonDocument doc(512);
  doc["session_id"] = sessionId;
  doc["umid"] = UMID;
  doc["moduleType"] = MODULE_TYPE;

  JsonObject data = doc.createNestedObject("data");
  data["temperature"] = temp;
  data["humidity"] = humidity;

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  http.begin(BASE_URL + "/api/pool");
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(payload);
  http.end();

  return httpCode == 200;
}`

const completeArduinoExample = `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Configuration
const char* WIFI_SSID = "YourWiFi";
const char* WIFI_PASSWORD = "YourPassword";
String BASE_URL = "http://192.168.1.100:3000";
String UMID = "ESP32-DHT11-001";
String MODULE_TYPE = "temperature-humidity";

// Hardware
#define DHT_PIN 4
#define DHT_TYPE DHT11
DHT dht(DHT_PIN, DHT_TYPE);

// Globals
String sessionId = "";
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  // Register module
  sessionId = registerModule();
  if (sessionId.length() > 0) {
    Serial.println("✅ Module registered successfully");
  } else {
    Serial.println("❌ Registration failed");
  }
}

void loop() {
  if (millis() - lastSend >= SEND_INTERVAL) {
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (!isnan(temp) && !isnan(humidity)) {
      if (sendSensorData(sessionId, temp, humidity)) {
        Serial.println("Data sent successfully");
      } else {
        Serial.println("Failed to send data");
      }
    }

    lastSend = millis();
  }

  delay(100);
}`

const dashboardExample = `// Dashboard Data Fetching
class ClusterFoxAPI {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async getModules() {
    const response = await fetch(\`\${this.baseUrl}/api/modules?_t=\${Date.now()}\`);
    return await response.json();
  }

  async getSensorData(limit = 100, sessionId = null) {
    let url = \`\${this.baseUrl}/api/sensor-data?limit=\${limit}\`;
    if (sessionId) url += \`&session_id=\${sessionId}\`;

    const response = await fetch(url);
    return await response.json();
  }

  async getSystemStats() {
    const [modules, uptime, performance] = await Promise.all([
      this.getModules(),
      fetch(\`\${this.baseUrl}/api/uptime\`).then(r => r.json()),
      fetch(\`\${this.baseUrl}/api/module-performance\`).then(r => r.json())
    ]);

    return {
      totalModules: modules.modules?.length || 0,
      activeModules: modules.modules?.filter(m => m.status === 'active').length || 0,
      uptime: uptime.formatted,
      performance: performance.rankings
    };
  }
}

// Usage
const api = new ClusterFoxAPI();
const stats = await api.getSystemStats();
console.log('System Stats:', stats);`

const emergencyExample = `// Emergency Detection & Management
class EmergencyManager {
  constructor() {
    this.isMonitoring = false;
    this.emergencyCallback = null;
  }

  async checkEmergencies() {
    // Trigger emergency detection
    await fetch('/api/emergency-tracker', { method: 'POST' });

    // Get current status
    const response = await fetch('/api/emergency-history');
    const data = await response.json();

    return {
      hasEmergency: data.current.isActive,
      emergencyCount: data.current.count,
      affectedModules: data.current.modules
    };
  }

  startMonitoring(callback, interval = 2000) {
    this.emergencyCallback = callback;
    this.isMonitoring = true;

    const monitor = async () => {
      if (!this.isMonitoring) return;

      try {
        const status = await this.checkEmergencies();
        if (this.emergencyCallback) {
          this.emergencyCallback(status);
        }
      } catch (error) {
        console.error('Emergency check failed:', error);
      }

      setTimeout(monitor, interval);
    };

    monitor();
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }
}

// Usage
const emergencyManager = new EmergencyManager();
emergencyManager.startMonitoring((status) => {
  if (status.hasEmergency) {
    console.log(\`EMERGENCY: \${status.emergencyCount} modules affected\`);
    // Trigger audio alerts, notifications, etc.
  }
});`

const settingsExample = `// Settings Management
class SettingsManager {
  async getSettings() {
    const response = await fetch('/api/settings');
    return await response.json();
  }

  async updateSettings(newSettings) {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    return await response.json();
  }

  async updateThresholds(activeThreshold, inactiveThreshold) {
    return await this.updateSettings({
      moduleActiveThreshold: activeThreshold,    // seconds
      moduleInactiveThreshold: inactiveThreshold // seconds
    });
  }

  async toggleEmergencySystem(enabled) {
    return await this.updateSettings({
      enableEmergencyTriggers: enabled,
      enableAudioAlerts: enabled
    });
  }
}

// Usage
const settings = new SettingsManager();

// Update module thresholds
await settings.updateThresholds(300, 3600); // 5 min active, 1 hour inactive

// Enable emergency system
await settings.toggleEmergencySystem(true);

// Get current settings
const current = await settings.getSettings();
console.log('Current settings:', current.settings);`

const pythonExample = `# Python IoT Module Simulator
import requests
import json
import time
import random

class ClusterFoxModule:
    def __init__(self, base_url, umid, module_type):
        self.base_url = base_url
        self.umid = umid
        self.module_type = module_type
        self.session_id = None

    def register(self):
        """Register module and get session ID"""
        url = f"{self.base_url}/api/register"
        params = {
            'type': self.module_type,
            'umid': self.umid
        }

        response = requests.get(url, params=params)
        data = response.json()

        if data.get('success'):
            self.session_id = data['session_id']
            print(f"✅ Registered: {self.umid}")
            return True
        else:
            print(f"❌ Registration failed: {data.get('error')}")
            return False

    def send_data(self, sensor_data):
        """Send sensor data to server"""
        if not self.session_id:
            return False

        url = f"{self.base_url}/api/pool"
        payload = {
            'session_id': self.session_id,
            'umid': self.umid,
            'moduleType': self.module_type,
            'data': sensor_data
        }

        response = requests.post(url, json=payload)
        return response.status_code == 200

# Usage Example
module = ClusterFoxModule(
    base_url="http://localhost:3000",
    umid="python-temp-001",
    module_type="temperature-sensor"
)

if module.register():
    for i in range(10):
        # Generate realistic sensor data
        data = {
            'temperature': round(random.uniform(20, 30), 2),
            'humidity': round(random.uniform(40, 70), 2)
        }

        if module.send_data(data):
            print(f"Sent: {data}")
        else:
            print("Failed to send data")

        time.sleep(5)`

const curlRegister = `curl -X GET "http://localhost:3000/api/register?type=temperature-sensor&umid=ESP32-001"`

const curlSendData = `curl -X POST "http://localhost:3000/api/pool" \\
  -H "Content-Type: application/json" \\
  -d '{
    "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "umid": "ESP32-001",
    "moduleType": "temperature-sensor",
    "data": {
      "temperature": 25.5,
      "humidity": 60.2
    }
  }'`

const curlGetModules = `curl -X GET "http://localhost:3000/api/modules"`
</script>

<style scoped>
.api-docs-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
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

.nav-tabs {
  display: flex;
  gap: 0.5rem;
  margin: 2rem 0;
  background: var(--surface);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow-x: auto;
}

.nav-tabs button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.nav-tabs button svg {
  flex-shrink: 0;
}

.nav-tabs button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.nav-tabs button.active {
  background: #000000;
  color: #ffffff;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Overview Tab Styles */
.overview-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.overview-section h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.architecture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.arch-item {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.arch-item h3 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
}

.arch-item p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.arch-item ul {
  list-style: none;
  padding: 0;
}

.arch-item li {
  color: var(--text-secondary);
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.arch-item li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--success);
  font-weight: bold;
}

.flow-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.flow-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  background: var(--text-primary);
  color: var(--bg);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.step-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.security-item {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.security-item h4 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.security-item p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* API Endpoints Styles */
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.api-section h2 svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.endpoint {
  padding: 1.5rem;
  background: var(--bg);
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--border);
}

.endpoint:last-child {
  margin-bottom: 0;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
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
  border: 1px solid #10b981;
}

.method.POST {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid #6b7280;
}

.method.PUT {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid #f59e0b;
}

.method.DELETE {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.path {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: var(--text-primary);
  font-weight: 500;
  background: var(--border);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.auth-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid #f59e0b;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.auth-badge svg {
  flex-shrink: 0;
}

.endpoint-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.endpoint-params {
  margin-bottom: 1rem;
}

.endpoint-params h4 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.param-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.param {
  background: var(--surface);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid var(--text-tertiary);
}

.param code {
  background: var(--border);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  color: var(--text-primary);
}

.param-type {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.required {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.param p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.endpoint-response {
  margin-top: 1rem;
}

.endpoint-response h4 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Data Flow Styles */
.flow-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.flow-section h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.flow-box {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid var(--border);
  text-align: center;
  min-width: 150px;
}

.flow-box.module {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.flow-box.api {
  border-color: #6b7280;
  background: rgba(107, 114, 128, 0.05);
}

.flow-box.server {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

.flow-box.storage {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.flow-box h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.flow-box p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.flow-arrow {
  font-size: 1.5rem;
  color: var(--text-secondary);
  font-weight: bold;
}

.emergency-flow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.emergency-step {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #ef4444;
}

.emergency-step h4 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.emergency-step p {
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.emergency-step code {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.dashboard-cycle {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.cycle-item {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.cycle-item h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.cycle-item ul {
  list-style: none;
  padding: 0;
}

.cycle-item li {
  color: var(--text-secondary);
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.cycle-item li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--text-secondary);
  font-weight: bold;
}

/* Code Examples Styles */
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
  font-size: 1.25rem;
}

.code-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.code-tabs button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.code-tabs button:hover {
  color: var(--text-primary);
}

.code-tabs button.active {
  color: var(--text-primary);
  border-bottom-color: var(--text-primary);
}

.curl-examples {
  display: grid;
  gap: 1.5rem;
}

.curl-example {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.curl-example h4 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

/* Status Tab Styles */
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
  font-size: 1.25rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.status-item {
  padding: 1.5rem;
  background: var(--bg);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
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

.badge.emergency {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid #ef4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-item p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.status-item small {
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

.http-codes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.code-group {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.code-group h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.code-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.code-item:last-child {
  border-bottom: none;
}

.code-item code {
  background: var(--border);
  color: var(--text-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
}

.code-item p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
  flex: 1;
  margin-left: 1rem;
}

/* General Styles */
pre {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--border);
  margin: 0;
}

code {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .api-docs-container {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .nav-tabs {
    flex-direction: column;
  }

  .nav-tabs button {
    flex: none;
  }

  .flow-diagram {
    flex-direction: column;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }

  .endpoint-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .architecture-grid,
  .security-grid,
  .status-grid,
  .http-codes {
    grid-template-columns: 1fr;
  }
}
</style>
