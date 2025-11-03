<template>
  <div class="chart-controls">
    <select
      :value="selectedDataField"
      @change="handleFieldChange($event.target.value)"
      class="field-select"
      :disabled="availableFields.length === 0"
    >
      <option value="">Select a field...</option>
      <option v-for="field in availableFields" :key="field" :value="field">
        {{ formatFieldName(field) }}
      </option>
    </select>

    <select
      :value="timeRange"
      @change="handleRangeChange($event.target.value)"
      class="time-select"
    >
      <option value="10">Last 10 readings</option>
      <option value="25">Last 25 readings</option>
      <option value="50">Last 50 readings</option>
      <option value="100">Last 100 readings</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  selectedDataField: {
    type: String,
    required: true
  },
  timeRange: {
    type: String,
    required: true
  },
  availableFields: {
    type: Array,
    required: true
  },
  formatFieldName: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:selectedDataField', 'update:timeRange', 'fieldChange', 'rangeChange'])

const handleFieldChange = (value) => {
  console.log('🎯 Field changed to:', value)
  emit('update:selectedDataField', value)
  emit('fieldChange')
}

const handleRangeChange = (value) => {
  console.log('📊 Range changed to:', value)
  emit('update:timeRange', value)
  emit('rangeChange')
}
</script>

<style scoped>
.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.field-select,
.module-select,
.time-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-primary);
  font-size: 0.813rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.field-select:hover,
.module-select:hover,
.time-select:hover {
  border-color: var(--accent);
}

.field-select:focus,
.module-select:focus,
.time-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
  }

  .field-select,
  .module-select,
  .time-select {
    width: 100%;
  }
}
</style>
