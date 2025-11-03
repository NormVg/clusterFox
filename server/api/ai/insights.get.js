/**
 * AI Insights API - Clean rebuild using Vercel AI SDK + Google Gemini
 */

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import fs from 'fs/promises'
import path from 'path'
import {
  buildAggregatedContext,
  estimateTokens
} from '../../utils/dataAggregator.js'
import {
  getCachedInsights,
  setCachedInsights
} from '../../utils/aiCache.js'
import {
  canMakeRequest,
  recordUsage
} from '../../utils/tokenManager.js'

export default defineEventHandler(async (event) => {
  try {
    console.log('[AI] Starting insights generation...')

    // Check API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey || apiKey === 'your_google_api_key_here') {
      return {
        success: false,
        error: 'API key not configured',
        insights: {
          summary: 'AI insights unavailable - API key not configured',
          recommendations: ['Get API key from https://aistudio.google.com/app/apikey'],
          criticalIssues: [],
          opportunities: []
        }
      }
    }

    // Read data
    const dataDir = path.join(process.cwd(), 'server', 'data')
    const [modulesData, sensorData, emergencyHistory, activityLogs] = await Promise.all([
      fs.readFile(path.join(dataDir, 'modules.json'), 'utf-8').then(JSON.parse).catch(() => ({ modules: [] })),
      fs.readFile(path.join(dataDir, 'sensor-data.json'), 'utf-8').then(JSON.parse).catch(() => ({ data: [] })),
      fs.readFile(path.join(dataDir, 'emergency-history.json'), 'utf-8').then(JSON.parse).catch(() => []),
      fs.readFile(path.join(dataDir, 'logs', 'activity.json'), 'utf-8').then(JSON.parse).catch(() => ({ logs: [] }))
    ])

    const context = buildAggregatedContext(
      modulesData.modules || [],
      sensorData.data || [],
      emergencyHistory || [],
      activityLogs.logs || []
    )

    const tokens = estimateTokens(context)
    console.log(`[AI] Aggregated: ~${tokens} tokens`)

    // Check cache
    const cached = await getCachedInsights(context)
    if (cached) {
      console.log('[AI] Cache hit')
      return {
        success: true,
        insights: cached,
        timestamp: new Date().toISOString(),
        tokenUsage: 0,
        source: 'cache'
      }
    }

    // Rate limit
    const limit = await canMakeRequest(tokens)
    if (!limit.allowed) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        insights: {
          summary: 'Rate limit reached',
          recommendations: ['Wait a few minutes'],
          criticalIssues: [],
          opportunities: []
        }
      }
    }

    // Call Gemini
    console.log('[AI] Calling Gemini...')
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `Analyze this IoT network data and respond with JSON:

${JSON.stringify(context, null, 2)}

Format: {"summary":"text","recommendations":["a","b"],"criticalIssues":[],"opportunities":[]}`,
      temperature: 0.7,
      maxTokens: 800
    })

    // Parse response
    const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    const insights = match ? JSON.parse(match[0]) : {
      summary: cleaned.substring(0, 150),
      recommendations: ['Check logs'],
      criticalIssues: [],
      opportunities: []
    }

    const actualTokens = tokens + estimateTokens(text)
    await recordUsage(actualTokens)
    await setCachedInsights(context, insights, actualTokens)

    console.log(`[AI] Success: ${actualTokens} tokens`)

    return {
      success: true,
      insights,
      timestamp: new Date().toISOString(),
      tokenUsage: actualTokens,
      source: 'api'
    }

  } catch (error) {
    console.error('[AI] Error:', error.message)
    return {
      success: false,
      error: error.message,
      insights: {
        summary: 'Error generating insights',
        recommendations: ['Check logs', 'Verify API key'],
        criticalIssues: [],
        opportunities: []
      }
    }
  }
})
