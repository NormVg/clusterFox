/**
 * Token Usage Statistics API
 * Returns current token usage and rate limit status
 */

import { getUsageStats } from '../../utils/tokenManager.js'
import { getCacheStats } from '../../utils/aiCache.js'

export default defineEventHandler(async (event) => {
  try {
    const [usageStats, cacheStats] = await Promise.all([
      getUsageStats(),
      getCacheStats()
    ])

    return {
      success: true,
      usage: usageStats,
      cache: cacheStats,
      efficiency: {
        cacheHitRate: cacheStats.totalRequests > 0
          ? Math.round((cacheStats.tokensSaved / (usageStats.today.tokens + cacheStats.tokensSaved)) * 100)
          : 0,
        totalTokensSaved: cacheStats.tokensSaved
      },
      recommendations: generateRecommendations(usageStats, cacheStats)
    }
  } catch (error) {
    console.error('Error getting token usage stats:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

function generateRecommendations(usage, cache) {
  const recommendations = []

  // Check if approaching daily limit
  if (usage.today.tokensPercentage > 80) {
    recommendations.push({
      level: 'warning',
      message: `High token usage today: ${usage.today.tokensPercentage}% of daily limit used`
    })
  }

  if (usage.today.requestsPercentage > 80) {
    recommendations.push({
      level: 'warning',
      message: `High API request count: ${usage.today.requestsPercentage}% of daily limit used`
    })
  }

  // Cache efficiency
  if (cache.totalRequests > 10 && cache.tokensSaved < 1000) {
    recommendations.push({
      level: 'info',
      message: 'Cache is working but not saving many tokens yet. This improves over time.'
    })
  }

  if (cache.tokensSaved > 5000) {
    recommendations.push({
      level: 'success',
      message: `Excellent! Cache has saved ${cache.tokensSaved} tokens so far.`
    })
  }

  // General tips
  if (recommendations.length === 0) {
    recommendations.push({
      level: 'success',
      message: 'Token usage is healthy. The system is operating efficiently.'
    })
  }

  return recommendations
}
