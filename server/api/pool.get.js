import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { appendLog } from '../utils/logger.js'

const MODULES_DB_PATH = join(process.cwd(), 'server', 'data', 'modules.json')
const SENSOR_DATA_PATH = join(process.cwd(), 'server', 'data', 'sensor-data.json')

// Initialize database
function initDatabase() {
  const dir = join(process.cwd(), 'server', 'data')
  if (!existsSync(dir)) {
    const { mkdirSync } = require('fs')
    mkdirSync(dir, { recursive: true })
  }

  if (!existsSync(MODULES_DB_PATH)) {
    writeFileSync(MODULES_DB_PATH, JSON.stringify({ modules: [], lastId: 0 }, null, 2))
  }

  if (!existsSync(SENSOR_DATA_PATH)) {
    writeFileSync(SENSOR_DATA_PATH, JSON.stringify({ data: [] }, null, 2))
  }
}

// Read modules database
function readModulesDatabase() {
  try {
    initDatabase()
    const data = readFileSync(MODULES_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { modules: [], lastId: 0 }
  }
}

// Write modules database
function writeModulesDatabase(data) {
  try {
    writeFileSync(MODULES_DB_PATH, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing modules database:', error)
    return false
  }
}

// Read sensor data
function readSensorData() {
  try {
    initDatabase()
    const data = readFileSync(SENSOR_DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { data: [] }
  }
}

// Write sensor data
function writeSensorData(data) {
  try {
    writeFileSync(SENSOR_DATA_PATH, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing sensor data:', error)
    return false
  }
}

export default defineEventHandler((event) => {
  const query = getQuery(event)

  // Get session ID from query
  const sessionId = query.session_id

  // Validate session ID
  if (!sessionId) {
    return {
      success: false,
      error: 'Missing required parameter: session_id',
      message: 'Please provide session ID (e.g., ?session_id=abc123...)'
    }
  }

  // Read modules database
  const modulesDb = readModulesDatabase()

  // Find module by session ID
  const module = modulesDb.modules.find(m => m.session_id === sessionId)

  if (!module) {
    return {
      success: false,
      error: 'Invalid session ID',
      message: `No module found with the provided session ID. Please register first.`
    }
  }

  // Extract sensor data from query (exclude 'session_id' parameter)
  const sensorData = { ...query }
  delete sensorData.session_id

  // Check if any sensor data provided
  if (Object.keys(sensorData).length === 0) {
    return {
      success: false,
      error: 'No sensor data provided',
      message: 'Please provide sensor data in query parameters (e.g., ?session_id=abc123&temperature=25.5&humidity=60)'
    }
  }

  // Create data entry
  const dataEntry = {
    session_id: sessionId,
    umid: module.umid,
    moduleType: module.moduleType,
    data: sensorData,
    timestamp: new Date().toISOString(),
    receivedAt: Date.now()
  }

  // Read current sensor data
  const sensorDataDb = readSensorData()

  // Add new entry
  sensorDataDb.data.push(dataEntry)

  // Optional: Keep only last 10000 entries to prevent file from growing too large
  if (sensorDataDb.data.length > 10000) {
    sensorDataDb.data = sensorDataDb.data.slice(-10000)
  }

  // Write sensor data
  const writeSuccess = writeSensorData(sensorDataDb)

  if (!writeSuccess) {
    return {
      success: false,
      error: 'Failed to write sensor data',
      message: 'Could not save sensor data'
    }
  }

  // Update module's last seen and data count
  module.lastSeen = new Date().toISOString()
  module.dataCount = (module.dataCount || 0) + 1
  module.status = 'active'

  // Write updated modules database
  writeModulesDatabase(modulesDb)

  // ========================================
  // LOG SENSOR DATA RECEPTION (GET method)
  // ========================================

  // Create a readable summary of the data
  const dataKeys = Object.keys(sensorData)
  const dataPreview = dataKeys.slice(0, 3).map(key => `${key}: ${sensorData[key]}`).join(', ')
  const dataSummary = dataKeys.length > 3 ? `${dataPreview}...` : dataPreview

  // Log the data reception (fire and forget)
  console.log('📝 [GET] Attempting to log for:', module.umid, '- Data:', dataSummary)

  appendLog({
    type: 'success',
    message: `📡 [${module.umid}] ${module.moduleType || 'Sensor'} (GET) - ${dataSummary}`,
    details: JSON.stringify({
      'Module UMID': module.umid,
      'Module Type': module.moduleType,
      'Session ID': sessionId ? sessionId.substring(0, 16) + '...' : 'N/A',
      'Data Count': module.dataCount,
      'Method': 'GET',
      'Timestamp': dataEntry.timestamp,
      'Sensor Data': sensorData
    }, null, 2),
    rawData: dataEntry
  }).then(() => {
    console.log('✅ [GET] Log entry created for:', module.umid)
  }).catch((logError) => {
    console.error('❌ [GET] Failed to log sensor data:', logError.message)
  })

  // Return success response
  return {
    success: true,
    message: 'Sensor data received',
    session_id: sessionId,
    umid: module.umid,
    moduleType: module.moduleType,
    dataReceived: sensorData,
    timestamp: dataEntry.timestamp,
    totalDataPoints: module.dataCount
  }
})
