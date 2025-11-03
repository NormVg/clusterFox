<template>
  <div class="network-resilience">
    <div class="header">
      <div class="header-content">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
        </div>
        <div>
          <h3>Network Resilience</h3>
          <p>Critical nodes and single points of failure</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else class="resilience-content">
      <div class="resilience-score" :class="getResilienceClass(resilience.score)">
        <div class="score-value">{{ resilience.score }}/100</div>
        <div class="score-label">Resilience Score</div>
      </div>

      <div class="metrics-row">
        <div class="metric">
          <div class="metric-label">Critical Nodes</div>
          <div class="metric-value critical">{{ resilience.criticalNodes }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Redundant Paths</div>
          <div class="metric-value good">{{ resilience.redundantPaths }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Single Points</div>
          <div class="metric-value warning">{{ resilience.singlePoints }}</div>
        </div>
      </div>

      <div v-if="resilience.recommendations.length > 0" class="recommendations">
        <h4>Recommendations</h4>
        <div v-for="(rec, index) in resilience.recommendations" :key="index" class="recommendation-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>{{ rec }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const resilience = ref({
  score: 0,
  criticalNodes: 0,
  redundantPaths: 0,
  singlePoints: 0,
  recommendations: []
})

const fetchResilience = async () => {
  try {
    loading.value = true

    // Fetch connections and modules
    const [connectionsRes, modulesRes] = await Promise.all([
      $fetch('/api/node-connections'),
      $fetch('/api/modules')
    ])

    if (connectionsRes.success && modulesRes.success) {
      const connections = connectionsRes.connections || []
      const modules = modulesRes.modules || []

      // Calculate network graph metrics
      const nodeConnections = {}
      connections.forEach(conn => {
        nodeConnections[conn.from] = (nodeConnections[conn.from] || 0) + 1
        nodeConnections[conn.to] = (nodeConnections[conn.to] || 0) + 1
      })

      // Critical nodes: nodes with 3+ connections
      const criticalNodes = Object.values(nodeConnections).filter(count => count >= 3).length

      // Single points: nodes with only 1 connection
      const singlePoints = Object.values(nodeConnections).filter(count => count === 1).length

      // Redundant paths: nodes with multiple connections
      const redundantPaths = Object.values(nodeConnections).filter(count => count >= 2).length

      // Calculate resilience score
      const score = Math.min(100, Math.round(
        ((redundantPaths / modules.length) * 50) +
        ((modules.length - singlePoints) / modules.length * 30) +
        (criticalNodes > 0 ? 20 : 0)
      ))

      // Generate recommendations
      const recommendations = []
      if (singlePoints > 0) {
        recommendations.push(`Add backup connections for ${singlePoints} isolated modules`)
      }
      if (criticalNodes > 5) {
        recommendations.push('Consider load balancing across critical nodes')
      }
      if (redundantPaths < modules.length * 0.5) {
        recommendations.push('Increase network redundancy for better failover')
      }

      resilience.value = {
        score,
        criticalNodes,
        redundantPaths,
        singlePoints,
        recommendations
      }
    }
  } catch (error) {
    console.error('Error fetching resilience:', error)
  } finally {
    loading.value = false
  }
}

const getResilienceClass = (score) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  return 'poor'
}

onMounted(() => {
  fetchResilience()
})
</script>

<style scoped>
.network-resilience {
  background: var(--surface);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #10b981, #34d399);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
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

.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.resilience-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.resilience-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border-radius: 0.75rem;
  border: 2px solid;
}

.resilience-score.excellent {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.resilience-score.good {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.resilience-score.poor {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.score-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--bg);
  border-radius: 0.625rem;
  border: 1px solid var(--border);
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.metric-value.critical {
  color: #dc2626;
}

.metric-value.warning {
  color: #f59e0b;
}

.metric-value.good {
  color: #10b981;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendations h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.recommendation-item svg {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--primary);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }
}
</style>
