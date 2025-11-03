import { clearLogs } from '../utils/logger.js'

export default defineEventHandler(async (event) => {
  try {
    await clearLogs()
    return {
      success: true,
      message: 'All logs cleared successfully'
    }
  } catch (error) {
    console.error('Error clearing logs:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
