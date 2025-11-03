<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '~/stores/settings'

const props = defineProps({
  initialNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['nodeAdded', 'nodeUpdated', 'nodeDeleted', 'nodeSelected'])

// Map container reference
const mapContainer = ref(null)
const mapWrapper = ref(null)

// Node management
const nodes = ref([])

// Load saved positions from API
const loadSavedPositions = async () => {
  try {
    const response = await fetch('/api/node-positions')
    const data = await response.json()
    return data.success ? data.positions : {}
  } catch (error) {
    console.error('Error loading positions from API:', error)
    return {}
  }
}

// Save positions to API
const savePositions = async () => {
  try {
    const positions = {}
    nodes.value.forEach(node => {
      positions[node.id] = { x: node.x, y: node.y }
    })

    // Save to API
    await fetch('/api/node-positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(positions)
    })
  } catch (error) {
    console.error('Error saving positions:', error)
  }
}

// Fetch modules from API
const fetchModules = async () => {
  try {
    const response = await fetch(`/api/modules?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    const data = await response.json()

    if (data.success && data.modules) {
      const savedPositions = await loadSavedPositions()


  // Rebuild/validate connections after nodes update
  generateConnections()
  console.log('[NodeMap] Nodes loaded:', nodes.value.length, 'Connections:', nodeConnections.value.length)
      // Convert modules to nodes with saved or default positions
      nodes.value = data.modules.map((module, index) => {
        const saved = savedPositions[module.umid]
        return {
          id: module.umid,
          name: module.umid,
          x: saved?.x ?? (100 + (index % 4) * 200),
          y: saved?.y ?? (100 + Math.floor(index / 4) * 200),
          status: module.status,
          type: module.moduleType,
          moduleData: module
        }
      })

      // Generate connections between nodes
      generateConnections()
    }
  } catch (error) {
    console.error('Error fetching modules:', error)
  }
}

// Auto-refresh modules every 5 seconds
let refreshInterval = null

// State management
const selectedNode = ref(null)
const draggingNode = ref(null)
const isDraggingMap = ref(false)
const mapOffset = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })
const mapScale = ref(1)

// UI state
const showAddNodeForm = ref(false)
const newNodeForm = ref({
  name: '',
  status: 'online',
  type: 'server'
})

// Node status options
const statusOptions = ['online', 'offline', 'warning', 'error', 'emergency', 'idle']
const typeOptions = ['server', 'database', 'client', 'router', 'storage']

// Status colors
const getStatusColor = (status) => {
  const colors = {
    active: '#10b981',      // Green for active
    inactive: '#f59e0b',    // Orange for inactive
    offline: '#6b7280',     // Gray for offline
    unknown: '#6b7280',     // Gray for unknown
    online: '#10b981',
    warning: '#f59e0b',
    error: '#6b7280',
    emergency: '#dc2626',   // Red for emergency
    idle: '#6b7280'
  }
  return colors[status] || '#6b7280'
}

// Node connections - define which nodes connect to which
const nodeConnections = ref([])

// View mode - 'view' or 'connect'
const viewMode = ref('view')

// Connection mode - always custom now
const connectionMode = ref('custom')

// Custom connection dropdowns
const connectionFrom = ref('')
const connectionTo = ref('')

// Add connection from dropdowns
const addConnection = () => {
  if (!connectionFrom.value || !connectionTo.value || connectionFrom.value === connectionTo.value) {
    return
  }

  // Check if connection already exists
  const exists = nodeConnections.value.some(
    c => (c.from === connectionFrom.value && c.to === connectionTo.value) ||
         (c.from === connectionTo.value && c.to === connectionFrom.value)
  )

  if (!exists) {
    console.log('[Connection] Adding:', connectionFrom.value, '→', connectionTo.value)
    nodeConnections.value.push({
      from: connectionFrom.value,
      to: connectionTo.value
    })
    saveConnections()
  }

  // Reset dropdowns
  connectionFrom.value = ''
  connectionTo.value = ''
}



// Delete a connection
const deleteConnection = (fromId, toId) => {
  const index = nodeConnections.value.findIndex(
    c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
  )
  if (index !== -1) {
    nodeConnections.value.splice(index, 1)
    saveConnections()
  }
}

// Save custom connections
const saveConnections = async () => {
  try {
    const connections = { connections: nodeConnections.value }
    await fetch('/api/node-connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connections)
    })
  } catch (error) {
    console.error('Error saving connections:', error)
  }
}

// Load custom connections
const loadConnections = async () => {
  try {
    const response = await fetch('/api/node-connections')
    const data = await response.json()
    if (data.success && data.connections) {
      return data.connections
    }
  } catch (error) {
    console.error('Error loading connections:', error)
  }
  return []
}

// Auto-generate connections based on topology mode
// Load saved custom connections
const generateConnections = async () => {
  const saved = await loadConnections()
  nodeConnections.value = saved
}

// Type icons (using text for simplicity)
const getTypeIcon = (type) => {
  const icons = {
    server: '🖥️',
    database: '💾',
    client: '👤',
    router: '🔀',
    storage: '📦'
  }
  return icons[type] || '⚙️'
}

// Node dragging
const startNodeDrag = (node, event) => {
  event.stopPropagation()
  draggingNode.value = node
  const rect = mapContainer.value.getBoundingClientRect()
  dragStart.value = {
    x: (event.clientX - rect.left - mapOffset.value.x) / mapScale.value - node.x,
    y: (event.clientY - rect.top - mapOffset.value.y) / mapScale.value - node.y
  }
}

// Map panning
const startMapDrag = (event) => {
  if (event.target === mapWrapper.value || event.target === mapContainer.value) {
    isDraggingMap.value = true
    dragStart.value = {
      x: event.clientX - mapOffset.value.x,
      y: event.clientY - mapOffset.value.y
    }
  }
}

// Mouse move handler
const handleMouseMove = (event) => {
  if (draggingNode.value) {
    const rect = mapContainer.value.getBoundingClientRect()
    const newX = (event.clientX - rect.left - mapOffset.value.x) / mapScale.value - dragStart.value.x
    const newY = (event.clientY - rect.top - mapOffset.value.y) / mapScale.value - dragStart.value.y

    draggingNode.value.x = Math.max(0, Math.min(5000, newX))
    draggingNode.value.y = Math.max(0, Math.min(5000, newY))

    emit('nodeUpdated', draggingNode.value)
  } else if (isDraggingMap.value) {
    mapOffset.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y
    }
  }
}

// Mouse up handler
const handleMouseUp = () => {
  if (draggingNode.value) {
    // Save positions when done dragging
    savePositions()
  // Connections depend on node positions; recompute lines
  // (connectionLines is computed, but ensure any dependent visuals refresh)
  // No-op; Vue reactivity will update since nodes changed.
  }
  draggingNode.value = null
  isDraggingMap.value = false
}

// Node selection
const selectNode = (node, event) => {
  event.stopPropagation()
  if (!draggingNode.value) {
    selectedNode.value = node
    emit('nodeSelected', node)
  }
}

// Deselect node
const deselectNode = () => {
  selectedNode.value = null
}

// Add new node
const addNode = () => {
  const newNode = {
    id: Date.now(),
    name: newNodeForm.value.name || `Node ${nodes.value.length + 1}`,
    x: Math.random() * 400 + 100,
    y: Math.random() * 300 + 100,
    status: newNodeForm.value.status,
    type: newNodeForm.value.type
  }

  nodes.value.push(newNode)
  emit('nodeAdded', newNode)

  // Reset form
  newNodeForm.value = {
    name: '',
    status: 'online',
    type: 'server'
  }
  showAddNodeForm.value = false
}

// Delete node
const deleteNode = (nodeId) => {
  const index = nodes.value.findIndex(n => n.id === nodeId)
  if (index !== -1) {
    const deletedNode = nodes.value.splice(index, 1)[0]
    emit('nodeDeleted', deletedNode)
    selectedNode.value = null
  }
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Format last seen helper
const formatLastSeen = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const now = Date.now()
    const lastSeen = new Date(dateString).getTime()
    const diff = now - lastSeen
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
  } catch (error) {
    return 'Invalid date'
  }
}

// Update node status
const updateNodeStatus = (nodeId, newStatus) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) {
    node.status = newStatus
    emit('nodeUpdated', node)
  }
}

// Zoom controls
const zoomIn = () => {
  mapScale.value = Math.min(2, mapScale.value + 0.1)
}

const zoomOut = () => {
  mapScale.value = Math.max(0.5, mapScale.value - 0.1)
}

const resetZoom = () => {
  mapScale.value = 1
  mapOffset.value = { x: 0, y: 0 }
}

// Mouse wheel zoom
const handleWheel = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  mapScale.value = Math.max(0.5, Math.min(2, mapScale.value + delta))
}

// Lifecycle
onMounted(async () => {
  const settingsStore = useSettingsStore()
  await settingsStore.loadSettings()
  const intervalMs = (settingsStore.refreshInterval || 10) * 1000

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)

  // Initial fetch
  fetchModules()

  // Auto-refresh using settings interval
  refreshInterval = setInterval(fetchModules, intervalMs)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)

  // Clear refresh interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Computed
const nodeCount = computed(() => nodes.value.length)
const statusCounts = computed(() => {
  return statusOptions.reduce((acc, status) => {
    acc[status] = nodes.value.filter(n => n.status === status).length
    return acc
  }, {})
})
</script>

<template>
  <div class="node-map-container">
    <!-- Header Controls -->
    <div class="map-header">
      <div class="header-left">
        <h3>Node Map</h3>
        <div class="node-stats">
          <span class="stat">{{ nodeCount }} module{{ nodeCount !== 1 ? 's' : '' }}</span>
          <span
            v-for="status in statusOptions"
            :key="status"
            v-show="statusCounts[status] > 0"
            class="stat-badge"
            :style="{ borderColor: getStatusColor(status) }"
          >
            <span class="stat-dot" :style="{ background: getStatusColor(status) }"></span>
            {{ statusCounts[status] }} {{ status }}
          </span>
        </div>
      </div>

      <div class="header-right">
                <button
          class="control-btn mode-btn"
          :class="{ active: viewMode === 'connect' }"
          @click="viewMode = viewMode === 'view' ? 'connect' : 'view'"
          title="Toggle connection mode"
        >
          <svg v-if="viewMode === 'view'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {{ viewMode === 'view' ? 'Connect Mode' : 'View Mode' }}
        </button>
        <button class="control-btn" @click="fetchModules" title="Refresh modules">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
        <button class="control-btn" @click="zoomOut">−</button>
        <button class="control-btn" @click="resetZoom">⟲</button>
        <button class="control-btn" @click="zoomIn">+</button>
      </div>
    </div>

    <!-- Connection Creator -->
    <div v-if="viewMode === 'connect'" class="connection-creator">
      <div class="creator-content">
        <span class="creator-label">Create Connection:</span>
        <select v-model="connectionFrom" class="node-select">
          <option value="">From Node...</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.name }}
          </option>
        </select>
        <span class="arrow">→</span>
        <select v-model="connectionTo" class="node-select">
          <option value="">To Node...</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id" :disabled="node.id === connectionFrom">
            {{ node.name }}
          </option>
        </select>
                <button
          class="control-btn add-btn"
          @click="addConnection"
          :disabled="!connectionFrom || !connectionTo || connectionFrom === connectionTo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>
        <button
          class="control-btn clear-btn"
          @click="nodeConnections = []; saveConnections()"
          :disabled="nodeConnections.length === 0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear All ({{ nodeConnections.length }})
        </button>
      </div>
    </div>

    <!-- Add Node Form -->
    <div v-if="showAddNodeForm" class="add-node-form">
      <input
        v-model="newNodeForm.name"
        placeholder="Node name"
        @keyup.enter="addNode"
      />
      <select v-model="newNodeForm.type">
        <option v-for="type in typeOptions" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
      <select v-model="newNodeForm.status">
        <option v-for="status in statusOptions" :key="status" :value="status">
          {{ status }}
        </option>
      </select>
      <button @click="addNode">Add</button>
      <button @click="showAddNodeForm = false">Cancel</button>
    </div>

    <!-- Map Container -->
    <div
      ref="mapContainer"
      class="map-viewport"
      @mousedown="startMapDrag"
      @wheel="handleWheel"
      @click="deselectNode"
    >
      <div
        ref="mapWrapper"
        class="map-wrapper"
        :style="{
          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})`,
          transformOrigin: '0 0'
        }"
      >
        <!-- Grid Background -->
        <div class="map-grid"></div>

        <!-- Connection Lines (SVG) -->
        <svg class="connection-layer" width="5000" height="5000">
          <!-- Connections -->
          <g v-for="(conn, index) in nodeConnections" :key="`conn-${index}`">
            <line
              v-if="nodes.find(n => n.id === conn.from) && nodes.find(n => n.id === conn.to)"
              :x1="nodes.find(n => n.id === conn.from).x + 12"
              :y1="nodes.find(n => n.id === conn.from).y + 12"
              :x2="nodes.find(n => n.id === conn.to).x + 12"
              :y2="nodes.find(n => n.id === conn.to).y + 12"
              stroke="#94a3b8"
              stroke-width="2"
              stroke-dasharray="5,5"
              stroke-linecap="round"
              opacity="0.6"
              class="connection-line"
              :title="`${conn.from} → ${conn.to}`"
              @click.stop="viewMode === 'connect' ? deleteConnection(conn.from, conn.to) : null"
            />
          </g>
        </svg>

        <!-- Nodes -->
        <div
          v-for="node in nodes"
          :key="node.id"
          class="node"
          :class="{
            'node-selected': selectedNode?.id === node.id,
            'node-dragging': draggingNode?.id === node.id,
            'node-cutoff': node.moduleData?.isCutoffModule,
            [`node-${node.status}`]: true
          }"
          :style="{
            left: node.x + 'px',
            top: node.y + 'px'
          }"
          @mousedown="startNodeDrag(node, $event)"
          @click="selectNode(node, $event)"
        >
          <!-- Node Core -->
          <div
            class="node-core"
            :class="{ 'node-core-cutoff': node.moduleData?.isCutoffModule }"
            :style="{ borderColor: getStatusColor(node.status) }"
          >
            <div class="node-pulse" :style="{ borderColor: getStatusColor(node.status) }"></div>
            <div class="node-dot" :style="{ background: getStatusColor(node.status) }"></div>
          </div>

          <!-- Node Info -->
          <div class="node-info">
            <span class="node-icon">{{ getTypeIcon(node.type) }}</span>
            <span class="node-name">{{ node.name }}</span>
          </div>

          <!-- Connection Points -->
          <div class="connection-point connection-top"></div>
          <div class="connection-point connection-right"></div>
          <div class="connection-point connection-bottom"></div>
          <div class="connection-point connection-left"></div>
        </div>
      </div>
    </div>

    <!-- Node Details Panel -->
    <div v-if="selectedNode" class="node-details">
      <div class="details-header">
        <h4>{{ selectedNode.name }}</h4>
        <button class="close-btn" @click="deselectNode">×</button>
      </div>

      <div class="details-content">
        <div class="detail-row">
          <span class="detail-label">Module ID:</span>
          <span class="detail-value module-id">{{ selectedNode.moduleData?.umid || selectedNode.id }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Type:</span>
          <span class="detail-value">{{ selectedNode.moduleData?.moduleType || selectedNode.type }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">
            <span class="status-badge" :style="{
              background: getStatusColor(selectedNode.status) + '20',
              color: getStatusColor(selectedNode.status),
              border: '1px solid ' + getStatusColor(selectedNode.status)
            }">
              {{ selectedNode.status }}
            </span>
          </span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Last Seen:</span>
          <span class="detail-value">{{ formatLastSeen(selectedNode.moduleData?.lastSeen) }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Data Count:</span>
          <span class="detail-value">{{ selectedNode.moduleData?.dataCount || 0 }} readings</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Registered:</span>
          <span class="detail-value">{{ formatDate(selectedNode.moduleData?.registeredAt) }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Session ID:</span>
          <span class="detail-value session-id">{{ selectedNode.moduleData?.session_id?.substring(0, 12) }}...</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Position:</span>
          <span class="detail-value">X: {{ Math.round(selectedNode.x) }}, Y: {{ Math.round(selectedNode.y) }}</span>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="map-instructions">
      <p v-if="viewMode === 'connect'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <strong>Connect Mode:</strong> Select nodes from dropdowns above to create connections • <strong>Click</strong> line to delete • <strong>Drag</strong> nodes to move
      </p>
      <p v-else>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <strong>View Mode:</strong> <strong>Drag</strong> nodes to move • <strong>Scroll</strong> to zoom • <strong>Click</strong> node for details
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Container - Fixed to parent size */
.node-map-container {
  width: 100%;
  height: 100%;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

/* Header - Fixed height */
.map-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  flex-shrink: 0;
  min-height: 70px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.node-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.stat {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-secondary);
  border: 1px solid;
  background: var(--bg);
}

.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.header-right {
  display: flex;
  gap: 8px;
}

.topology-select {
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-weight: 500;
}

.topology-select:hover {
  border-color: var(--accent);
}

.topology-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-btn:hover {
  background: var(--surface);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.mode-btn.active {
  background: #e5e7eb !important;
  color: #374151 !important;
  border-color: #d1d5db !important;
}

.mode-btn.active:hover {
  background: #d1d5db !important;
  color: #374151 !important;
  opacity: 1;
}

.clear-btn {
  border-color: #ef4444;
  color: #ef4444;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #dc2626;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-btn {
  border-color: #10b981;
  color: #10b981;
}

.add-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
  border-color: #059669;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Connection Creator Panel */
.connection-creator {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}

.creator-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 12px;
  flex-wrap: wrap;
}

.creator-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.node-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  min-width: 140px;
  max-width: 180px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-select:hover {
  border-color: var(--accent);
}

.node-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.arrow {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: bold;
}

/* Add Node Form - Fixed height when visible */
.add-node-form {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.add-node-form input,
.add-node-form select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
}

.add-node-form input {
  flex: 1;
  min-width: 150px;
}

.add-node-form button {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--accent);
  color: var(--bg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-node-form button:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.add-node-form button:last-child {
  background: transparent;
  color: var(--text-secondary);
}

/* Map Viewport - Fills remaining space */
.map-viewport {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: var(--bg);
  cursor: grab;
}

.map-viewport:active {
  cursor: grabbing;
}

/* Map Wrapper - Large virtual canvas */
.map-wrapper {
  width: 5000px;
  height: 5000px;
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.05s linear;
  will-change: transform;
}

/* Grid Background */
.map-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: var(--bg);
  background-image:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 50px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 50px);
  background-size: 50px 50px;
  pointer-events: none;
}

/* Connection Layer */
.connection-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.connection-layer line {
  transition: opacity 0.3s ease, stroke 0.3s ease;
}

.connection-line {
  cursor: pointer;
  pointer-events: stroke;
}

.connection-line:hover {
  opacity: 0.8 !important;
  stroke: #ef4444 !important;
  stroke-width: 3;
}

/* Node Styles */
.node {
  position: absolute;
  cursor: move;
  user-select: none;
  transition: transform 0.1s ease;
  z-index: 10;
}

.node:hover {
  z-index: 20;
  transform: scale(1.05);
}

.node-selected {
  z-index: 30;
}

.node-dragging {
  z-index: 40;
  cursor: grabbing;
}

.node-connecting {
  z-index: 50;
}

.node-connecting .node-core {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
  animation: pulse-connect 1s ease infinite;
}

@keyframes pulse-connect {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
  }
}

.node-core {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid;
  background: var(--surface);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

/* Diamond/Rhombus shape for cutoff modules */
.node-core-cutoff {
  border-radius: 0;
  transform: rotate(45deg);
  width: 28px;
  height: 28px;
}

.node-cutoff:hover .node-core-cutoff {
  transform: rotate(45deg) scale(1.2);
}

.node-core-cutoff .node-pulse {
  border-radius: 0;
}

.node-core-cutoff .node-dot {
  border-radius: 0;
  transform: rotate(-45deg);
  inset: 6px;
}

.node:hover .node-core {
  transform: scale(1.2);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.node-pulse {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid;
  opacity: 0;
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.node-online .node-pulse {
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.node-dot {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite;
}

.node-info {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.node:hover .node-info {
  opacity: 1;
}

.node-selected .node-info {
  opacity: 1;
  font-weight: 600;
}

.node-icon {
  font-size: 14px;
}

.node-name {
  color: var(--text-primary);
}

/* Connection Points */
.connection-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--accent);
  border: 2px solid var(--surface);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: crosshair;
}

.node-selected .connection-point {
  opacity: 1;
}

.connection-top {
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
}

.connection-right {
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
}

.connection-bottom {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
}

.connection-left {
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
}

/* Node Details Panel */
.node-details {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 280px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 20;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.details-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 24px;
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

.details-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 600;
}

.detail-value.module-id {
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  font-size: 0.813rem;
  color: var(--accent);
}

.detail-value.session-id {
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-select {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

.details-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.delete-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #ef4444;
  border-radius: 6px;
  background: transparent;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
}

/* Instructions */
.map-instructions {
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg);
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}

.map-instructions p {
  margin: 0;
}

.map-instructions strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 100px;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

@keyframes pulse-ring {
  0% {
    opacity: 0.6;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}

@keyframes glow {
  0%, 100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.8;
    filter: brightness(1.2);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .map-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left,
  .header-right {
    width: 100%;
  }

  .header-right {
    justify-content: flex-end;
  }

  .node-details {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
  }

  .add-node-form input {
    width: 100%;
  }
}

/* Emergency Pulse Animation */
@keyframes emergencyPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.node.status-emergency circle {
  stroke: #dc2626 !important;
  animation: emergencyPulse 1.5s ease-in-out infinite;
}

.connection.status-emergency {
  stroke: #dc2626 !important;
  animation: emergencyPulse 1.5s ease-in-out infinite;
}
</style>
