import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { cutoffModuleUmid, action, triggeredBy } = body // action: 'activate' or 'deactivate'

    const modulesPath = path.join(process.cwd(), 'server', 'data', 'modules.json')
    const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf-8'))

    // Find the cutoff module
    const cutoffModule = modulesData.modules.find(m => m.umid === cutoffModuleUmid)

    if (!cutoffModule) {
      return {
        success: false,
        error: 'Cutoff module not found'
      }
    }

    if (!cutoffModule.isCutoffModule) {
      return {
        success: false,
        error: 'Module is not a cutoff module'
      }
    }

    // Update cutoff module status
    cutoffModule.cutoffActive = action === 'activate'
    cutoffModule.lastTriggeredAt = new Date().toISOString()
    cutoffModule.triggeredBy = triggeredBy || 'manual'
    cutoffModule.lastSeen = new Date().toISOString() // Update lastSeen for status tracking

    // Save modules
    fs.writeFileSync(modulesPath, JSON.stringify(modulesData, null, 2))

    console.log(`[CUTOFF] Module ${cutoffModuleUmid} ${action === 'activate' ? 'ACTIVATED' : 'DEACTIVATED'} by ${triggeredBy || 'manual'}`)

    return {
      success: true,
      message: `Cutoff module ${action}d successfully`,
      cutoffModule
    }
  } catch (error) {
    console.error('Error triggering cutoff module:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
