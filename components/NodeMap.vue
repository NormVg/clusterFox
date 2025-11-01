<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
const nodes = ref([
  {
    id: 1,
    name: 'Node 1',
    x: 100,
    y: 100,
    status: 'online',
    type: 'server'
  },
  {
    id: 2,
    name: 'Node 2',
    x: 300,
    y: 150,
    status: 'offline',
    type: 'database'
  },
  {
    id: 3,
    name: 'Node 3',
    x: 500,
    y: 200,
    status: 'warning',
    type: 'server'
  },
  {
    id: 4,
    name: 'Node 4',
    x: 250,
    y: 300,
    status: 'online',
    type: 'client'
  }
])

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
const statusOptions = ['online', 'offline', 'warning', 'error', 'idle']
const typeOptions = ['server', 'database', 'client', 'router', 'storage']

// Status colors
const getStatusColor = (status) => {
  const colors = {
    online: '#10b981',
    offline: '#ef4444',
    warning: '#f59e0b',
    error: '#dc2626',
    idle: '#6b7280'
  }
  return colors[status] || '#6b7280'
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

    draggingNode.value.x = Math.max(0, Math.min(2000, newX))
    draggingNode.value.y = Math.max(0, Math.min(2000, newY))

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
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
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
          <span class="stat">{{ nodeCount }} nodes</span>
          <span
            v-for="status in statusOptions"
            :key="status"
            class="stat-badge"
            :style="{ borderColor: getStatusColor(status) }"
          >
            <span class="stat-dot" :style="{ background: getStatusColor(status) }"></span>
            {{ statusCounts[status] }} {{ status }}
          </span>
        </div>
      </div>

      <div class="header-right">
        <button class="control-btn" @click="showAddNodeForm = !showAddNodeForm">
          <span>+</span> Add Node
        </button>
        <button class="control-btn" @click="zoomOut">−</button>
        <button class="control-btn" @click="resetZoom">⟲</button>
        <button class="control-btn" @click="zoomIn">+</button>
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

        <!-- Nodes -->
        <div
          v-for="node in nodes"
          :key="node.id"
          class="node"
          :class="{
            'node-selected': selectedNode?.id === node.id,
            'node-dragging': draggingNode?.id === node.id,
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
          <div class="node-core" :style="{ borderColor: getStatusColor(node.status) }">
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
          <span class="detail-label">Type:</span>
          <span class="detail-value">{{ getTypeIcon(selectedNode.type) }} {{ selectedNode.type }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <select
            :value="selectedNode.status"
            @change="updateNodeStatus(selectedNode.id, $event.target.value)"
            class="status-select"
          >
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <div class="detail-row">
          <span class="detail-label">Position:</span>
          <span class="detail-value">X: {{ Math.round(selectedNode.x) }}, Y: {{ Math.round(selectedNode.y) }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">ID:</span>
          <span class="detail-value">{{ selectedNode.id }}</span>
        </div>
      </div>

      <div class="details-actions">
        <button class="delete-btn" @click="deleteNode(selectedNode.id)">
          Delete Node
        </button>
      </div>
    </div>

    <!-- Instructions -->
    <div class="map-instructions">
      <p>💡 <strong>Drag</strong> nodes to move • <strong>Click</strong> background to pan • <strong>Scroll</strong> to zoom</p>
    </div>
  </div>
</template>

<style scoped>
.node-map-container {
  width: 100%;
  height: 600px;
  max-height: 600px;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Header */
.map-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  z-index: 10;
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
}

.stat {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
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

/* Add Node Form */
.add-node-form {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
  color: var(--surface);
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

/* Map Viewport */
.map-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--bg);
  cursor: grab;
}

.map-viewport:active {
  cursor: grabbing;
}

.map-wrapper {
  width: 3000px;
  height: 3000px;
  position: relative;
  transition: transform 0.05s linear;
}

/* Grid Background */
.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(0deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 50px),
    repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 50px);
  opacity: 0.3;
}

/* Node Styles */
.node {
  position: absolute;
  cursor: move;
  user-select: none;
  transition: transform 0.1s ease;
  z-index: 1;
}

.node:hover {
  z-index: 2;
  transform: scale(1.05);
}

.node-selected {
  z-index: 3;
}

.node-dragging {
  z-index: 4;
  cursor: grabbing;
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
</style>
