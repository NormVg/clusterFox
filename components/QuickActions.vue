<template>
  <section class="card actions">
    <h2 class="card-title">Quick Actions</h2>
    <div class="action-list">
      <button
        v-for="(action, index) in actions"
        :key="action.id"
        class="action-btn"
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="handleAction(action.id)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="action.icon"></svg>
        {{ action.label }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const actions = ref([
  {
    id: 'create',
    label: 'Create New',
    icon: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
  },
  {
    id: 'upload',
    label: 'Upload File',
    icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'
  },
  {
    id: 'export',
    label: 'Export Data',
    icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>'
  }
])

const handleAction = (actionId) => {
  console.log(`Action clicked: ${actionId}`)
  // Add ripple effect
  const button = event.currentTarget
  const ripple = document.createElement('span')
  ripple.classList.add('ripple')
  button.appendChild(ripple)
  setTimeout(() => ripple.remove(), 600)
}
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

.action-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.875rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.4s ease backwards;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  background: var(--bg);
  border-color: var(--text-tertiary);
  transform: translateX(4px);
}

.action-btn:active {
  transform: translateX(4px) scale(0.98);
}

.action-btn svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.action-btn:hover svg {
  transform: rotate(5deg) scale(1.1);
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

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
