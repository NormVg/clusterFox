import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dataDir = path.join(process.cwd(), 'server', 'data')

    // Read data files
    const modulesData = JSON.parse(await fs.readFile(path.join(dataDir, 'modules.json'), 'utf-8'))
    const sensorData = JSON.parse(await fs.readFile(path.join(dataDir, 'sensor-data.json'), 'utf-8'))

    const modules = modulesData.modules || []
    const data = sensorData.data || []
    const now = Date.now()

    // 1. Data Completeness Score
    const expectedDataPoints = modules.length * 24 // Expected 1 per hour per module
    const actualDataPoints = data.length
    const missingDataPoints = Math.max(0, expectedDataPoints - actualDataPoints)
    const completeness = Math.min(100, Math.round((actualDataPoints / expectedDataPoints) * 100))

    // 2. Timestamp Consistency
    let timestampIssues = 0
    const timestamps = data.map(d => new Date(d.timestamp).getTime())

    for (let i = 1; i < timestamps.length; i++) {
      // Check for timestamps in the future
      if (timestamps[i] > now + 60000) {
        timestampIssues++
      }
      // Check for timestamps way in the past (>7 days)
      if (now - timestamps[i] > 7 * 24 * 60 * 60 * 1000) {
        timestampIssues++
      }
    }

    const consistency = Math.max(0, Math.round(100 - (timestampIssues / data.length) * 100))

    // 3. Data Accuracy (check for duplicates)
    const seen = new Set()
    let duplicates = 0

    data.forEach(entry => {
      const key = `${entry.umid}-${entry.timestamp}`
      if (seen.has(key)) {
        duplicates++
      } else {
        seen.add(key)
      }
    })

    const accuracy = Math.max(0, Math.round(100 - (duplicates / data.length) * 100))

    // 4. Data Freshness (modules with recent data)
    const staleThreshold = 30 * 60 * 1000 // 30 minutes
    let staleModules = 0

    modules.forEach(module => {
      const lastSeenTime = new Date(module.lastSeen).getTime()
      if (now - lastSeenTime > staleThreshold) {
        staleModules++
      }
    })

    const freshness = Math.max(0, Math.round(100 - (staleModules / modules.length) * 100))

    // Overall Score (weighted average)
    const overallScore = Math.round(
      (completeness * 0.3) +
      (consistency * 0.25) +
      (accuracy * 0.25) +
      (freshness * 0.2)
    )

    // Identify specific issues
    const issues = []

    // Check each module for issues
    modules.forEach(module => {
      const moduleData = data.filter(d => d.umid === module.umid)
      const lastSeenTime = new Date(module.lastSeen).getTime()

      // Missing data
      if (moduleData.length < 10) {
        issues.push({
          module: module.umid,
          severity: 'warning',
          description: `Only ${moduleData.length} data points - low data transmission`
        })
      }

      // Stale data
      if (now - lastSeenTime > staleThreshold) {
        const minutesAgo = Math.round((now - lastSeenTime) / 60000)
        issues.push({
          module: module.umid,
          severity: 'critical',
          description: `No data received for ${minutesAgo} minutes`
        })
      }

      // Check for data quality issues in recent data
      const recentData = moduleData.slice(-10)
      const hasNullValues = recentData.some(d => {
        return Object.values(d.data || {}).some(v => v === null || v === undefined)
      })

      if (hasNullValues) {
        issues.push({
          module: module.umid,
          severity: 'warning',
          description: 'Null or undefined values detected in recent data'
        })
      }
    })

    // Sort issues by severity
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return {
      success: true,
      quality: {
        overallScore,
        completeness,
        consistency,
        accuracy,
        freshness,
        missingDataPoints,
        timestampIssues,
        duplicates,
        staleModules,
        issues: issues.slice(0, 10) // Top 10 issues
      }
    }
  } catch (error) {
    console.error('Error calculating data quality:', error)
    return {
      success: false,
      error: error.message,
      quality: {
        overallScore: 0,
        completeness: 0,
        consistency: 0,
        accuracy: 0,
        freshness: 0,
        missingDataPoints: 0,
        timestampIssues: 0,
        duplicates: 0,
        staleModules: 0,
        issues: []
      }
    }
  }
})
