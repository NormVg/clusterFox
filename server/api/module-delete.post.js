import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { appendLog } from '../utils/logger.js'

const MODULES_DB_PATH = join(process.cwd(), 'server', 'data', 'modules.json')

// Read database
function readDatabase() {
  try {
    if (!existsSync(MODULES_DB_PATH)) {
      return { modules: [] }
    }
    const data = readFileSync(MODULES_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { modules: [] }
  }
}

// Write database
function writeDatabase(data) {
  try {
    writeFileSync(MODULES_DB_PATH, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing database:', error)
    return false
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { umid } = body

    if (!umid) {
      return {
        success: false,
        message: 'Module UMID is required'
      }
    }

    const db = readDatabase()

    // Find module
    const moduleIndex = db.modules.findIndex(m => m.umid === umid)

    if (moduleIndex === -1) {
      return {
        success: false,
        message: 'Module not found'
      }
    }

    const module = db.modules[moduleIndex]

    // Remove module
    db.modules.splice(moduleIndex, 1)

    // Save to database
    if (writeDatabase(db)) {
      appendLog({
        type: 'module_deleted',
        moduleUmid: umid,
        moduleName: module.name || umid,
        message: `Module ${module.name || umid} (${umid}) deleted`,
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        message: 'Module deleted successfully',
        umid
      }
    } else {
      return {
        success: false,
        message: 'Failed to save changes'
      }
    }

  } catch (error) {
    console.error('Delete module error:', error)
    return {
      success: false,
      message: error.message || 'Failed to delete module'
    }
  }
})
