import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { count, modules } = body

    if (typeof count !== 'number') {
      return {
        success: false,
        error: 'Count is required'
      }
    }

    const dataDir = path.join(process.cwd(), 'server', 'data')
    const historyFile = path.join(dataDir, 'emergency-history.json')

    // Read existing history
    let history = []
    if (fs.existsSync(historyFile)) {
      const data = fs.readFileSync(historyFile, 'utf-8')
      history = JSON.parse(data)
    }

    // Add new entry
    const entry = {
      timestamp: new Date().toISOString(),
      count: count,
      modules: modules || []
    }

    history.push(entry)

    // Keep only last 7 days of data to prevent file from growing too large
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    history = history.filter(entry => new Date(entry.timestamp).getTime() > sevenDaysAgo)

    // Save updated history
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2))

    return {
      success: true,
      entry
    }
  } catch (error) {
    console.error('Error saving emergency history:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
