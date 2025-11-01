<template>
  <div class="stat" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-change" :class="changeType">{{ change }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  label: String,
  value: String,
  change: String,
  changeType: {
    type: String,
    default: 'positive'
  }
})

const isHovered = ref(false)
</script>

<style scoped>
.stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.4s ease;
}

.stat:hover {
  border-color: var(--text-tertiary);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  transition: color 0.2s ease;
}

.stat:hover .stat-label {
  color: var(--text-primary);
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
}

.stat:hover .stat-value {
  transform: scale(1.05);
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.stat-change.positive {
  color: var(--success);
}

.stat-change.negative {
  color: var(--warning);
}

.stat:hover .stat-change {
  transform: translateX(2px);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
