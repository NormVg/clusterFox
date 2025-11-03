import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const uptimePath = join(process.cwd(), 'server', 'data', 'uptime.json')

// Global server start time (persists for server lifetime)
let serverStartTime = null

function getServerStartTime() {
  if (serverStartTime) return serverStartTime

  try {
    if (existsSync(uptimePath)) {
      const data = JSON.parse(readFileSync(uptimePath, 'utf-8'))
      serverStartTime = data.startTime || Date.now()
    } else {
      serverStartTime = Date.now()
      writeFileSync(uptimePath, JSON.stringify({ startTime: serverStartTime }, null, 2))
    }
  } catch (error) {
    console.error('[Uptime] Error managing uptime file:', error)
    serverStartTime = Date.now()
  }

  return serverStartTime
}

export default defineEventHandler((event) => {
  const startTime = getServerStartTime()
  const now = Date.now()
  const uptime = now - startTime

  const days = Math.floor(uptime / 86400000)
  const hours = Math.floor((uptime % 86400000) / 3600000)
  const minutes = Math.floor((uptime % 3600000) / 60000)
  const seconds = Math.floor((uptime % 60000) / 1000)

  return {
    success: true,
    startTime: startTime,
    currentTime: now,
    uptimeMs: uptime,
    uptime: {
      days,
      hours,
      minutes,
      seconds
    },
    formatted: days > 0 
      ? `${days}d ${hours}h ${minutes}m`
      : hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`
  }
})
