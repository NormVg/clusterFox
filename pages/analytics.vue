<template>
  <NuxtLayout>
    <div class="page-container">
      <div class="page-header">
        <h1>Analytics</h1>
        <p>Real-time insights and trends from your IoT network</p>
      </div>

      <div class="analytics-grid">
        <!-- System Health Overview -->
        <div class="grid-item full-width">
          <SystemHealth />
        </div>

        <!-- Real-time Sensor Data Chart -->
        <div class="grid-item full-width">
          <RealtimeChart
            title="Sensor Readings Over Time"
            dataKey="value"
          />
        </div>


        <!-- Emergency Analytics Chart -->
        <div class="grid-item full-width">
          <EmergencyAnalyticsChart />
        </div>
        <br>
        <!-- Data Entry Rate Chart -->
        <div class="grid-item full-width">
          <DataEntryRateChart />
        </div>

        <!-- Module Activity Status Chart -->
        <div class="grid-item full-width">
          <ModuleActivityChart />
        </div>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
// Components are auto-imported in Nuxt 3
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

.analytics-grid {
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

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
