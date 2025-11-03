<template>
  <div class="logger-stats">
    <div class="stat-item">
      <span class="stat-icon success">●</span>
      <span class="stat-count">{{ successCount }}</span>
      <span class="stat-label">Data Received</span>
    </div>
    <div class="stat-item">
      <span class="stat-icon error">●</span>
      <span class="stat-count">{{ errorCount }}</span>
      <span class="stat-label">Errors</span>
    </div>
    <div class="stat-item">
      <span class="stat-icon warning">●</span>
      <span class="stat-count">{{ warningCount }}</span>
      <span class="stat-label">Warnings</span>
    </div>
    <div class="stat-item">
      <span class="stat-icon info">●</span>
      <span class="stat-count">{{ infoCount }}</span>
      <span class="stat-label">Info</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  successCount: {
    type: Number,
    required: true
  },
  errorCount: {
    type: Number,
    required: true
  },
  warningCount: {
    type: Number,
    required: true
  },
  infoCount: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.logger-stats {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.813rem;
}

.stat-icon {
  font-size: 0.75rem;
  animation: pulse 2s ease-in-out infinite;
}

.stat-icon.error {
  color: #ef4444;
}

.stat-icon.warning {
  color: #f59e0b;
}

.stat-icon.info {
  color: #3b82f6;
}

.stat-icon.success {
  color: #22c55e;
}

.stat-count {
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .logger-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
