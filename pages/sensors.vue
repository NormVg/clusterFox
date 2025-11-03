<template>
  <NuxtLayout>
    <div class="page-container">
      <div class="page-header">
        <h1>Sensor Data</h1>
        <p>Real-time sensor data from all modules</p>
      </div>

      <DataLogger />
    </div>
  </NuxtLayout>
</template>

<script setup>
import DataLogger from '~/components/DataLogger.vue'
</script>

<style scoped>
.page-container {
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
</style>
