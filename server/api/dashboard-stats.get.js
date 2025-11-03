import fs from 'fs'
import path from 'path'

/**
 * Clean, simple endpoint that returns ALL dashboard stats in one call
 * This eliminates any timing or caching issues
 */
export default defineEventHandler(async (event) => {
  try {
    const dataDir = path.join(process.cwd(), 'server', 'data')
    
    // Read all necessary files
    const modulesFile = path.join(dataDir, 'modules.json')
    const sensorFile = path.join(dataDir, 'sensor-data.json')
    const emergencyFile = path.join(dataDir, 'emergency-history.json')
    const uptimeFile = path.join(dataDir, 'uptime.json')
    const settingsFile = path.join(dataDir, 'settings.json')

    // Load modules
    let modules = []
    if (fs.existsSync(modulesFile)) {
      const data = JSON.parse(fs.readFileSync(modulesFile, 'utf-8'))
      modules = data.modules || []
    }

    // Load sensor data
    let sensorData = []
    if (fs.existsSync(sensorFile)) {
      const data = JSON.parse(fs.readFileSync(sensorFile, 'utf-8'))
      sensorData = data.data || []
    }

    // Load emergency history
    let emergencyHistory = []
    if (fs.existsSync(emergencyFile)) {
      emergencyHistory = JSON.parse(fs.readFileSync(emergencyFile, 'utf-8'))
    }

    // Load uptime
    let startTime = Date.now()
    if (fs.existsSync(uptimeFile)) {
      const data = JSON.parse(fs.readFileSync(uptimeFile, 'utf-8'))
      startTime = data.startTime || Date.now()
    }

    // Load settings
    let settings = { moduleActiveThreshold: 300, moduleInactiveThreshold: 3600 }
    if (fs.existsSync(settingsFile)) {
      const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
      settings = data
    }

    // Calculate module status
    const now = Date.now()
    const activeThreshold = (settings.moduleActiveThreshold || 300) * 1000
    const inactiveThreshold = (settings.moduleInactiveThreshold || 3600) * 1000
    
    let activeModules = 0
    let inactiveModules = 0
    let offlineModules = 0
    
    modules.forEach(m => {
      const lastSeen = new Date(m.lastSeen).getTime()
      const timeSince = now - lastSeen
      
      if (timeSince < activeThreshold) {
        activeModules++
      } else if (timeSince < inactiveThreshold) {
        inactiveModules++
      } else {
        offlineModules++
      }
    })

    // Calculate system status
    let systemStatus = 'Healthy'
    if (offlineModules === modules.length) {
      systemStatus = 'Critical'
    } else if (activeModules === 0) {
      systemStatus = 'Degraded'
    } else if (activeModules !== modules.length) {
      systemStatus = 'Degraded'
    }

    // Calculate total readings
    const totalReadings = modules.reduce((sum, m) => sum + (m.dataCount || 0), 0)

    // Calculate data rate (last minute)
    const oneMinuteAgo = now - 60000
    const recentReadings = sensorData.filter(r => {
      const ts = new Date(r.timestamp).getTime()
      return ts > oneMinuteAgo
    })
    const dataRate = recentReadings.length

    // Get emergency status
    const latestEmergency = emergencyHistory.length > 0 
      ? emergencyHistory[emergencyHistory.length - 1] 
      : null
    
    const isEmergencyActive = latestEmergency 
      && latestEmergency.eventType !== 'emergency_ended' 
      && latestEmergency.count > 0
    
    const activeAlerts = isEmergencyActive ? latestEmergency.count : 0
    const alertModules = isEmergencyActive ? latestEmergency.modules : []

    // Calculate uptime
    const uptimeDiff = now - startTime
    const days = Math.floor(uptimeDiff / 86400000)
    const hours = Math.floor((uptimeDiff % 86400000) / 3600000)
    const minutes = Math.floor((uptimeDiff % 3600000) / 60000)
    
    let uptimeFormatted = ''
    if (days > 0) uptimeFormatted = `${days}d ${hours}h`
    else if (hours > 0) uptimeFormatted = `${hours}h ${minutes}m`
    else uptimeFormatted = `${minutes}m`

    const startDate = new Date(startTime)
    const startedAt = startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })

    // Return clean, simple stats object
    return {
      success: true,
      stats: {
        activeModules,
        totalModules: modules.length,
        totalReadings,
        dataRate,
        systemStatus,
        uptime: uptimeFormatted,
        startedAt,
        activeAlerts,
        alertsChange: activeAlerts > 0 
          ? `${activeAlerts} emergency trigger${activeAlerts > 1 ? 's' : ''} active`
          : 'All good',
        alertModules
      },
      timestamp: now
    }

  } catch (error) {
    console.error('[Dashboard Stats] Error:', error)
    return {
      success: false,
      error: error.message,
      stats: {
        activeModules: 0,
        totalModules: 0,
        totalReadings: 0,
        dataRate: 0,
        systemStatus: 'Unknown',
        uptime: '0m',
        startedAt: 'now',
        activeAlerts: 0,
        alertsChange: 'Error loading alerts'
      }
    }
  }
})
