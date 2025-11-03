import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const MODULES_DB_PATH = join(process.cwd(), 'server', 'data', 'modules.json')

// Read modules database
function readModulesDatabase() {
  try {
    if (!existsSync(MODULES_DB_PATH)) {
      return { modules: [] }
    }
    const data = readFileSync(MODULES_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Modules PUT] Error reading database:', error)
    return { modules: [] }
  }
}

// Write modules database
function writeModulesDatabase(data) {
  try {
    writeFileSync(MODULES_DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('[Modules PUT] Error writing database:', error)
    return false
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { umid, triggers } = body

    if (!umid) {
      return {
        success: false,
        error: 'Missing umid'
      }
    }

    const db = readModulesDatabase()
    const moduleIndex = db.modules.findIndex(m => m.umid === umid)

    if (moduleIndex === -1) {
      return {
        success: false,
        error: 'Module not found'
      }
    }

    // Update triggers
    if (triggers) {
      db.modules[moduleIndex].triggers = triggers
    }

    // Save to database
    if (writeModulesDatabase(db)) {
      console.log(`[Modules PUT] Updated triggers for module: ${umid}`)
      return {
        success: true,
        module: db.modules[moduleIndex]
      }
    } else {
      return {
        success: false,
        error: 'Failed to save changes'
      }
    }
  } catch (error) {
    console.error('[Modules PUT] Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
