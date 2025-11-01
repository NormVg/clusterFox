<template>
  <section class="card">
    <h2 class="card-title">Recent Activity</h2>
    <div class="activity-list">
      <div
        v-for="(activity, index) in activities"
        :key="activity.id"
        class="activity"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="activity-dot" :class="activity.type"></div>
        <div class="activity-content">
          <div class="activity-title">{{ activity.title }}</div>
          <div class="activity-time">{{ activity.time }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const activities = ref([
  { id: 1, type: 'success', title: 'New user registered', time: '2 minutes ago' },
  { id: 2, type: 'info', title: 'System backup completed', time: '15 minutes ago' },
  { id: 3, type: 'warning', title: 'High memory usage detected', time: '1 hour ago' },
  { id: 4, type: 'success', title: 'Database optimized', time: '3 hours ago' },
  { id: 5, type: 'info', title: 'Security scan completed', time: '5 hours ago' }
])
</script>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  animation: fadeInScale 0.4s ease;
}

.card-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInLeft 0.4s ease backwards;
}

.activity:hover {
  background: var(--bg);
  transform: translateX(4px);
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.5rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  position: relative;
}

.activity-dot::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.activity:hover .activity-dot {
  transform: scale(1.3);
}

.activity-dot.success {
  background: var(--success);
}

.activity-dot.success::after {
  background: var(--success);
}

.activity-dot.warning {
  background: var(--warning);
}

.activity-dot.warning::after {
  background: var(--warning);
}

.activity-dot.info {
  background: var(--info);
}

.activity-dot.info::after {
  background: var(--info);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  transition: color 0.2s ease;
}

.activity:hover .activity-title {
  color: var(--accent);
}

.activity-time {
  font-size: 0.813rem;
  color: var(--text-secondary);
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
