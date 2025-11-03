/**
 * AI Chat Assistant API
 * Interactive conversational interface to query IoT network data
 * Users can ask natural language questions about their network
 */

import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import fs from 'fs/promises'
import path from 'path'
import { buildAggregatedContext } from '../../utils/dataAggregator.js'

export default defineEventHandler(async (event) => {
  try {
    // Get user message from query or body
    const query = getQuery(event)
    const body = await readBody(event).catch(() => ({}))
    const userMessage = query.message || body.message || ''

    if (!userMessage) {
      return {
        success: false,
        error: 'No message provided'
      }
    }

    // Check API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey || apiKey === 'your_google_api_key_here') {
      return {
        success: false,
        error: 'API key not configured'
      }
    }

    console.log('[AI Chat] User asked:', userMessage.substring(0, 100))

    // Read current network data
    const dataDir = path.join(process.cwd(), 'server', 'data')
    const [modulesData, sensorData, emergencyHistory, activityLogs] = await Promise.all([
      fs.readFile(path.join(dataDir, 'modules.json'), 'utf-8').then(JSON.parse).catch(() => ({ modules: [] })),
      fs.readFile(path.join(dataDir, 'sensor-data.json'), 'utf-8').then(JSON.parse).catch(() => ({ data: [] })),
      fs.readFile(path.join(dataDir, 'emergency-history.json'), 'utf-8').then(JSON.parse).catch(() => []),
      fs.readFile(path.join(dataDir, 'logs', 'activity.json'), 'utf-8').then(JSON.parse).catch(() => ({ logs: [] }))
    ])

    // Build context
    const context = buildAggregatedContext(
      modulesData.modules || [],
      sensorData.data || [],
      emergencyHistory || [],
      activityLogs.logs || []
    )

    // System prompt with network context
    const systemPrompt = `You are an IoT network assistant for ClusterFox. Help users understand their network data.

CURRENT NETWORK STATE:
${JSON.stringify(context, null, 2)}

Guidelines:
- Be concise and helpful
- Reference specific data points when answering
- If asked about a specific module, check if it exists in the data
- Suggest actions when relevant
- If you don't have the data, say so clearly`

    // Call Gemini with streaming
    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.7,
      maxTokens: 500
    })

    // Return the stream
    return result.toDataStreamResponse()

  } catch (error) {
    console.error('[AI Chat] Error:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
})
