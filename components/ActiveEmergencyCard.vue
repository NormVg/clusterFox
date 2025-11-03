<template>
  <div class="stat emergency-card" :class="{ active: isActive, idle: !isActive }">
    <div class="card-head">
      <div class="icon" :class="{ pulse: isActive }">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12" y2="17"/>
        </svg>
      </div>
      <div class="meta">
        <div class="label">Active Emergency</div>
        <div class="sub" :class="{ danger: isActive }">{{ subtitle }}</div>
      </div>
    </div>
    <div class="value">{{ displayCount }}</div>
  </div>
  
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  count: { type: Number, default: 0 },
  message: { type: String, default: '' }
})

const isActive = computed(() => props.count > 0)
const displayCount = computed(() => props.count.toString())
const subtitle = computed(() => props.message || (isActive.value ? 'Attention required' : 'All clear'))
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

.emergency-card.active {
  border-color: #ef4444;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15);
}

.card-head {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.25rem;
}

.icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.idle .icon {
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.icon.pulse {
  animation: pulse 1.8s ease-in-out infinite;
}

.meta {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.sub {
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.sub.danger {
  color: #ef4444;
}

.value {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.25); }
  50% { transform: scale(1.03); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

