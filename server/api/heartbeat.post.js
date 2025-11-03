import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'server', 'data', 'modules.json')

function readDatabase() {
  try {
    if (!existsSync(DB_PATH)) {
      return { modules: [] }
    }
    const data = readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Heartbeat] Error reading database:', error)
    return { modules: [] }
  }
}

function writeDatabase(data) {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('[Heartbeat] Error writing database:', error)
    return false
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { umid, sessionId } = body

    if (!umid) {
      return {
        success: false,
        error: 'Missing required field: umid'
      }
    }

    const db = readDatabase()

    // Find module by umid or sessionId
    const moduleIndex = db.modules.findIndex(m =>
      m.umid === umid || (sessionId && m.sessionId === sessionId)
    )

    if (moduleIndex === -1) {
      return {
        success: false,
        error: 'Module not found',
        message: `No module found with UMID: ${umid}`
      }
    }

    // Update lastSeen timestamp
    db.modules[moduleIndex].lastSeen = new Date().toISOString()

    // Save database
    if (writeDatabase(db)) {
      console.log(`[Heartbeat] ${umid} - lastSeen updated`)

      return {
        success: true,
        message: 'Heartbeat received',
        module: {
          umid: db.modules[moduleIndex].umid,
          lastSeen: db.modules[moduleIndex].lastSeen,
          status: 'active'
        }
      }
    } else {
      return {
        success: false,
        error: 'Failed to update database'
      }
    }

  } catch (error) {
    console.error('[Heartbeat] Error:', error)
    return {
      success: false,
      error: error.message || 'Heartbeat failed'
    }
  }
})
