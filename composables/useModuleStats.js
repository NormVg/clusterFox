// Composable for managing module statistics
import { ref, computed } from 'vue'

export const useModuleStats = () => {
  const modules = ref([])
  const previousStatuses = ref(new Map())

  const stats = computed(() => {
    const active = modules.value.filter(m => m.status === 'active').length
    const inactive = modules.value.filter(m => m.status === 'inactive').length
    const offline = modules.value.filter(m => m.status === 'offline').length

    return {
      active,
      inactive,
      offline,
      total: modules.value.length
    }
  })

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/modules?_t=${Date.now()}`)
      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} ${response.statusText}`)
        return false
      }

      const data = await response.json()
      if (data.success && data.modules) {
        modules.value = data.modules
        trackStatusChanges(data.modules)
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Error fetching modules:', error)
      return false
    }
  }

  const trackStatusChanges = (moduleList) => {
    moduleList.forEach(module => {
      const previousStatus = previousStatuses.value.get(module.umid)
      if (previousStatus && previousStatus !== module.status) {
        console.log(`🔄 Status changed: ${module.umid} ${previousStatus} → ${module.status}`)
      }
      previousStatuses.value.set(module.umid, module.status)
    })
  }

  return {
    modules,
    stats,
    fetchModules
  }
}
