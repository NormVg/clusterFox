import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dataDir = path.join(process.cwd(), 'server', 'data')

    // Read modules and sensor data
    const modulesData = JSON.parse(await fs.readFile(path.join(dataDir, 'modules.json'), 'utf-8'))
    const sensorData = JSON.parse(await fs.readFile(path.join(dataDir, 'sensor-data.json'), 'utf-8'))

    const now = Date.now()
    const modules = modulesData.modules || []

    // Calculate performance metrics for each module
    const performanceModules = modules.map(module => {
      const lastSeenTime = new Date(module.lastSeen).getTime()
      const registeredTime = new Date(module.registeredAt).getTime()

      // Time calculations
      const totalTime = now - registeredTime
      const timeSinceLastSeen = now - lastSeenTime
      const activeThreshold = 300000 // 5 minutes in ms
      const inactiveThreshold = 3600000 // 1 hour in ms

      // Calculate REALISTIC uptime based on actual activity
      // Uptime = percentage of time module was responsive (not considering long offline periods)
      const hoursSinceRegistration = totalTime / (1000 * 60 * 60)
      const daysSinceRegistration = totalTime / (1000 * 60 * 60 * 24)
      
      let uptimePercent = 100
      if (module.status === 'offline') {
        // Offline: assume been down for significant time
        const hoursOffline = Math.min(timeSinceLastSeen / (1000 * 60 * 60), 24)
        uptimePercent = Math.max(0, 100 - (hoursOffline / hoursSinceRegistration * 100))
      } else if (module.status === 'inactive') {
        // Inactive: last seen within hour, calculate realistic uptime
        const minutesInactive = timeSinceLastSeen / (1000 * 60)
        uptimePercent = Math.max(85, 100 - (minutesInactive / 60 * 5)) // Lose 5% per hour inactive
      } else if (module.status === 'active') {
        // Active: very recent activity, near-perfect uptime
        const minutesSinceLastSeen = timeSinceLastSeen / (1000 * 60)
        if (minutesSinceLastSeen < 5) {
          uptimePercent = 99.9 // Perfect uptime
        } else {
          uptimePercent = Math.max(95, 100 - (minutesSinceLastSeen / 60)) // Small penalty
        }
      }

      // Calculate realistic data rate (entries per hour)
      const dataRate = hoursSinceRegistration > 0
        ? (module.dataCount / hoursSinceRegistration).toFixed(1)
        : module.dataCount

      // Get actual recent data activity
      const moduleData = sensorData.data.filter(d => d.umid === module.umid)
      const recentData = moduleData.slice(-100) // Last 100 entries
      
      // Calculate data consistency (how regular are the readings?)
      let consistencyScore = 100
      if (recentData.length >= 2) {
        const timestamps = recentData.map(d => new Date(d.timestamp).getTime())
        const intervals = []
        for (let i = 1; i < timestamps.length; i++) {
          intervals.push(timestamps[i] - timestamps[i - 1])
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
        const stdDev = Math.sqrt(variance)
        const coefficientOfVariation = (stdDev / avgInterval) * 100
        
        // Lower CV = more consistent
        consistencyScore = Math.max(50, Math.min(100, 100 - coefficientOfVariation))
      }

      // Calculate reliability score based on actual activity patterns
      let reliabilityScore = 100
      if (timeSinceLastSeen < activeThreshold) {
        reliabilityScore = 100 // Very reliable, recent activity
      } else if (timeSinceLastSeen < inactiveThreshold) {
        reliabilityScore = 80 - ((timeSinceLastSeen - activeThreshold) / (inactiveThreshold - activeThreshold) * 30)
      } else {
        // Been offline for over an hour
        const hoursOffline = timeSinceLastSeen / (1000 * 60 * 60)
        reliabilityScore = Math.max(10, 50 - (hoursOffline * 5))
      }

      // Calculate data quality score (based on data count vs expected)
      const expectedDataPoints = hoursSinceRegistration * 12 // Assume 12 readings/hour is ideal
      const dataQuality = Math.min(100, (module.dataCount / expectedDataPoints) * 100)

      // Determine ACTUAL CURRENT STATUS based on last seen time
      let actualStatus = 'offline'
      if (timeSinceLastSeen < activeThreshold) {
        actualStatus = 'active'
      } else if (timeSinceLastSeen < inactiveThreshold) {
        actualStatus = 'inactive'
      }

      // Calculate performance score (weighted, realistic)
      const statusScore = actualStatus === 'active' ? 100 :
                         actualStatus === 'inactive' ? 60 :
                         actualStatus === 'offline' ? 20 : 100

      const score = Math.round(
        (statusScore * 0.25) +        // Current status weight
        (uptimePercent * 0.25) +      // Historical uptime
        (reliabilityScore * 0.20) +   // Recent reliability
        (dataQuality * 0.15) +        // Data collection rate
        (consistencyScore * 0.15)     // Data consistency
      )

      return {
        umid: module.umid,
        moduleType: module.moduleType,
        status: actualStatus,  // Use calculated real-time status
        score: Math.min(100, Math.max(0, score)),
        uptimePercent: Math.round(uptimePercent * 10) / 10, // One decimal
        dataRate: `${dataRate}/hr`,
        dataCount: module.dataCount,
        lastSeen: module.lastSeen,
        registeredAt: module.registeredAt,
        timeSinceLastSeen: timeSinceLastSeen,
        recentActivity: recentData.length,
        reliability: Math.round(reliabilityScore),
        consistency: Math.round(consistencyScore),
        dataQuality: Math.round(dataQuality),
        daysSinceRegistration: Math.round(daysSinceRegistration * 10) / 10
      }
    })

    // Sort by score descending
    performanceModules.sort((a, b) => b.score - a.score)

    return {
      success: true,
      modules: performanceModules,
      summary: {
        total: modules.length,
        excellent: performanceModules.filter(m => m.score >= 90).length,
        good: performanceModules.filter(m => m.score >= 70 && m.score < 90).length,
        needsAttention: performanceModules.filter(m => m.score < 70).length
      }
    }
  } catch (error) {
    console.error('Error calculating module performance:', error)
    return {
      success: false,
      error: error.message,
      modules: []
    }
  }
})
