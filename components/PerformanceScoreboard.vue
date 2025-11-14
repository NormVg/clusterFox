<template>
  <div class="performance-scoreboard">
    <div class="header">
      <div class="header-content">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/>
            <path d="m19 9-5 5-4-4-3 3"/>
          </svg>
        </div>
        <div>
          <h3>Module Performance Scoreboard</h3>
          <p>Ranked by reliability, uptime, and data consistency</p>
        </div>
      </div>
      <div class="filter-buttons">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="['filter-btn', { active: selectedFilter === filter.value }]"
          @click="selectedFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Analyzing module performance...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <div v-else class="scoreboard-content">
      <div class="scoreboard-table">
        <div class="table-header">
          <div class="rank-col">Rank</div>
          <div class="module-col">Module</div>
          <div class="score-col">Score</div>
          <div class="uptime-col">Uptime</div>
          <div class="data-col">Data Rate</div>
          <div class="status-col">Status</div>
        </div>

        <div class="table-body">
          <div
            v-for="(module, index) in rankedModules"
            :key="module.umid"
            :class="['table-row', getRankClass(index)]"
          >
            <div class="rank-col">
              <div class="rank-badge" :class="getRankClass(index)">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>#{{ index + 1 }}</span>
              </div>
            </div>

            <div class="module-col">
              <div class="module-info">
                <span class="module-name">{{ module.umid }}</span>
                <span class="module-type">{{ module.moduleType }}</span>
              </div>
            </div>

            <div class="score-col">
              <div class="score-bar">
                <div class="score-fill" :style="{ width: module.score + '%', background: getScoreColor(module.score) }"></div>
                <span class="score-text">{{ module.score }}/100</span>
              </div>
            </div>

            <div class="uptime-col">
              <span :class="['uptime-badge', getUptimeBadgeClass(module.uptimePercent)]">
                {{ module.uptimePercent }}%
              </span>
            </div>

            <div class="data-col">
              <span class="data-rate">{{ module.dataRate }}</span>
            </div>

            <div class="status-col">
              <span :class="['status-badge', module.status]">
                {{ module.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat">
          <div class="stat-icon excellent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.excellent }}</div>
            <div class="stat-label">Excellent (90+)</div>
          </div>
        </div>

        <div class="stat">
          <div class="stat-icon good">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.good }}</div>
            <div class="stat-label">Good (70-89)</div>
          </div>
        </div>

        <div class="stat">
          <div class="stat-icon warning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.needsAttention }}</div>
            <div class="stat-label">Needs Attention (<70)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const error = ref(null)
const modules = ref([])
const selectedFilter = ref('all')

const filters = [
  { label: 'All Modules', value: 'all' },
  { label: 'Top Performers', value: 'top' },
  { label: 'Needs Attention', value: 'attention' }
]

// Fetch module performance data
const fetchPerformance = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/module-performance')

    if (response.success) {
      modules.value = response.modules
    }
  } catch (err) {
    console.error('Error fetching module performance:', err)
    error.value = 'Failed to load performance data'
  } finally {
    loading.value = false
  }
}

// Filter and rank modules
const rankedModules = computed(() => {
  let filtered = [...modules.value]

  if (selectedFilter.value === 'top') {
    // Show top 50% of modules, or those with score >= 70, whichever gives more results
    const sortedByScore = [...filtered].sort((a, b) => b.score - a.score)
    const topHalf = sortedByScore.slice(0, Math.ceil(sortedByScore.length / 2))
    const goodScoreModules = filtered.filter(m => m.score >= 70)

    // Use whichever group is larger
    filtered = goodScoreModules.length > 0 ? goodScoreModules : topHalf
  } else if (selectedFilter.value === 'attention') {
    filtered = filtered.filter(m => m.score < 50)  // Really needs attention
  }

  return filtered.sort((a, b) => b.score - a.score)
})

// Calculate summary stats
const stats = computed(() => {
  return {
    excellent: modules.value.filter(m => m.score >= 90).length,
    good: modules.value.filter(m => m.score >= 70 && m.score < 90).length,
    needsAttention: modules.value.filter(m => m.score < 70).length
  }
})

const getRankClass = (index) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

const getScoreColor = (score) => {
  if (score >= 90) return 'linear-gradient(90deg, #10b981, #34d399)'
  if (score >= 70) return 'linear-gradient(90deg, #3b82f6, #60a5fa)'
  if (score >= 50) return 'linear-gradient(90deg, #f59e0b, #fbbf24)'
  return 'linear-gradient(90deg, #ef4444, #f87171)'
}

const getUptimeBadgeClass = (uptime) => {
  if (uptime >= 95) return 'excellent'
  if (uptime >= 85) return 'good'
  return 'poor'
}

onMounted(() => {
  fetchPerformance()
})
</script>

<style scoped>
.performance-scoreboard {
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
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

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: #000000;
  color: #000000;
}

.filter-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
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
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.scoreboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.scoreboard-table {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
  min-width: 0;
}

.table-header {
  display: grid;
  grid-template-columns: 60px minmax(150px, 1fr) 200px 100px 100px 100px;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: var(--bg);
  min-width: 700px;
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-body {
  display: flex;
  flex-direction: column;
  min-width: 700px;
}

.table-row {
  display: grid;
  grid-template-columns: 60px minmax(150px, 1fr) 200px 100px 100px 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  transition: all 0.2s ease;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg);
}

.table-row.rank-1 {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.05), transparent);
}

.table-row.rank-2 {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.05), transparent);
}

.table-row.rank-3 {
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.05), transparent);
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #975a00;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #666;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #e6a35f);
  color: #5c3a1a;
}

.module-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  overflow: hidden;
}

.module-name {
  font-size: 0.938rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-bar {
  position: relative;
  width: 100%;
  height: 1.5rem;
  background: var(--bg);
  border-radius: 0.75rem;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.uptime-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.813rem;
  font-weight: 500;
}

.uptime-badge.excellent {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.uptime-badge.good {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.uptime-badge.poor {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.data-rate {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.inactive {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.offline {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--bg);
  border-radius: 0.625rem;
  border: 1px solid var(--border);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon.excellent {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-icon.good {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.stat-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 50px minmax(120px, 1fr) 150px 80px 80px 80px;
    gap: 0.75rem;
  }

  .table-header,
  .table-body {
    min-width: 600px;
  }
}

@media (max-width: 768px) {
  .performance-scoreboard {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-buttons {
    width: 100%;
    justify-content: stretch;
  }

  .filter-btn {
    flex: 1;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .scoreboard-table {
    border-radius: 0.375rem;
  }

  .table-header,
  .table-row {
    grid-template-columns: 40px minmax(100px, 1fr) 80px;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
  }

  .table-header,
  .table-body {
    min-width: 300px;
  }

  .uptime-col,
  .data-col,
  .status-col {
    display: none;
  }
}
</style>
