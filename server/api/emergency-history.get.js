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

    return {
      success: true,
      history: recentHistory
    }
  } catch (error) {
    console.error('Error reading emergency history:', error)
    return {
      success: false,
      error: error.message,
      history: []
    }
  }
})
