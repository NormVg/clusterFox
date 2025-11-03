import { readLogs, getLogStats } from '../utils/logger.js'

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters for filtering
    const query = getQuery(event)
    const limit = query.limit ? parseInt(query.limit) : undefined
    const type = query.type || 'all'
    const offset = query.offset ? parseInt(query.offset) : 0

    // Read all logs
    let logs = await readLogs()

    // Apply type filter
    if (type !== 'all') {
      logs = logs.filter(log => log.type === type)
    }

    // Apply pagination
    const totalCount = logs.length
    if (limit) {
      logs = logs.slice(offset, offset + limit)
    }

    // Get statistics
    const stats = await getLogStats()

    return {
      success: true,
      logs,
      pagination: {
        total: totalCount,
        offset,
        limit: limit || totalCount,
        hasMore: limit ? (offset + limit) < totalCount : false
      },
      stats
    }
  } catch (error) {
    console.error('Error reading logs:', error)
    return {
      success: false,
      error: error.message,
      logs: [],
      stats: { total: 0, success: 0, error: 0, warning: 0, info: 0 }
    }
  }
})
