import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dataPath = path.join(process.cwd(), 'server', 'data', 'modules.json')
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

    // Filter only cutoff modules
    const cutoffModules = data.modules.filter(m => m.isCutoffModule === true)

    return {
      success: true,
      cutoffModules,
      total: cutoffModules.length
    }
  } catch (error) {
    console.error('Error reading cutoff modules:', error)
    return {
      success: false,
      error: error.message,
      cutoffModules: []
    }
  }
})
