<template>
  <section class="card">
    <h2 class="card-title">System Overview</h2>
    <div class="overview-list">
      <div
        v-for="(item, index) in overviewItems"
        :key="item.label"
        class="overview-item"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <span class="overview-label">{{ item.label }}</span>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: item.value }"
            :data-value="item.value"
          ></div>
        </div>
        <span class="overview-value">{{ item.value }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const overviewItems = ref([
  { label: 'CPU Usage', value: '68%' },
  { label: 'Memory', value: '45%' },
  { label: 'Storage', value: '82%' }
])
</script>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.overview-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.overview-item {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: 1rem;
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.overview-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.overview-item:hover .overview-label {
  color: var(--text-primary);
}

.progress-bar {
  height: 8px;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent));
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  animation: progressLoad 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.overview-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.overview-item:hover .overview-value {
  transform: translateX(3px);
  color: var(--accent);
}

.overview-item:hover .progress-fill {
  filter: brightness(1.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progressLoad {
  from {
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    transform: scaleX(1);
    transform-origin: left;
  }
}

@media (max-width: 480px) {
  .overview-item {
    grid-template-columns: 70px 1fr 45px;
    gap: 0.75rem;
  }
}
</style>
