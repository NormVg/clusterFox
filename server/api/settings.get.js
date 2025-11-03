import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'server/data/settings.json')

export default defineEventHandler(async (event) => {
  try {
    // Check if settings file exists, if not create with defaults
    if (!fs.existsSync(settingsPath)) {
      const defaultSettings = {
        dataRetention: 10000,
        refreshInterval: 10,
        sessionTimeout: 24,
        inactiveThreshold: 15,
        enableNotifications: true,
        enableAutoRefresh: true,
        theme: 'dark',
        sidebarCollapsed: false,
        moduleActiveThreshold: 300,      // 5 minutes in seconds
        moduleInactiveThreshold: 3600    // 1 hour in seconds
      }
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2))
    }

    const data = fs.readFileSync(settingsPath, 'utf-8')
    const settings = JSON.parse(data)

    return {
      success: true,
      settings
    }
  } catch (error) {
    console.error('Error reading settings:', error)
    return {
      success: false,
      error: error.message,
      settings: {}
    }
  }
})
