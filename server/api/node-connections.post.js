import { writeFileSync } from 'fs'
import { join } from 'path'

const CONNECTIONS_PATH = join(process.cwd(), 'server', 'data', 'node-connections.json')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.connections || !Array.isArray(body.connections)) {
      return {
        success: false,
        error: 'Invalid connections data'
      }
    }

    // Save to file
    writeFileSync(CONNECTIONS_PATH, JSON.stringify(body, null, 2))

    return {
      success: true,
      message: 'Connections saved successfully'
    }
  } catch (error) {
    console.error('Error saving node connections:', error)
    return {
      success: false,
      error: 'Failed to save connections'
    }
  }
})
