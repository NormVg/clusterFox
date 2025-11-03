<template>
  <NuxtLayout>
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
              <polyline points="7.5 19.79 7.5 14.6 3 12"/>
              <polyline points="21 12 16.5 14.6 16.5 19.79"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div>
            <h1>System Intelligence</h1>
            <p>Predictive insights and advanced analytics for your IoT network</p>
          </div>
        </div>
      </div>

      <div class="intelligence-grid">
        <!-- AI Insights - Featured at top -->
        <div class="grid-item full-width featured">
          <AIInsightsCard />
        </div>

        <!-- Module Performance Scoreboard -->
        <div class="grid-item full-width">
          <PerformanceScoreboard />
        </div>

        <!-- Predictive Maintenance & Data Quality side by side -->
        <div class="grid-item half-width">
          <PredictiveMaintenanceCard />
        </div>

        <div class="grid-item half-width">
          <DataQualityMetrics />
        </div>

        <!-- Trigger Effectiveness Chart -->
        <div class="grid-item full-width">
          <TriggerEffectivenessChart />
        </div>

        <!-- Network Resilience -->
        <div class="grid-item full-width">
          <NetworkResilienceCard />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
// Components auto-imported by Nuxt
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: hidden;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-icon svg {
  width: 2rem;
  height: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.page-header p {
  font-size: 0.938rem;
  color: var(--text-secondary);
  margin: 0;
}

.intelligence-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.grid-item {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.grid-item.full-width {
  grid-column: 1 / -1;
}

.grid-item.half-width {
  grid-column: span 1;
}

.grid-item.featured {
  position: relative;
  overflow: visible;
}

.grid-item.featured::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1);
  border-radius: 0.875rem;
  z-index: -1;
  opacity: 0.3;
  animation: gradient-shift 3s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@media (max-width: 968px) {
  .intelligence-grid {
    grid-template-columns: 1fr;
  }

  .grid-item.half-width {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
}
</style>
