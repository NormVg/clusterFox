import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { appendLog } from '../utils/logger.js'

const MODULES_DB_PATH = join(process.cwd(), 'server', 'data', 'modules.json')
const SENSOR_DATA_PATH = join(process.cwd(), 'server', 'data', 'sensor-data.json')

// Read modules database
function readModulesDatabase() {
  try {
    if (!existsSync(MODULES_DB_PATH)) {
      return { modules: [] }
    }
    const data = readFileSync(MODULES_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading modules database:', error)
    return { modules: [] }
  }
}

// Write modules database
function writeModulesDatabase(db) {
  try {
    writeFileSync(MODULES_DB_PATH, JSON.stringify(db, null, 2))
    return true
  } catch (error) {
    console.error('Error writing modules database:', error)
    return false
  }
}

// Read sensor data
function readSensorData() {
  try {
    if (!existsSync(SENSOR_DATA_PATH)) {
      return { data: [] }
    }
    const data = readFileSync(SENSOR_DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading sensor data:', error)
    return { data: [] }
  }
}

// Write sensor data
function writeSensorData(db) {
  try {
    writeFileSync(SENSOR_DATA_PATH, JSON.stringify(db, null, 2))
    return true
  } catch (error) {
    console.error('Error writing sensor data:', error)
    return false
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // ========================================
    // VALIDATION CHECKS
    // ========================================

    // 1. Validate required fields exist
    if (!body.session_id) {
      return {
        success: false,
        error: 'Missing required field: session_id',
        message: 'Session ID is required to send sensor data',
        code: 'MISSING_SESSION_ID'
      }
    }

    if (!body.umid) {
      return {
        success: false,
        error: 'Missing required field: umid',
        message: 'Module ID (UMID) is required',
        code: 'MISSING_UMID'
      }
    }

    if (!body.data || typeof body.data !== 'object') {
      return {
        success: false,
        error: 'Missing or invalid required field: data',
        message: 'Sensor data must be provided as an object',
        code: 'MISSING_DATA'
      }
    }

    // 2. Check if data object is empty
    if (Object.keys(body.data).length === 0) {
      return {
        success: false,
        error: 'Empty data object',
        message: 'Sensor data object cannot be empty',
        code: 'EMPTY_DATA'
      }
    }

    // ========================================
    // SESSION VERIFICATION
    // ========================================

    // 3. Read modules database to verify session
    const modulesDb = readModulesDatabase()

    // 4. Find module with matching session_id
    const module = modulesDb.modules.find(m => m.session_id === body.session_id)

    if (!module) {
      return {
        success: false,
        error: 'Invalid session ID',
        message: 'No registered module found with this session ID. Please register first.',
        code: 'INVALID_SESSION'
      }
    }

    // 5. Verify UMID matches the session's module
    if (module.umid !== body.umid) {
      return {
        success: false,
        error: 'UMID mismatch',
        message: `Session ID belongs to module '${module.umid}', but data was sent for '${body.umid}'`,
        code: 'UMID_MISMATCH'
      }
    }

    // ========================================
    // UPDATE MODULE METADATA
    // ========================================

    // 6. Update module's lastSeen timestamp
    module.lastSeen = new Date().toISOString()

    // 7. Increment dataCount
    module.dataCount = (module.dataCount || 0) + 1

    // 8. Update module status to active
    module.status = 'active'

    // Write updated modules database
    const modulesWriteSuccess = writeModulesDatabase(modulesDb)

    if (!modulesWriteSuccess) {
      console.warn('⚠️  Failed to update module metadata, but continuing with data storage')
    }

    // ========================================
    // STORE SENSOR DATA
    // ========================================

    // 9. Read existing sensor data
    const sensorDb = readSensorData()

    // 10. Create new sensor data entry
    const newEntry = {
      session_id: body.session_id,
      umid: body.umid,
      moduleType: body.moduleType || module.moduleType || 'unknown',
      data: body.data,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now()
    }

    // 11. Add to data array
    sensorDb.data.push(newEntry)

    // 12. Optional: Limit stored data points (keep last 1000)
    if (sensorDb.data.length > 1000) {
      sensorDb.data = sensorDb.data.slice(-1000)
    }

    // 13. Write sensor data back to file
    const sensorWriteSuccess = writeSensorData(sensorDb)

    if (!sensorWriteSuccess) {
      return {
        success: false,
        error: 'Failed to write sensor data',
        message: 'Data validation passed but storage failed',
        code: 'STORAGE_FAILED'
      }
    }

    // ========================================
    // LOG SENSOR DATA RECEPTION
    // ========================================

    // Create a readable summary of the data
    const dataKeys = Object.keys(body.data || {})
    const dataPreview = dataKeys.slice(0, 3).map(key => `${key}: ${body.data[key]}`).join(', ')
    const dataSummary = dataKeys.length > 3 ? `${dataPreview}...` : dataPreview

    // Log the data reception (fire and forget - don't await to avoid blocking)
    console.log('📝 Attempting to create log for:', body.umid, '- Data:', dataSummary)

    appendLog({
      type: 'success',
      message: `📊 [${body.umid}] ${body.moduleType || 'Sensor'} - ${dataSummary}`,
      details: JSON.stringify({
        'Module UMID': body.umid,
        'Module Type': body.moduleType || module.moduleType || 'unknown',
        'Session ID': body.session_id ? body.session_id.substring(0, 16) + '...' : 'N/A',
        'Data Count': module.dataCount,
        'Timestamp': newEntry.timestamp,
        'Sensor Data': body.data
      }, null, 2),
      rawData: newEntry
    }).then(() => {
      console.log('✅ Log entry created successfully for:', body.umid)
    }).catch((logError) => {
      console.error('❌ Failed to log sensor data for', body.umid, ':', logError.message)
    })

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    console.log(`📊 Sensor data received from ${body.umid}:`, body.data)

    return {
      success: true,
      message: 'Sensor data stored successfully',
      dataPoint: newEntry,
      moduleStats: {
        umid: module.umid,
        totalDataPoints: module.dataCount,
        lastSeen: module.lastSeen
      }
    }

  } catch (error) {
    console.error('❌ Error processing sensor data:', error)
    return {
      success: false,
      error: 'Internal server error',
      message: error.message,
      code: 'SERVER_ERROR'
    }
  }
})
