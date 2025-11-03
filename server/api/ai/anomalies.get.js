/**
 * AI Anomaly Detection API
 * Detects unusual patterns and anomalies in IoT network data
 * Uses AI to identify issues that traditional rules might miss
 */

import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'

const anomalySchema = z.object({
  anomalies: z.array(z.object({
    type: z.enum(['critical', 'warning', 'info']),
    category: z.string(),
    description: z.string(),
    affectedModules: z.array(z.string()),
    recommendation: z.string(),
    confidence: z.number().min(0).max(100)
  })),
  overallRisk: z.enum(['low', 'medium', 'high', 'critical']),
  summary: z.string()
})

export default defineEventHandler(async (event) => {
  try {
    console.log('[AI Anomaly] Starting detection...')

    // Check API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey || apiKey === 'your_google_api_key_here') {
      return {
        success: false,
        error: 'API key not configured'
      }
    }

    // Read data
    const dataDir = path.join(process.cwd(), 'server', 'data')
    const [modulesData, sensorData, emergencyHistory, logs] = await Promise.all([
      fs.readFile(path.join(dataDir, 'modules.json'), 'utf-8').then(JSON.parse).catch(() => ({ modules: [] })),
      fs.readFile(path.join(dataDir, 'sensor-data.json'), 'utf-8').then(JSON.parse).catch(() => ({ data: [] })),
      fs.readFile(path.join(dataDir, 'emergency-history.json'), 'utf-8').then(JSON.parse).catch(() => []),
      fs.readFile(path.join(dataDir, 'logs', 'activity.json'), 'utf-8').then(JSON.parse).catch(() => ({ logs: [] }))
    ])

    const modules = modulesData.modules || []
    const data = sensorData.data || []
    const emergencies = emergencyHistory || []
    const activityLogs = logs.logs || []

    // Prepare data for anomaly detection
    const recentData = data.slice(-100) // Last 100 data points
    const recentEmergencies = emergencies.slice(-20) // Last 20 emergencies
    const recentLogs = activityLogs.slice(-50) // Last 50 logs

    // Call Gemini with structured output
    console.log('[AI Anomaly] Calling Gemini...')
    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: anomalySchema,
      prompt: `Analyze this IoT network data for anomalies, unusual patterns, and potential issues.

MODULES (${modules.length} total):
${JSON.stringify(modules.slice(0, 20), null, 2)}

RECENT SENSOR DATA (last 100 readings):
${JSON.stringify(recentData, null, 2)}

RECENT EMERGENCIES (last 20):
${JSON.stringify(recentEmergencies, null, 2)}

RECENT LOGS (last 50):
${JSON.stringify(recentLogs, null, 2)}

Detect:
1. Unusual patterns (e.g., sudden battery drops, signal issues)
2. Modules with concerning metrics
3. Data transmission anomalies
4. Error patterns in logs
5. Potential cascading failures

For each anomaly, provide:
- Type (critical/warning/info)
- Category (e.g., "Battery", "Connectivity", "Data Quality")
- Clear description
- Affected module IDs
- Actionable recommendation
- Confidence score (0-100)

Also provide overall risk level and summary.`,
      temperature: 0.3 // Lower temperature for more consistent detection
    })

    console.log('[AI Anomaly] Detected:', result.object.anomalies.length, 'anomalies')

    return {
      success: true,
      detection: result.object,
      timestamp: new Date().toISOString(),
      dataPoints: {
        modules: modules.length,
        recentData: recentData.length,
        recentEmergencies: recentEmergencies.length,
        recentLogs: recentLogs.length
      }
    }

  } catch (error) {
    console.error('[AI Anomaly] Error:', error.message)
    return {
      success: false,
      error: error.message,
      detection: {
        anomalies: [],
        overallRisk: 'low',
        summary: 'Unable to perform anomaly detection at this time'
      }
    }
  }
})
