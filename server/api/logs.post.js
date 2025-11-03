import { appendLog, appendLogs } from '../utils/logger.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Support both single log and batch logs
    if (Array.isArray(body)) {
      // Batch operation
      const logs = await appendLogs(body)
      return {
        success: true,
        message: `${logs.length} logs appended successfully`,
        logs
      }
    } else {
      // Single log
      const log = await appendLog(body)
      return {
        success: true,
        message: 'Log appended successfully',
        log
      }
    }
  } catch (error) {
    console.error('Error appending log:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
