<template>
  <div class="ai-insights">
    <div class="header">
      <div class="header-content">
        <div class="header-icon ai-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
            <path d="M12 6v6l4 2"/>
            <circle cx="12" cy="12" r="1"/>
          </svg>
        </div>
        <div>
          <h3>AI-Powered Insights</h3>
          <p>Intelligent analysis by Google Gemini</p>
        </div>
      </div>
      <button @click="refreshInsights" class="refresh-btn" :disabled="loading" :title="loading ? 'Analyzing...' : 'Refresh insights (~500-600 tokens)'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spin: loading }">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        <span v-if="!loading">Refresh AI</span>
        <span v-else>Analyzing...</span>
      </button>
    </div>

    <!-- Initial State - No data loaded yet -->
    <div v-if="!hasLoadedOnce && !loading" class="initial-state">
      <div class="ai-icon-large">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
          <path d="M12 6v6l4 2"/>
          <circle cx="12" cy="12" r="1"/>
        </svg>
      </div>
      <h4>AI-Powered Network Intelligence</h4>
      <p>Click "Generate Insights" to analyze your IoT network with Google Gemini AI</p>
      <div class="token-warning">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Uses ~500-600 tokens per analysis</span>
      </div>
      <button @click="fetchInsights" class="generate-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        Generate Insights
      </button>
    </div>

    <div v-else-if="loading && !insights.summary" class="loading-state">
      <div class="ai-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p>AI is analyzing your IoT network...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <div v-if="insights.recommendations" class="setup-instructions">
        <h4>Setup Instructions:</h4>
        <ol>
          <li v-for="(step, index) in insights.recommendations" :key="index">{{ step }}</li>
        </ol>
      </div>
    </div>

    <div v-else class="insights-content">
      <!-- AI Summary -->
      <div class="summary-card">
        <div class="summary-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div class="summary-text">
          <h4>Network Analysis</h4>
          <p>{{ insights.summary }}</p>
        </div>
      </div>

      <!-- Critical Issues -->
      <div v-if="insights.criticalIssues && insights.criticalIssues.length > 0" class="section">
        <div class="section-header critical">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h4>Critical Issues</h4>
        </div>
        <div class="items-list">
          <div v-for="(issue, index) in insights.criticalIssues" :key="index" class="item critical">
            <div class="item-marker"></div>
            <span>{{ issue }}</span>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="insights.recommendations && insights.recommendations.length > 0" class="section">
        <div class="section-header recommendations">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <h4>AI Recommendations</h4>
        </div>
        <div class="items-list">
          <div v-for="(rec, index) in insights.recommendations" :key="index" class="item recommendation">
            <div class="item-number">{{ index + 1 }}</div>
            <span>{{ rec }}</span>
          </div>
        </div>
      </div>

      <!-- Opportunities -->
      <div v-if="insights.opportunities && insights.opportunities.length > 0" class="section">
        <div class="section-header opportunities">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M2 12h20"/>
            <path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>
          </svg>
          <h4>Optimization Opportunities</h4>
        </div>
        <div class="items-list">
          <div v-for="(opp, index) in insights.opportunities" :key="index" class="item opportunity">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>{{ opp }}</span>
          </div>
        </div>
      </div>

      <!-- Timestamp and Token Info -->
      <div class="footer-info">
        <div v-if="timestamp" class="timestamp">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Last analyzed: {{ formatTimestamp(timestamp) }}</span>
        </div>
        <div v-if="tokenInfo" class="token-info">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span v-if="tokenInfo.source === 'cache'" class="cached">
            Cached (0 tokens)
          </span>
          <span v-else class="api-call">
            {{ tokenInfo.tokenUsage?.toLocaleString() || '~5,000' }} tokens
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const error = ref(null)
const hasLoadedOnce = ref(false) // Track if insights have been loaded
const insights = ref({
  summary: '',
  recommendations: [],
  criticalIssues: [],
  opportunities: []
})
const timestamp = ref(null)
const tokenInfo = ref(null)

const fetchInsights = async () => {
  try {
    loading.value = true
    error.value = null
    hasLoadedOnce.value = true // Mark as loaded

    const response = await $fetch('/api/ai/insights')

    if (response.success) {
      insights.value = response.insights
      timestamp.value = response.timestamp
      tokenInfo.value = {
        source: response.source,
        tokenUsage: response.tokenUsage
      }
      error.value = null
    } else {
      error.value = response.error || 'Failed to generate insights'
      if (response.insights) {
        insights.value = response.insights
      }
      tokenInfo.value = null
    }
  } catch (err) {
    console.error('Error fetching AI insights:', err)
    error.value = 'Failed to connect to AI service'
    tokenInfo.value = null
  } finally {
    loading.value = false
  }
}

const refreshInsights = () => {
  fetchInsights()
}

const formatTimestamp = (ts) => {
  const date = new Date(ts)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleString()
}

// REMOVED: onMounted(() => { fetchInsights() })
// Now insights only load when user clicks the button!
</script>

<style scoped>
.ai-insights {
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
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: #000000;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  position: relative;
  border: 1px solid #000000;
}

.header-icon.ai-pulse::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 0.625rem;
  background: #000000;
  opacity: 0.15;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.1; }
}

.header-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  position: relative;
  z-index: 1;
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

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn svg {
  width: 1rem;
  height: 1rem;
}

.refresh-btn svg.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1.5rem;
}

.ai-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(2) {
  border-top-color: #8b5cf6;
  animation-delay: 0.3s;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.spinner-ring:nth-child(3) {
  border-top-color: #6366f1;
  animation-delay: 0.6s;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 0.938rem;
}

.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
  text-align: center;
}

.ai-icon-large {
  width: 4rem;
  height: 4rem;
  background: #000000;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 0.5rem;
  position: relative;
  border: 1px solid #000000;
}

.ai-icon-large::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 1rem;
  background: #000000;
  opacity: 0.1;
  animation: pulse 2s ease-in-out infinite;
}

.ai-icon-large svg {
  width: 2rem;
  height: 2rem;
  position: relative;
  z-index: 1;
}

.initial-state h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.initial-state > p {
  color: var(--text-secondary);
  font-size: 0.938rem;
  margin: 0;
  max-width: 400px;
}

.token-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0.5rem;
  color: #f59e0b;
  font-size: 0.813rem;
  margin-top: 0.5rem;
}

.token-warning svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  background: #000000;
  color: white;
  border: 1px solid #000000;
  border-radius: 0.625rem;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.generate-btn:hover {
  background: white;
  color: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.generate-btn:active {
  transform: translateY(0);
}

.generate-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
  gap: 1rem;
}

.error-state svg {
  width: 3rem;
  height: 3rem;
  color: #f59e0b;
}

.error-state p {
  color: var(--text-primary);
  font-size: 0.938rem;
}

.setup-instructions {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg);
  border-radius: 0.5rem;
  text-align: left;
  width: 100%;
  max-width: 500px;
}

.setup-instructions h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.setup-instructions ol {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.813rem;
}

.setup-instructions li {
  margin-bottom: 0.5rem;
}

.insights-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.summary-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: #000000;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.summary-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.summary-text h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.summary-text p {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.section-header svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.section-header.critical {
  color: #dc2626;
}

.section-header.recommendations {
  color: #3b82f6;
}

.section-header.opportunities {
  color: #10b981;
}

.section-header h4 {
  font-size: 0.938rem;
  font-weight: 600;
  margin: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  background: var(--bg);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  font-size: 0.875rem;
  line-height: 1.5;
}

.item.critical {
  border-left: 3px solid #dc2626;
}

.item.recommendation {
  border-left: 3px solid #3b82f6;
}

.item.opportunity {
  border-left: 3px solid #10b981;
}

.item-marker {
  width: 0.5rem;
  height: 0.5rem;
  background: #dc2626;
  border-radius: 50%;
  margin-top: 0.375rem;
  flex-shrink: 0;
}

.item-number {
  width: 1.5rem;
  height: 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.item svg {
  width: 1.125rem;
  height: 1.125rem;
  color: #10b981;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.item span {
  color: var(--text-primary);
}

.footer-info {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.timestamp,
.token-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.timestamp svg,
.token-info svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.token-info .cached {
  color: #10b981;
  font-weight: 500;
}

.token-info .api-call {
  color: #3b82f6;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-info {
    flex-direction: column;
    align-items: stretch;
  }

  .timestamp,
  .token-info {
    justify-content: center;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
