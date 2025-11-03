import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const CONNECTIONS_PATH = join(process.cwd(), 'server', 'data', 'node-connections.json')

export default defineEventHandler(() => {
  try {
    if (!existsSync(CONNECTIONS_PATH)) {
      return {
        success: true,
        connections: []
      }
    }

    const data = readFileSync(CONNECTIONS_PATH, 'utf-8')
    const parsed = JSON.parse(data)

    return {
      success: true,
      connections: parsed.connections || []
    }
  } catch (error) {
    console.error('Error reading node connections:', error)
    return {
      success: false,
      error: 'Failed to read connections',
      connections: []
    }
  }
})
