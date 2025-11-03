import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dataDir = path.join(process.cwd(), 'server', 'data')
    const modulesData = JSON.parse(await fs.readFile(path.join(dataDir, 'modules.json'), 'utf-8'))

    const modules = modulesData.modules || []

    // Group by module type and count triggers
    const typeStats = {}

    modules.forEach(module => {
      const type = module.moduleType
      if (!typeStats[type]) {
        typeStats[type] = {
          moduleType: type,
          totalTriggers: 0,
          activeTriggers: 0,
          moduleCount: 0
        }
      }

      typeStats[type].moduleCount++

      if (module.triggers) {
        Object.values(module.triggers).forEach(trigger => {
          typeStats[type].totalTriggers++
          if (trigger.enabled) {
            typeStats[type].activeTriggers++
          }
        })
      }
    })

    const stats = Object.values(typeStats)

    return {
      success: true,
      stats
    }
  } catch (error) {
    console.error('Error fetching trigger stats:', error)
    return {
      success: false,
      error: error.message,
      stats: []
    }
  }
})
