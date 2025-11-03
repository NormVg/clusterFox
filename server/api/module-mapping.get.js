import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const mappingsPath = path.join(process.cwd(), 'server', 'data', 'cutoff-mappings.json')
    // Ensure file exists
    if (!fs.existsSync(mappingsPath)) {
      const dir = path.dirname(mappingsPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(mappingsPath, JSON.stringify({ mappings: [] }, null, 2))
    }
    const mappingsData = JSON.parse(fs.readFileSync(mappingsPath, 'utf-8'))

    return {
      success: true,
      mappings: mappingsData.mappings
    }
  } catch (error) {
    console.error('Error reading module mappings:', error)
    return {
      success: false,
      error: error.message,
      mappings: []
    }
  }
})
