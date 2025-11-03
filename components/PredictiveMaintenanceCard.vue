<template>
  <div class="predictive-maintenance">
    <div class="header">
      <div class="header-content">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4l2 2"/>
          </svg>
        </div>
        <div>
          <h3>Predictive Maintenance</h3>
          <p>Modules requiring attention soon</p>
        </div>
      </div>
      <button @click="toggleAIPredictions" class="ai-toggle-btn" :disabled="loading" :title="useAI ? 'Using AI predictions (~300 tokens)' : 'Using basic predictions (0 tokens)'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
          <path d="M12 6v6l4 2"/>
          <circle cx="12" cy="12" r="1"/>
        </svg>
        <span v-if="!useAI">Enable AI</span>
        <span v-else>AI Active</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="predictions.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <p>All modules healthy!</p>
      <span>No maintenance required</span>
    </div>

    <div v-else class="predictions-list">
      <div
        v-for="prediction in predictions"
        :key="prediction.umid"
        :class="['prediction-card', prediction.severity]"
      >
        <div class="prediction-header">
          <div class="severity-badge" :class="prediction.severity">
            <svg v-if="prediction.severity === 'critical'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <svg v-else-if="prediction.severity === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="prediction-info">
            <h4>{{ prediction.umid }}</h4>
            <span class="module-type">{{ prediction.moduleType }}</span>
          </div>
        </div>

        <div class="prediction-details">
          <div class="detail-row">
            <span class="detail-label">Issue:</span>
            <span class="detail-value">{{ prediction.issue }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Prediction:</span>
            <span class="detail-value">{{ prediction.prediction }}</span>
          </div>
          <div class="detail-row action-row">
            <span class="detail-label">Action:</span>
            <span class="detail-value action-text">{{ prediction.recommendedAction }}</span>
          </div>
        </div>

        <div class="prediction-timeline">
          <div class="timeline-bar">
            <div class="timeline-fill" :style="{ width: prediction.urgencyPercent + '%', background: getUrgencyColor(prediction.severity) }"></div>
          </div>
          <span class="timeline-text">{{ prediction.timeframe }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const predictions = ref([])
const useAI = ref(false)

const toggleAIPredictions = async () => {
  useAI.value = !useAI.value
  await fetchPredictions()
}

const fetchPredictions = async () => {
  try {
    loading.value = true

    // Fetch module performance and analyze
    const performance = await $fetch('/api/module-performance')

    if (performance.success) {
      // Identify modules needing attention
      const needsAttention = performance.modules.filter(m => {
        return m.score < 75 ||
               m.status === 'offline' ||
               m.timeSinceLastSeen > 600000 || // 10 minutes
               m.recentActivity < 5
      })

      if (useAI.value && needsAttention.length > 0) {
        // Use AI to generate predictions
        await generateAIPredictions(needsAttention)
      } else {
        // Generate basic predictions (no AI, no tokens)
        generateBasicPredictions(needsAttention)
      }
    }
  } catch (error) {
    console.error('Error fetching predictions:', error)
  } finally {
    loading.value = false
  }
}

const generateAIPredictions = async (modules) => {
  try {
    // Call AI anomaly detection for intelligent predictions
    const aiResponse = await $fetch('/api/ai/anomalies')

    if (aiResponse.success && aiResponse.detection) {
      // Map AI anomalies to modules
      predictions.value = modules.map(module => {
        // Find matching AI anomaly
        const aiAnomaly = aiResponse.detection.anomalies.find(a =>
          a.affectedModules.includes(module.umid)
        )

        if (aiAnomaly) {
          // Use AI prediction
          const severity = aiAnomaly.type === 'critical' ? 'critical' :
                          aiAnomaly.type === 'warning' ? 'warning' : 'info'

          return {
            umid: module.umid,
            moduleType: module.moduleType,
            severity,
            issue: `${aiAnomaly.category}: ${module.status === 'offline' ? 'Module offline' : 'Performance degraded'}`,
            prediction: aiAnomaly.description,
            recommendedAction: aiAnomaly.recommendation,
            urgencyPercent: aiAnomaly.confidence || 70,
            timeframe: severity === 'critical' ? 'Immediate attention required' :
                      severity === 'warning' ? 'Action needed within 1 hour' : 'Monitor closely',
            score: module.score,
            lastSeen: module.lastSeen
          }
        }

        // Fallback to basic if no AI match
        return generateBasicPrediction(module)
      })
    } else {
      generateBasicPredictions(modules)
    }
  } catch (error) {
    console.error('AI prediction failed, using basic:', error)
    generateBasicPredictions(modules)
  }
}

const generateBasicPredictions = (needsAttention) => {
  // Generate predictions without AI (no tokens used)
  predictions.value = needsAttention.map(module => generateBasicPrediction(module))

  // Sort by urgency
  predictions.value.sort((a, b) => b.urgencyPercent - a.urgencyPercent)
}

const generateBasicPrediction = (module) => {
  let severity = 'info'
  let issue = ''
  let prediction = ''
  let action = ''
  let urgency = 50
  let timeframe = ''

  if (module.status === 'offline') {
    severity = 'critical'
    issue = 'Module is offline'
    prediction = 'Communication failure detected'
    action = 'Check power and network connection immediately'
    urgency = 95
    timeframe = 'Immediate attention required'
  } else if (module.timeSinceLastSeen > 1800000) { // 30 minutes
    severity = 'warning'
    issue = 'No data received for 30+ minutes'
    prediction = 'Module may go offline within 1 hour'
    action = 'Investigate connectivity issues'
    urgency = 75
    timeframe = 'Action needed within 1 hour'
  } else if (module.recentActivity < 5) {
    severity = 'warning'
    issue = 'Low data transmission rate'
    prediction = 'Performance degradation likely'
    action = 'Review sensor configuration and triggers'
    urgency = 60
    timeframe = 'Monitor closely'
  } else if (module.score < 60) {
    severity = 'warning'
    issue = 'Low performance score'
    prediction = 'Module reliability declining'
    action = 'Schedule maintenance check'
    urgency = 65
    timeframe = 'Action within 24 hours'
  } else {
    severity = 'info'
    issue = 'Minor performance variations'
    prediction = 'Proactive monitoring recommended'
    action = 'Continue monitoring, no immediate action'
    urgency = 40
    timeframe = 'Low priority'
  }

  return {
    umid: module.umid,
    moduleType: module.moduleType,
    severity,
    issue,
    prediction,
    recommendedAction: action,
    urgencyPercent: urgency,
    timeframe,
    score: module.score,
    lastSeen: module.lastSeen
  }
}

const getUrgencyColor = (severity) => {
  if (severity === 'critical') return 'linear-gradient(90deg, #dc2626, #ef4444)'
  if (severity === 'warning') return 'linear-gradient(90deg, #f59e0b, #fbbf24)'
  return 'linear-gradient(90deg, #3b82f6, #60a5fa)'
}

onMounted(() => {
  fetchPredictions()
})
</script>

<style scoped>
.predictive-maintenance {
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

.ai-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.ai-toggle-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-color: var(--primary);
  color: var(--primary);
}

.ai-toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-toggle-btn svg {
  width: 1rem;
  height: 1rem;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state svg {
  width: 3rem;
  height: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state span {
  font-size: 0.875rem;
}

.predictions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
  padding-right: 0.25rem;
}

/* Custom scrollbar */
.predictions-list::-webkit-scrollbar {
  width: 6px;
}

.predictions-list::-webkit-scrollbar-track {
  background: var(--bg);
  border-radius: 3px;
}

.predictions-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.predictions-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.prediction-card {
  background: var(--bg);
  border-radius: 0.625rem;
  padding: 1rem;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.prediction-card:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.prediction-card.critical {
  border-left: 3px solid #dc2626;
}

.prediction-card.warning {
  border-left: 3px solid #f59e0b;
}

.prediction-card.info {
  border-left: 3px solid #3b82f6;
}

.prediction-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}

.severity-badge {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.severity-badge.critical {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.severity-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.severity-badge.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.severity-badge svg {
  width: 1.125rem;
  height: 1.125rem;
}

.prediction-info h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.module-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.prediction-details {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 0.875rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 0.75rem;
  font-size: 0.813rem;
  align-items: start;
}

.detail-row.action-row {
  margin-top: 0.25rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--border);
}

.detail-label {
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.detail-value {
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-word;
}

.action-text {
  color: white;
  font-weight: 500;
  line-height: 1.5;
}

.prediction-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-bar {
  position: relative;
  width: 100%;
  height: 0.5rem;
  background: var(--border);
  border-radius: 0.25rem;
  overflow: hidden;
}

.timeline-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.timeline-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .predictions-list {
    max-height: 400px;
  }
}
</style>
