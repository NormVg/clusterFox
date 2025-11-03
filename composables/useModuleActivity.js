import { ref, computed } from 'vue'

export function useModuleActivity() {
  // State
  const modules = ref([])
  const loading = ref(true)

  // Fetch modules
  const fetchModules = async () => {
    try {
      loading.value = true
      const response = await fetch('/api/modules')
      const result = await response.json()

      if (result.success) {
        modules.value = result.modules
        console.log('📊 Loaded modules for activity analysis:', modules.value.length)
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      loading.value = false
    }
  }

  // Count modules by status
  const statusCounts = computed(() => {
    const counts = {
      active: 0,
      inactive: 0,
      offline: 0,
      emergency: 0
    }

    modules.value.forEach(module => {
      if (counts[module.status] !== undefined) {
        counts[module.status]++
      }
    })

    console.log('📈 Status counts:', counts)
    return counts
  })

  // Total modules
  const totalModules = computed(() => modules.value.length)

  // Active percentage
  const activePercentage = computed(() => {
    if (totalModules.value === 0) return 0
    return Math.round((statusCounts.value.active / totalModules.value) * 100)
  })

  // Get modules by status
  const getModulesByStatus = (status) => {
    return modules.value.filter(m => m.status === status)
  }

  // Get activity timeline (last seen times)
  const activityTimeline = computed(() => {
    return modules.value
      .map(m => ({
        umid: m.umid,
        status: m.status,
        lastSeen: m.lastSeen,
        dataCount: m.dataCount
      }))
      .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
  })

  // Get module type distribution
  const moduleTypeDistribution = computed(() => {
    const types = {}
    modules.value.forEach(module => {
      const type = module.moduleType || 'unknown'
      types[type] = (types[type] || 0) + 1
    })
    return types
  })

  return {
    // State
    modules,
    loading,

    // Computed
    statusCounts,
    totalModules,
    activePercentage,
    activityTimeline,
    moduleTypeDistribution,

    // Methods
    fetchModules,
    getModulesByStatus
  }
}
