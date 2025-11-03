import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'
import { appendLog } from '../utils/logger.js'

const DB_PATH = join(process.cwd(), 'server', 'data', 'modules.json')

// Generate session ID
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex')
}

// Initialize database file if it doesn't exist
function initDatabase() {
  const dir = join(process.cwd(), 'server', 'data')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ modules: [] }, null, 2))
  }
}

// Read database
function readDatabase() {
  try {
    initDatabase()
    const data = readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { modules: [] }
  }
}

// Write database
function writeDatabase(data) {
  try {
    initDatabase()
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing database:', error)
    return false
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const { umid, name, poolId, sensors = [], isCutoffModule = false, cutoffActive = false } = body

    if (!umid || !name || !poolId) {
      return {
        success: false,
        message: 'Missing required fields: umid, name, poolId'
      }
    }

    const db = readDatabase()

    // Check if module already exists
    const existingIndex = db.modules.findIndex(m => m.umid === umid)

    // Determine module type
    let moduleType = 'unknown'
    let typeComponents = []

    if (isCutoffModule) {
      moduleType = 'cutoff-relay'
      typeComponents = ['cutoff', 'relay']
    } else if (sensors && sensors.length > 0) {
      // Build type from sensors
      typeComponents = sensors.map(s => s.type).filter(Boolean)
      moduleType = typeComponents.join('-') || 'sensor-module'
    }

    const moduleData = {
      umid,
      name,
      poolId,
      moduleType,
      typeComponents,
      sensors: sensors || [],
      isCutoffModule: isCutoffModule || false,
      cutoffActive: cutoffActive || false,
      sessionId: generateSessionId(),
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: 'online',
      dataCount: 0
    }

    if (existingIndex >= 0) {
      // Update existing module
      db.modules[existingIndex] = {
        ...db.modules[existingIndex],
        ...moduleData,
        dataCount: db.modules[existingIndex].dataCount || 0 // Preserve data count
      }

      appendLog({
        type: 'module_reconnected',
        moduleUmid: umid,
        moduleName: name,
        message: `Module ${name} (${umid}) reconnected`,
        timestamp: new Date().toISOString()
      })
    } else {
      // Add new module
      db.modules.push(moduleData)

      appendLog({
        type: 'module_registered',
        moduleUmid: umid,
        moduleName: name,
        message: `Module ${name} (${umid}) registered successfully${isCutoffModule ? ' as cutoff module' : ''}`,
        timestamp: new Date().toISOString()
      })
    }

    writeDatabase(db)

    return {
      success: true,
      message: existingIndex >= 0 ? 'Module reconnected' : 'Module registered successfully',
      module: moduleData
    }

  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      message: error.message || 'Registration failed'
    }
  }
})
