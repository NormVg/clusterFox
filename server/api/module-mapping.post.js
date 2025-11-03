import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { sourceModuleUmid, cutoffModuleUmid, action } = body

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

    if (action === 'add') {
      // Add new mapping
      const existing = mappingsData.mappings.find(m => m.sourceModuleUmid === sourceModuleUmid)

      if (existing) {
        // Update existing mapping
        existing.cutoffModuleUmid = cutoffModuleUmid
        existing.updatedAt = new Date().toISOString()
      } else {
        // Create new mapping
        mappingsData.mappings.push({
          sourceModuleUmid,
          cutoffModuleUmid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    } else if (action === 'remove') {
      // Remove mapping
      mappingsData.mappings = mappingsData.mappings.filter(
        m => m.sourceModuleUmid !== sourceModuleUmid
      )
    }

    // Save mappings
    fs.writeFileSync(mappingsPath, JSON.stringify(mappingsData, null, 2))

    return {
      success: true,
      message: `Mapping ${action === 'add' ? 'added' : 'removed'} successfully`,
      mappings: mappingsData.mappings
    }
  } catch (error) {
    console.error('Error managing module mapping:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
