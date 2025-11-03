import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const SENSOR_DATA_PATH = join(process.cwd(), 'server', 'data', 'sensor-data.json')

// Read sensor data
function readSensorData() {
  try {
    if (!existsSync(SENSOR_DATA_PATH)) {
      return { data: [] }
    }
    const data = readFileSync(SENSOR_DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { data: [] }
  }
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const sessionId = query.session_id
  const limit = query.limit ? parseInt(query.limit) : 100

  const db = readSensorData()
  let filteredData = db.data

  // Filter by session ID if provided
  if (sessionId) {
    filteredData = filteredData.filter(d => d.session_id === sessionId)
  }

  // Sort by timestamp (newest first)
  filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Apply limit
  filteredData = filteredData.slice(0, limit)

  return {
    success: true,
    count: filteredData.length,
    total: db.data.length,
    data: filteredData
  }
})
