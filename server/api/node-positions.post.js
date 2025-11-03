import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const positionsPath = path.join(__dirname, '../data/node-positions.json')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Ensure data directory exists
    const dataDir = path.dirname(positionsPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Write positions to file
    fs.writeFileSync(positionsPath, JSON.stringify(body, null, 2))

    return {
      success: true,
      message: 'Node positions saved successfully',
      positions: body
    }
  } catch (error) {
    console.error('Error saving node positions:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
