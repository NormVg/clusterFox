import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const MODULES_DB_PATH = join(process.cwd(), 'server', 'data', 'modules.json')
const SENSOR_DATA_PATH = join(process.cwd(), 'server', 'data', 'sensor-data.json')

export default defineEventHandler(async (event) => {
  try {
    // Reset modules database
    const modulesData = { modules: [] }
    writeFileSync(MODULES_DB_PATH, JSON.stringify(modulesData, null, 2))

    // Reset sensor data
    const sensorData = { data: [] }
    writeFileSync(SENSOR_DATA_PATH, JSON.stringify(sensorData, null, 2))

    return {
      success: true,
      message: 'All database data has been reset successfully',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error resetting database:', error)
    return {
      success: false,
      error: 'Failed to reset database',
      message: error.message
    }
  }
})
