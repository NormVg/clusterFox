import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to the logs JSON file - resolve to project root
const projectRoot = process.cwd()
const LOGS_DIR = path.join(projectRoot, 'server/data/logs')
const LOGS_FILE = path.join(LOGS_DIR, 'activity.json')

console.log('📂 Logs directory:', LOGS_DIR)
console.log('📄 Logs file:', LOGS_FILE)

// Maximum number of logs to keep (FIFO)
const MAX_LOGS = 10000

/**
 * Initialize the log file if it doesn't exist
 */
async function initializeLogFile() {
  try {
    await fs.access(LOGS_FILE)
  } catch {
    // File doesn't exist, create directory and file
    console.log('📝 Creating logs directory and file...')
    await fs.mkdir(LOGS_DIR, { recursive: true })
    await fs.writeFile(LOGS_FILE, JSON.stringify({ logs: [], metadata: { created: new Date().toISOString(), totalCount: 0 } }, null, 2))
    console.log('✅ Logs file created successfully')
  }
}

/**
 * Read all logs from the JSON file
 * @returns {Promise<Array>} Array of log entries
 */
export async function readLogs() {
  try {
    await initializeLogFile()
    const data = await fs.readFile(LOGS_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.logs || []
  } catch (error) {
    console.error('Error reading logs:', error)
    return []
  }
}

/**
 * Append a log entry to the JSON file
 * @param {Object} logEntry - The log entry to append
 * @param {string} logEntry.type - Log type: 'success', 'error', 'warning', 'info'
 * @param {string} logEntry.message - Log message
 * @param {string} [logEntry.details] - Additional details (optional)
 * @param {Object} [logEntry.rawData] - Raw data object (optional)
 * @returns {Promise<Object>} The created log entry with ID and timestamp
 */
export async function appendLog(logEntry) {
  try {
    await initializeLogFile()

    // Read existing logs
    const data = await fs.readFile(LOGS_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    const logs = parsed.logs || []
    const metadata = parsed.metadata || { created: new Date().toISOString(), totalCount: 0 }

    // Check for duplicate log in last 5 seconds (prevents rapid duplicate logging)
    const fiveSecondsAgo = Date.now() - 5000
    const isDuplicate = logs.some(log => {
      const logTime = new Date(log.createdAt).getTime()
      return (
        log.message === logEntry.message &&
        log.type === logEntry.type &&
        logTime > fiveSecondsAgo
      )
    })

    if (isDuplicate) {
      console.log('⚠️ Skipping duplicate log:', logEntry.message)
      return null
    }

    // Create new log entry with ID and timestamp
    const newLog = {
      id: metadata.totalCount + 1,
      type: logEntry.type || 'info',
      message: logEntry.message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      createdAt: new Date().toISOString(),
      details: logEntry.details || null,
      rawData: logEntry.rawData || null
    }

    // Add to beginning of array (newest first)
    logs.unshift(newLog)

    // Trim logs if exceeds max
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS)
    }

    // Update metadata
    metadata.totalCount += 1
    metadata.lastUpdated = new Date().toISOString()

    // Write back to file
    await fs.writeFile(LOGS_FILE, JSON.stringify({ logs, metadata }, null, 2))

    return newLog
  } catch (error) {
    console.error('Error appending log:', error)
    throw error
  }
}

/**
 * Append multiple log entries at once (batch operation)
 * @param {Array<Object>} logEntries - Array of log entries
 * @returns {Promise<Array>} Array of created log entries
 */
export async function appendLogs(logEntries) {
  try {
    await initializeLogFile()

    // Read existing logs
    const data = await fs.readFile(LOGS_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    const logs = parsed.logs || []
    const metadata = parsed.metadata || { created: new Date().toISOString(), totalCount: 0 }

    const newLogs = []

    // Create new log entries
    for (const logEntry of logEntries) {
      const newLog = {
        id: metadata.totalCount + newLogs.length + 1,
        type: logEntry.type || 'info',
        message: logEntry.message,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        createdAt: new Date().toISOString(),
        details: logEntry.details || null,
        rawData: logEntry.rawData || null
      }
      newLogs.push(newLog)
    }

    // Add to beginning of array (newest first)
    logs.unshift(...newLogs)

    // Trim logs if exceeds max
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS)
    }

    // Update metadata
    metadata.totalCount += newLogs.length
    metadata.lastUpdated = new Date().toISOString()

    // Write back to file
    await fs.writeFile(LOGS_FILE, JSON.stringify({ logs, metadata }, null, 2))

    return newLogs
  } catch (error) {
    console.error('Error appending logs:', error)
    throw error
  }
}

/**
 * Clear all logs
 * @returns {Promise<void>}
 */
export async function clearLogs() {
  try {
    await fs.writeFile(LOGS_FILE, JSON.stringify({
      logs: [],
      metadata: {
        created: new Date().toISOString(),
        totalCount: 0,
        lastCleared: new Date().toISOString()
      }
    }, null, 2))
  } catch (error) {
    console.error('Error clearing logs:', error)
    throw error
  }
}

/**
 * Get log statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getLogStats() {
  try {
    const logs = await readLogs()

    return {
      total: logs.length,
      success: logs.filter(log => log.type === 'success').length,
      error: logs.filter(log => log.type === 'error').length,
      warning: logs.filter(log => log.type === 'warning').length,
      info: logs.filter(log => log.type === 'info').length
    }
  } catch (error) {
    console.error('Error getting log stats:', error)
    return { total: 0, success: 0, error: 0, warning: 0, info: 0 }
  }
}
