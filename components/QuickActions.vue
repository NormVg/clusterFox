<template>
  <section class="card actions">
    <h2 class="card-title">Quick Actions</h2>
    <div class="action-list">
      <button
        v-for="(action, index) in actions"
        :key="action.id"
        class="action-btn"
        :class="{ 'danger': action.danger, 'loading': action.id === 'reset' && isResetting }"
        :style="{ animationDelay: `${index * 0.1}s` }"
        :disabled="action.id === 'reset' && isResetting"
        @click="handleAction(action.id)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="action.icon"></svg>
        {{ action.id === 'reset' && isResetting ? 'Resetting...' : action.label }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const actions = ref([
  {
    id: 'refresh',
    label: 'Refresh All Data',
    icon: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'
  },
  {
    id: 'export',
    label: 'Export Data (JSON)',
    icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'
  },
  {
    id: 'view-api',
    label: 'View API Docs',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'
  },
  {
    id: 'reset',
    label: 'Reset Database',
    icon: '<polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>',
    danger: true
  }
])

const isResetting = ref(false)

const handleAction = async (actionId) => {
  console.log(`Action clicked: ${actionId}`)

  // Handle refresh action
  if (actionId === 'refresh') {
    window.location.reload()
    return
  }

  // Handle export data action
  if (actionId === 'export') {
    try {
      // Fetch all data
      const [modulesRes, sensorDataRes] = await Promise.all([
        fetch('/api/modules'),
        fetch('/api/sensor-data?limit=1000')
      ])

      const modules = await modulesRes.json()
      const sensorData = await sensorDataRes.json()

      // Create export object
      const exportData = {
        exportDate: new Date().toISOString(),
        modules: modules.modules || [],
        sensorData: sensorData.data || [],
        stats: {
          totalModules: modules.count || 0,
          totalDataPoints: sensorData.total || 0
        }
      }

      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clusterfox-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('✅ Data exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('❌ Error exporting data: ' + error.message)
    }
    return
  }

  // Handle view API docs action
  if (actionId === 'view-api') {
    window.location.href = '/api-docs'
    return
  }

  // Handle reset database action
  if (actionId === 'reset') {
    if (!confirm('⚠️ Are you sure you want to reset the entire database? This will delete all modules and sensor data. This action cannot be undone!')) {
      return
    }

    try {
      isResetting.value = true
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Database reset successfully!')
        window.location.reload()
      } else {
        alert('❌ Failed to reset database: ' + data.message)
      }
    } catch (error) {
      console.error('Error resetting database:', error)
      alert('❌ Error resetting database: ' + error.message)
    } finally {
      isResetting.value = false
    }
    return
  }

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

.action-btn.danger {
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.action-btn.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.loading svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
