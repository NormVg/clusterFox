import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const positionsPath = path.join(__dirname, '../data/node-positions.json')

export default defineEventHandler(async (event) => {
  try {
    // Check if positions file exists, if not create with empty object
    if (!fs.existsSync(positionsPath)) {
      fs.writeFileSync(positionsPath, JSON.stringify({}, null, 2))
    }

    const data = fs.readFileSync(positionsPath, 'utf-8')
    const positions = JSON.parse(data)

    return {
      success: true,
      positions
    }
  } catch (error) {
    console.error('Error reading node positions:', error)
    return {
      success: false,
      error: error.message,
      positions: {}
    }
  }
})
