<template>
  <div
    class="log-entry"
    :class="log.type"
    :style="{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }"
    @click="toggleExpand"
  >
    <div class="log-header">
      <span class="log-icon" :class="log.type">
        <svg v-if="log.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <svg v-else-if="log.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <svg v-else-if="log.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </span>
      <span class="log-timestamp">{{ log.timestamp }}</span>
      <span class="log-message">{{ log.message }}</span>
      <span v-if="log.details" class="expand-icon" :class="{ 'expanded': isExpanded }">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </span>
    </div>
    <div v-if="log.details && isExpanded" class="log-details">
      <pre>{{ log.details }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  log: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

const isExpanded = ref(false)

const toggleExpand = () => {
  if (props.log.details) {
    isExpanded.value = !isExpanded.value
  }
}
</script>

<style scoped>
.log-entry {
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  animation: slideInLeft 0.3s ease backwards;
}

.log-entry:hover {
  background: var(--bg);
}

.log-entry.error {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.log-entry.warning {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.log-entry.info {
  border-left-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.log-entry.success {
  border-left-color: #22c55e;
  background: rgba(34, 197, 94, 0.05);
}

.log-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.log-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-icon.error {
  color: #ef4444;
}

.log-icon.warning {
  color: #f59e0b;
}

.log-icon.info {
  color: #3b82f6;
}

.log-icon.success {
  color: #22c55e;
}

.log-timestamp {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.log-message {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
}

.expand-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.log-details {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 6px;
  animation: expandDown 0.2s ease;
}

.log-details pre {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  line-height: 1.5;
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

@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}
</style>
