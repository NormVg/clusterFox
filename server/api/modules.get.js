import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const MODULES_DB_PATH = join(process.cwd(), 'server', 'data', 'modules.json')
const SETTINGS_PATH = join(process.cwd(), 'server', 'data', 'settings.json')
const SENSOR_DATA_PATH = join(process.cwd(), 'server', 'data', 'sensor-data.json')

// Read modules database
function readModulesDatabase() {
  try {
    if (!existsSync(MODULES_DB_PATH)) {
      return { modules: [], lastId: 0 }
    }
    const data = readFileSync(MODULES_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { modules: [], lastId: 0 }
  }
}

// Write modules database
function writeModulesDatabase(db) {
  try {
    writeFileSync(MODULES_DB_PATH, JSON.stringify(db, null, 2))
    return true
  } catch (error) {
    console.error('[Database] Error writing:', error)
    return false
  }
}

// Read settings
function readSettings() {
  try {
    if (!existsSync(SETTINGS_PATH)) {
      console.log('[Settings] File does not exist, using defaults')
      return {
        moduleActiveThreshold: 300,      // 5 minutes default
        moduleInactiveThreshold: 3600,   // 1 hour default
        enableEmergencyTriggers: true
      }
    }
    const data = readFileSync(SETTINGS_PATH, 'utf-8')
    const settings = JSON.parse(data)

    console.log('[Settings] Raw settings from file:', {
      moduleActiveThreshold: settings.moduleActiveThreshold,
      moduleInactiveThreshold: settings.moduleInactiveThreshold,
      enableEmergencyTriggers: settings.enableEmergencyTriggers
    })

    const result = {
      moduleActiveThreshold: settings.moduleActiveThreshold ?? 300,
      moduleInactiveThreshold: settings.moduleInactiveThreshold ?? 3600,
      enableEmergencyTriggers: settings.enableEmergencyTriggers ?? true
    }

    console.log('[Settings] Returning:', result)
    return result
  } catch (error) {
    console.error('[Settings] Error reading settings:', error)
    return {
      moduleActiveThreshold: 300,
      moduleInactiveThreshold: 3600,
      enableEmergencyTriggers: true
    }
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
    console.error('[Sensor Data] Error reading:', error)
    return { data: [] }
  }
}

// Check if any trigger condition is met
const checkEmergencyTriggers = (umid, triggers) => {
  if (!triggers || Object.keys(triggers).length === 0) {
    console.log(`[Trigger Check] ${umid}: No triggers configured`)
    return { isEmergency: false, triggeredFields: [] }
  }

  try {
    const sensorDb = readSensorData()
    // Get the latest sensor reading for this module
    const latestReading = sensorDb.data
      .filter(item => item.umid === umid)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

    console.log(`[Trigger Check] ${umid}: Latest reading:`, latestReading ? {
      timestamp: latestReading.timestamp,
      data: latestReading.data
    } : 'NO DATA')

    if (!latestReading || !latestReading.data) {
      console.log(`[Trigger Check] ${umid}: No sensor data found`)
      return { isEmergency: false, triggeredFields: [] }
    }

    const triggeredFields = []

    console.log(`[Trigger Check] ${umid}: Checking triggers:`, triggers)

    // Check each trigger condition
    for (const [field, config] of Object.entries(triggers)) {
      if (!config.enabled) {
        console.log(`[Trigger Check] ${umid}: ${field} trigger disabled`)
        continue
      }

      const value = latestReading.data[field]
      console.log(`[Trigger Check] ${umid}: ${field} = ${value}, threshold = ${config.threshold}, condition = ${config.condition}`)

      if (value === undefined || value === null) {
        console.log(`[Trigger Check] ${umid}: ${field} value not found in sensor data`)
        continue
      }

      const { threshold, condition } = config

      let isTriggered = false
      if (condition === 'above' && value > threshold) {
        isTriggered = true
        console.log(`[Trigger Check] ${umid}: ✅ ${field} TRIGGERED (${value} > ${threshold})`)
      } else if (condition === 'below' && value < threshold) {
        isTriggered = true
        console.log(`[Trigger Check] ${umid}: ✅ ${field} TRIGGERED (${value} < ${threshold})`)
      }

      if (isTriggered) {
        triggeredFields.push({
          field,
          value,
          threshold,
          condition
        })
      }
    }

    return {
      isEmergency: triggeredFields.length > 0,
      triggeredFields
    }
  } catch (error) {
    console.error('[Emergency Check] Error:', error)
    return { isEmergency: false, triggeredFields: [] }
  }
}

// Calculate dynamic status based on lastSeen and configurable thresholds
const calculateStatus = (lastSeen, activeThreshold, inactiveThreshold, triggers, umid) => {
  if (!lastSeen) {
    console.log(`[Status Calc] No lastSeen → UNKNOWN`)
    return { status: 'unknown', emergency: null }
  }

  // First check for emergency triggers
  const emergencyCheck = checkEmergencyTriggers(umid, triggers)
  if (emergencyCheck.isEmergency) {
    console.log(`  → EMERGENCY (triggers met)`, emergencyCheck.triggeredFields)
    return {
      status: 'emergency',
      emergency: emergencyCheck
    }
  }

  const now = Date.now()
  const lastSeenTime = new Date(lastSeen).getTime()
  const secondsSinceLastSeen = (now - lastSeenTime) / 1000

  console.log(`[Status Calc] lastSeen: ${lastSeen}`)
  console.log(`[Status Calc] now: ${now}, lastSeenTime: ${lastSeenTime}`)
  console.log(`[Status Calc] Seconds ago: ${Math.floor(secondsSinceLastSeen)}, Active threshold: ${activeThreshold}, Inactive threshold: ${inactiveThreshold}`)

  // Check base status first
  let baseStatus = 'offline'
  // Active: within active threshold (default 5 minutes)
  if (secondsSinceLastSeen < activeThreshold) {
    console.log(`  → ACTIVE (${Math.floor(secondsSinceLastSeen)}s < ${activeThreshold}s)`)
    baseStatus = 'active'
  }
  // Inactive: within inactive threshold (default 1 hour)
  else if (secondsSinceLastSeen < inactiveThreshold) {
    console.log(`  → INACTIVE (${Math.floor(secondsSinceLastSeen)}s < ${inactiveThreshold}s)`)
    baseStatus = 'inactive'
  }
  // Offline: exceeded inactive threshold
  else {
    console.log(`  → OFFLINE (${Math.floor(secondsSinceLastSeen)}s >= ${inactiveThreshold}s)`)
    baseStatus = 'offline'
  }

  return { status: baseStatus, emergency: null }
}

// Check and trigger cutoff modules for emergency modules
async function checkAndTriggerCutoffModules(db, settings) {
  if (!settings.enableEmergencyTriggers) {
    return false
  }

  try {
    const mappingsPath = join(process.cwd(), 'server', 'data', 'cutoff-mappings.json')
    if (!existsSync(mappingsPath)) {
      return false
    }

    const mappingsData = JSON.parse(readFileSync(mappingsPath, 'utf-8'))
    let hasChanges = false

    for (const module of db.modules) {
      const statusResult = calculateStatus(
        module.lastSeen,
        settings.moduleActiveThreshold,
        settings.moduleInactiveThreshold,
        module.triggers,
        module.umid
      )

      // Find mapping for this module
      const mapping = mappingsData.mappings.find(m => m.sourceModuleUmid === module.umid)

      if (mapping) {
        const cutoffModule = db.modules.find(m => m.umid === mapping.cutoffModuleUmid)

        if (cutoffModule && cutoffModule.isCutoffModule) {
          if (statusResult.status === 'emergency') {
            // Activate cutoff module
            if (!cutoffModule.cutoffActive) {
              cutoffModule.cutoffActive = true
              cutoffModule.lastTriggeredAt = new Date().toISOString()
              cutoffModule.triggeredBy = module.umid
              hasChanges = true

              console.log(`[CUTOFF] 🔌 ACTIVATED ${cutoffModule.umid} by emergency on ${module.umid}`)
            }
          } else {
            // Deactivate cutoff module if emergency cleared
            if (cutoffModule.cutoffActive && cutoffModule.triggeredBy === module.umid) {
              cutoffModule.cutoffActive = false
              delete cutoffModule.triggeredBy
              hasChanges = true

              console.log(`[CUTOFF] ✅ DEACTIVATED ${cutoffModule.umid} - emergency cleared on ${module.umid}`)
            }
          }
        }
      }
    }

    // Save changes to database
    if (hasChanges) {
      writeModulesDatabase(db)
      console.log('[CUTOFF] Changes saved to database')
    }

    return hasChanges
  } catch (error) {
    console.error('[CUTOFF] Error checking cutoff modules:', error)
    return false
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.session_id

  const db = readModulesDatabase()
  const settings = readSettings()

  // If session_id provided, return specific module
  if (sessionId) {
    const module = db.modules.find(m => m.session_id === sessionId)

    if (!module) {
      return {
        success: false,
        error: 'Module not found',
        message: `No module found with the provided session ID`
      }
    }

    // Calculate status for all modules (including cutoff modules)
    const statusResult = calculateStatus(
      module.lastSeen,
      settings.moduleActiveThreshold,
      settings.moduleInactiveThreshold,
      module.triggers,
      module.umid
    )

    return {
      success: true,
      module: {
        ...module,
        status: statusResult.status,
        emergency: statusResult.emergency
      }
    }
  }

  // Check and trigger cutoff modules for emergencies
  await checkAndTriggerCutoffModules(db, settings)

  // Otherwise return all modules (without exposing session IDs for security)
  const modulesWithoutSessions = db.modules.map(m => {
    // Calculate status for all modules (sensor and cutoff modules)
    const statusResult = calculateStatus(
      m.lastSeen,
      settings.moduleActiveThreshold,
      settings.moduleInactiveThreshold,
      settings.enableEmergencyTriggers ? m.triggers : null,
      m.umid
    )
    const secondsSinceLastSeen = m.lastSeen ? (Date.now() - new Date(m.lastSeen).getTime()) / 1000 : null

    const moduleType = m.isCutoffModule ? 'cutoff' : 'sensor'
    console.log(`[Module Status] ${m.umid} (${moduleType}): ${statusResult.status} (last seen ${secondsSinceLastSeen ? Math.floor(secondsSinceLastSeen) + 's ago' : 'never'})${settings.enableEmergencyTriggers ? '' : ' [TRIGGERS DISABLED]'}`)

    return {
      umid: m.umid,
      moduleType: m.moduleType,
      typeComponents: m.typeComponents,
      registeredAt: m.registeredAt,
      lastSeen: m.lastSeen,
      status: statusResult.status,
      emergency: settings.enableEmergencyTriggers ? statusResult.emergency : null,
      triggers: m.triggers || {},
      dataCount: m.dataCount,
      isCutoffModule: m.isCutoffModule || false,
      cutoffActive: m.cutoffActive || false
    }
  })

  console.log(`[Module API] Returning ${modulesWithoutSessions.length} modules with thresholds: active=${settings.moduleActiveThreshold}s, inactive=${settings.moduleInactiveThreshold}s`)

  return {
    success: true,
    count: modulesWithoutSessions.length,
    modules: modulesWithoutSessions
  }
})
