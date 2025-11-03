import { readFileSync, writeFileSync, existsSync } from 'fs'
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
    const { mkdirSync } = require('fs')
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

export default defineEventHandler((event) => {
  const query = getQuery(event)

  // Get module type and umid from query
  const moduleType = query.type || query['module-type'] || query.moduletype
  const umid = query.umid

  // ========================================
  // VALIDATION CHECKS
  // ========================================

  // 1. Check if moduleType is provided
  if (!moduleType) {
    return {
      success: false,
      error: 'Missing required parameter: type',
      message: 'Please provide module type (e.g., ?type=temperature-sensor)',
      code: 'MISSING_TYPE'
    }
  }

  // 2. Check if umid is provided
  if (!umid) {
    return {
      success: false,
      error: 'Missing required parameter: umid',
      message: 'Please provide unique module ID (e.g., ?umid=ESP32-ABC123)',
      code: 'MISSING_UMID'
    }
  }

  // 3. Validate moduleType format (alphanumeric and hyphens only)
  const typeRegex = /^[a-zA-Z0-9\-]+$/
  if (!typeRegex.test(moduleType)) {
    return {
      success: false,
      error: 'Invalid module type format',
      message: 'Module type must contain only letters, numbers, and hyphens',
      code: 'INVALID_TYPE_FORMAT'
    }
  }

  // 4. Validate umid format (alphanumeric, hyphens, and underscores)
  const umidRegex = /^[a-zA-Z0-9\-_]+$/
  if (!umidRegex.test(umid)) {
    return {
      success: false,
      error: 'Invalid UMID format',
      message: 'UMID must contain only letters, numbers, hyphens, and underscores',
      code: 'INVALID_UMID_FORMAT'
    }
  }

  // 5. Check length constraints
  if (moduleType.length > 100) {
    return {
      success: false,
      error: 'Module type too long',
      message: 'Module type must be 100 characters or less',
      code: 'TYPE_TOO_LONG'
    }
  }

  if (umid.length > 200) {
    return {
      success: false,
      error: 'UMID too long',
      message: 'UMID must be 200 characters or less',
      code: 'UMID_TOO_LONG'
    }
  }

  // Read current database
  const db = readDatabase()

  // Check if module with this UMID already exists
  const existingModule = db.modules.find(m => m.umid === umid)

  if (existingModule) {
    // Generate new session ID for existing module
    const newSessionId = generateSessionId()
    existingModule.session_id = newSessionId
    existingModule.sessionCreatedAt = new Date().toISOString()
    existingModule.lastSeen = new Date().toISOString()

    // Update database with new session
    writeDatabase(db)

    // Log the re-registration
    appendLog({
      type: 'info',
      message: `🔄 [${existingModule.umid}] Module re-registered (new session)`,
      details: JSON.stringify({
        'Module UMID': existingModule.umid,
        'Module Type': existingModule.moduleType,
        'Type Components': existingModule.typeComponents,
        'Originally Registered': existingModule.registeredAt,
        'New Session Created': existingModule.sessionCreatedAt,
        'Session ID': newSessionId.substring(0, 16) + '...',
        'Status': 'Re-registered'
      }, null, 2),
      rawData: existingModule
    }).catch((logError) => {
      console.error('❌ Failed to log re-registration:', logError.message)
    })

    return {
      success: true,
      message: 'Module already registered',
      session_id: newSessionId,
      umid: existingModule.umid,
      moduleType: existingModule.moduleType,
      registeredAt: existingModule.registeredAt,
      status: 'existing'
    }
  }

  // Parse module type (split by "-")
  const typeComponents = moduleType.split('-')

  // Generate unique session ID
  const sessionId = generateSessionId()

  // Create new module entry
  const newModule = {
    session_id: sessionId,
    umid: umid,
    moduleType: moduleType,
    typeComponents: typeComponents,
    registeredAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    status: 'active',
    dataCount: 0,
    sessionCreatedAt: new Date().toISOString()
  }

  // Add to database
  db.modules.push(newModule)

  // Write to file
  const writeSuccess = writeDatabase(db)

  if (!writeSuccess) {
    return {
      success: false,
      error: 'Failed to write to database',
      message: 'Could not save module registration'
    }
  }

  // Log the new registration
  console.log('📝 Logging new module registration:', umid)
  appendLog({
    type: 'info',
    message: `✨ [${umid}] New module registered: ${moduleType}`,
    details: JSON.stringify({
      'Module UMID': umid,
      'Module Type': moduleType,
      'Type Components': typeComponents,
      'Registered At': newModule.registeredAt,
      'Session ID': sessionId.substring(0, 16) + '...',
      'Initial Status': 'active',
      'Status': 'New Registration'
    }, null, 2),
    rawData: newModule
  }).then(() => {
    console.log('✅ Registration log created for:', umid)
  }).catch((logError) => {
    console.error('❌ Failed to log registration:', logError.message)
  })

  // Return success response with session ID
  return {
    success: true,
    message: 'Module registered successfully',
    session_id: sessionId,
    umid: umid,
    moduleType: moduleType,
    typeComponents: typeComponents,
    registeredAt: newModule.registeredAt,
    status: 'new'
  }
})
