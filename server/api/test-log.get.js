import { appendLog } from '../utils/logger.js'

export default defineEventHandler(async (event) => {
  try {
    // Create a test log entry
    const testLog = await appendLog({
      type: 'info',
      message: 'Test log entry - System check',
      details: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        note: 'This is a manual test log entry'
      }, null, 2)
    })

    return {
      success: true,
      message: 'Test log created successfully',
      log: testLog
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})
