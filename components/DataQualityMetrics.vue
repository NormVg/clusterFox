<template>
  <div class="data-quality">
    <div class="header">
      <div class="header-content">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <h3>Data Quality Metrics</h3>
          <p>Completeness and consistency scores</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else class="metrics-content">
      <!-- Overall Score -->
      <div class="overall-score">
        <div class="score-circle" :class="getScoreClass(quality.overallScore)">
          <div class="score-value">{{ quality.overallScore }}</div>
          <div class="score-label">Quality Score</div>
        </div>
        <div class="score-description">
          <p>{{ getScoreDescription(quality.overallScore) }}</p>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon completeness">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ quality.completeness }}%</div>
            <div class="metric-label">Data Completeness</div>
            <div class="metric-detail">{{ quality.missingDataPoints }} missing points</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon consistency">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ quality.consistency }}%</div>
            <div class="metric-label">Timestamp Consistency</div>
            <div class="metric-detail">{{ quality.timestampIssues }} timestamp issues</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon accuracy">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ quality.accuracy }}%</div>
            <div class="metric-label">Data Accuracy</div>
            <div class="metric-detail">{{ quality.duplicates }} duplicates found</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon freshness">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ quality.freshness }}%</div>
            <div class="metric-label">Data Freshness</div>
            <div class="metric-detail">{{ quality.staleModules }} stale modules</div>
          </div>
        </div>
      </div>

      <!-- Issues List -->
      <div v-if="quality.issues.length > 0" class="issues-section">
        <h4>Data Quality Issues</h4>
        <div class="issues-list">
          <div v-for="(issue, index) in quality.issues" :key="index" class="issue-item">
            <div :class="['issue-severity', issue.severity]"></div>
            <div class="issue-content">
              <span class="issue-module">{{ issue.module }}</span>
              <span class="issue-description">{{ issue.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const quality = ref({
  overallScore: 0,
  completeness: 0,
  consistency: 0,
  accuracy: 0,
  freshness: 0,
  missingDataPoints: 0,
  timestampIssues: 0,
  duplicates: 0,
  staleModules: 0,
  issues: []
})

const fetchQuality = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/data-quality')

    if (response.success) {
      quality.value = response.quality
    }
  } catch (error) {
    console.error('Error fetching data quality:', error)
  } finally {
    loading.value = false
  }
}

const getScoreClass = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}

const getScoreDescription = (score) => {
  if (score >= 90) return 'Excellent data quality across all metrics'
  if (score >= 75) return 'Good data quality with minor issues'
  if (score >= 60) return 'Fair data quality, some attention needed'
  return 'Poor data quality, immediate action required'
}

onMounted(() => {
  fetchQuality()
})
</script>

<style scoped>
.data-quality {
  background: var(--surface);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  max-height: 650px;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
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
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
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
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.metrics-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  flex: 1;
  min-height: 0;
  padding-right: 0.25rem;
}

/* Custom scrollbar */
.metrics-content::-webkit-scrollbar {
  width: 6px;
}

.metrics-content::-webkit-scrollbar-track {
  background: var(--bg);
  border-radius: 3px;
}

.metrics-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.metrics-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.overall-score {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg);
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  flex-wrap: wrap;
  min-width: 0;
}

.score-circle {
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid;
  flex-shrink: 0;
  position: relative;
}

.score-circle.excellent {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.score-circle.good {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.score-circle.fair {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.score-circle.poor {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.score-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.score-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.score-description p {
  font-size: 0.938rem;
  color: var(--text-primary);
  margin: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  width: 100%;
  min-width: 0;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--bg);
  border-radius: 0.625rem;
  border: 1px solid var(--border);
  min-width: 0;
}

.metric-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.metric-icon.completeness {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.metric-icon.consistency {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.metric-icon.accuracy {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.metric-icon.freshness {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.metric-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.metric-label {
  font-size: 0.813rem;
  color: var(--text-primary);
  margin-top: 0.25rem;
}

.metric-detail {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.issues-section {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.issues-section h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.issue-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

.issue-severity {
  width: 0.25rem;
  border-radius: 0.125rem;
  flex-shrink: 0;
}

.issue-severity.critical {
  background: #dc2626;
}

.issue-severity.warning {
  background: #f59e0b;
}

.issue-severity.info {
  background: #3b82f6;
}

.issue-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.issue-module {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text-primary);
}

.issue-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .overall-score {
    flex-direction: column;
    text-align: center;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
