import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dataDir = path.join(process.cwd(), 'server', 'data')
    const historyFile = path.join(dataDir, 'emergency-history.json')
    const modulesFile = path.join(dataDir, 'modules.json')
    const sensorDataFile = path.join(dataDir, 'sensor-data.json')

    // Read modules
    let modulesData = { modules: [] }
    if (fs.existsSync(modulesFile)) {
      const data = fs.readFileSync(modulesFile, 'utf-8')
      modulesData = JSON.parse(data)
    }

    // Read sensor data
    let sensorData = { data: [] }
    if (fs.existsSync(sensorDataFile)) {
      const data = fs.readFileSync(sensorDataFile, 'utf-8')
      sensorData = JSON.parse(data)
    }

    // Get latest reading for each module
    const latestReadings = new Map()
    sensorData.data.forEach(reading => {
      const existing = latestReadings.get(reading.umid)
      if (!existing || new Date(reading.timestamp) > new Date(existing.timestamp)) {
        latestReadings.set(reading.umid, reading)
      }
    })

    // Check which modules are in emergency state
    const emergencyModules = []
    const now = new Date()

    modulesData.modules.forEach(module => {
      if (!module.triggers) return

      const latestReading = latestReadings.get(module.umid)
      if (!latestReading) return

      const triggeredConditions = []

      // Check each trigger
      Object.keys(module.triggers).forEach(field => {
        const trigger = module.triggers[field]
        if (!trigger.enabled) return

        const rawValue = latestReading.data[field]
        if (rawValue === undefined || rawValue === null) return

        // Convert to number for proper comparison
        const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue
        if (isNaN(value)) return

        let isTriggered = false
        if (trigger.condition === 'above' && value > trigger.threshold) {
          isTriggered = true
        } else if (trigger.condition === 'below' && value < trigger.threshold) {
          isTriggered = true
        }

        if (isTriggered) {
          triggeredConditions.push({
            field,
            value,
            threshold: trigger.threshold,
            condition: trigger.condition
          })
        }
      })

      if (triggeredConditions.length > 0) {
        emergencyModules.push({
          umid: module.umid,
          moduleType: module.moduleType,
          triggeredConditions,
          timestamp: latestReading.timestamp
        })
      }
    })

    // Read existing history
    let history = []
    if (fs.existsSync(historyFile)) {
      const data = fs.readFileSync(historyFile, 'utf-8')
      history = JSON.parse(data)
    }

    // Detect state changes
    let eventType = 'update'
    const previousEntry = history.length > 0 ? history[history.length - 1] : null

    if (previousEntry) {
      const prevUMIDs = new Set(previousEntry.modules.map(m => m.umid))
      const currUMIDs = new Set(emergencyModules.map(m => m.umid))

      const entered = emergencyModules.filter(m => !prevUMIDs.has(m.umid))
      const exited = Array.from(prevUMIDs).filter(umid => !currUMIDs.has(umid))

      if (entered.length > 0 && exited.length === 0) {
        eventType = 'emergency_started'
      } else if (exited.length > 0 && entered.length === 0) {
        eventType = 'emergency_ended'
      } else if (entered.length > 0 || exited.length > 0) {
        eventType = 'emergency_changed'
      }
    } else if (emergencyModules.length > 0) {
      eventType = 'emergency_started'
    }

    // Create new history entry with event type
    const entry = {
      timestamp: now.toISOString(),
      eventType,
      count: emergencyModules.length,
      modules: emergencyModules.map(m => ({
        umid: m.umid,
        moduleType: m.moduleType,
        dataTimestamp: m.timestamp,
        triggeredCount: m.triggeredConditions.length
      }))
    }

    history.push(entry)

    console.log(`📝 Emergency event: ${eventType} | Count: ${emergencyModules.length} | Modules: [${emergencyModules.map(m => m.umid).join(', ')}]`)

    // Keep only last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    history = history.filter(entry => new Date(entry.timestamp).getTime() > sevenDaysAgo)

    // Save history
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2))

    return {
      success: true,
      entry,
      totalEntries: history.length
    }
  } catch (error) {
    console.error('Error tracking emergency:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
