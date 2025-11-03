<template>
  <div class="header-actions">
    <button
      class="filter-btn"
      :class="{ 'active': modelValue === 'all' }"
      @click="$emit('update:modelValue', 'all')"
    >
      All
    </button>
    <button
      class="filter-btn"
      :class="{ 'active': modelValue === 'error' }"
      @click="$emit('update:modelValue', 'error')"
    >
      Errors
    </button>
    <button
      class="filter-btn"
      :class="{ 'active': modelValue === 'warning' }"
      @click="$emit('update:modelValue', 'warning')"
    >
      Warnings
    </button>
    <button
      class="filter-btn"
      :class="{ 'active': modelValue === 'info' }"
      @click="$emit('update:modelValue', 'info')"
    >
      Info
    </button>
    <button class="action-btn" @click="$emit('export')" title="Export logs to JSON">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </button>
    <button class="action-btn danger" @click="$emit('clear')" title="Clear all logs">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    </button>
    <button class="action-btn" @click="$emit('refresh')" :disabled="isLoading" title="Refresh data">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue', 'export', 'clear', 'refresh'])
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.813rem;
  font-weight: 500;
  font-family: inherit;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--bg);
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--accent);
  color: var(--surface);
  border-color: var(--accent);
}

.action-btn {
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg);
  color: var(--text-primary);
  transform: scale(1.05);
}

.action-btn.danger {
  border-color: #ef4444;
  color: #ef4444;
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:disabled:hover {
  transform: none;
}
</style>
