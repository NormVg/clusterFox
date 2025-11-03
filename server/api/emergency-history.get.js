import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dataDir = path.join(process.cwd(), 'server', 'data')
    const historyFile = path.join(dataDir, 'emergency-history.json')

    // Read existing history
    let history = []
    if (fs.existsSync(historyFile)) {
      const data = fs.readFileSync(historyFile, 'utf-8')
      history = JSON.parse(data)
    }

    // Return last 24 hours of data
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
    const recentHistory = history.filter(entry => new Date(entry.timestamp).getTime() > twentyFourHoursAgo)

    // Get current emergency status from the most recent entry
    const latestEntry = history.length > 0 ? history[history.length - 1] : null
    
    // Emergency is active if latest entry has count > 0 AND is not an emergency_ended event
    const isActive = latestEntry && latestEntry.eventType !== 'emergency_ended' && latestEntry.count > 0
    const activeCount = latestEntry ? latestEntry.count : 0
    const activeModules = (latestEntry && latestEntry.count > 0) ? latestEntry.modules : []

    return {
      success: true,
      history: recentHistory,
      current: {
        isActive,
        count: activeCount,
        modules: activeModules,
        lastUpdate: latestEntry?.timestamp || null
      }
    }
  } catch (error) {
    console.error('Error reading emergency history:', error)
    return {
      success: false,
      error: error.message,
      history: [],
      current: {
        isActive: false,
        count: 0,
        modules: []
      }
    }
  }
})
