<template>
  <div class="trigger-effectiveness">
    <div class="header">
      <div class="header-content">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div>
          <h3>Trigger Effectiveness</h3>
          <p>Analyze trigger performance and get recommendations</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const loading = ref(true)
const stats = ref([])

const fetchStats = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/trigger-stats')
    if (response.success) {
      stats.value = response.stats
    }
  } catch (error) {
    console.error('Error fetching trigger stats:', error)
  } finally {
    loading.value = false
  }
}

const chartData = computed(() => ({
  labels: stats.value.map(s => s.moduleType),
  datasets: [
    {
      label: 'Total Triggers',
      data: stats.value.map(s => s.totalTriggers),
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1
    },
    {
      label: 'Active Triggers',
      data: stats.value.map(s => s.activeTriggers),
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#9ca3af',
        font: { size: 12 }
      }
    },
    title: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#9ca3af',
        font: { size: 11 }
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    },
    x: {
      ticks: {
        color: '#9ca3af',
        font: { size: 11 }
      },
      grid: {
        display: false
      }
    }
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.trigger-effectiveness {
  background: var(--surface);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.header-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.header-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.chart-container {
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: 350px;
  padding: 1rem;
  background: var(--bg);
  border-radius: 0.5rem;
  box-sizing: border-box;
}
</style>
