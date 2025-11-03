import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'server/data/settings.json')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate required fields
    const requiredFields = ['dataRetention', 'refreshInterval', 'sessionTimeout', 'inactiveThreshold', 'moduleActiveThreshold', 'moduleInactiveThreshold']
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return {
          success: false,
          error: `Missing required field: ${field}`
        }
      }
    }

    // Ensure data directory exists
    const dataDir = path.dirname(settingsPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Write settings to file
    fs.writeFileSync(settingsPath, JSON.stringify(body, null, 2))

    return {
      success: true,
      message: 'Settings saved successfully',
      settings: body
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
