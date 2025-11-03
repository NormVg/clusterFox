// Composable for managing Chart.js instance
import { ref, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export const useChart = () => {
  const chartCanvas = ref(null)
  const chartInstance = ref(null)

  const chartConfig = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Active Modules',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.3)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Inactive Modules',
          data: [],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.3)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Offline Modules',
          data: [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 11, family: "'Inter', sans-serif" },
            color: '#9ca3af'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 11 },
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
            color: '#9ca3af',
            font: { size: 10 }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            maxRotation: 0,
            autoSkipPadding: 20,
            color: '#9ca3af',
            font: { size: 10 }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    }
  }

  const initChart = () => {
    if (!chartCanvas.value) {
      console.error('❌ Canvas element not found')
      return false
    }

    try {
      const ctx = chartCanvas.value.getContext('2d')
      if (!ctx) {
        console.error('❌ Failed to get 2d context')
        return false
      }

      chartInstance.value = new Chart(ctx, chartConfig)
      console.log('✅ Chart initialized successfully')
      return true
    } catch (error) {
      console.error('❌ Error creating chart:', error)
      return false
    }
  }

  const addDataPoint = (stats) => {
    if (!chartInstance.value) {
      console.warn('⚠️ Chart instance not available')
      return
    }

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    chartInstance.value.data.labels.push(timestamp)
    chartInstance.value.data.datasets[0].data.push(stats.active)
    chartInstance.value.data.datasets[1].data.push(stats.inactive)
    chartInstance.value.data.datasets[2].data.push(stats.offline)

    // Keep only last 30 data points
    const maxPoints = 30
    if (chartInstance.value.data.labels.length > maxPoints) {
      chartInstance.value.data.labels.shift()
      chartInstance.value.data.datasets[0].data.shift()
      chartInstance.value.data.datasets[1].data.shift()
      chartInstance.value.data.datasets[2].data.shift()
    }

    chartInstance.value.update('active')
    console.log('📊 Chart updated:', timestamp, stats)
  }

  onUnmounted(() => {
    if (chartInstance.value) {
      chartInstance.value.destroy()
    }
  })

  return {
    chartCanvas,
    chartInstance,
    initChart,
    addDataPoint
  }
}
