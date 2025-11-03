/**
 * AI Response Cache
 * Reduces API calls by caching recent AI insights
 * Implements time-based expiration and change detection
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const CACHE_FILE = join(process.cwd(), 'server/data/ai-cache.json');
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generate hash of data context for change detection
 */
function generateContextHash(context) {
  const contextString = JSON.stringify(context);
  return crypto.createHash('md5').update(contextString).digest('hex');
}

/**
 * Load cache from file
 */
async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Cache file doesn't exist or is invalid
    return {
      lastHash: null,
      lastInsights: null,
      lastTimestamp: null,
      requestCount: 0,
      tokensSaved: 0
    };
  }
}

/**
 * Save cache to file
 */
async function saveCache(cache) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Failed to save AI cache:', error);
  }
}

/**
 * Check if cached insights are still valid
 */
export async function getCachedInsights(context) {
  const cache = await loadCache();

  if (!cache.lastInsights || !cache.lastTimestamp) {
    return null;
  }

  const now = Date.now();
  const cacheAge = now - new Date(cache.lastTimestamp).getTime();

  // Check if cache is expired
  if (cacheAge > CACHE_DURATION) {
    return null;
  }

  // Check if context has changed significantly
  const currentHash = generateContextHash(context);
  if (currentHash === cache.lastHash) {
    // Context unchanged, return cached insights
    console.log(`[AI Cache] Using cached insights (age: ${Math.round(cacheAge / 1000)}s)`);

    // Update stats
    cache.requestCount++;
    await saveCache(cache);

    return {
      ...cache.lastInsights,
      cached: true,
      cacheAge: Math.round(cacheAge / 1000)
    };
  }

  return null;
}

/**
 * Store new insights in cache
 */
export async function setCachedInsights(context, insights, tokenCount) {
  const cache = await loadCache();

  const currentHash = generateContextHash(context);
  const now = new Date().toISOString();

  // Calculate tokens saved if this was a cache hit
  const tokensSaved = cache.lastHash === currentHash ? tokenCount : 0;

  const newCache = {
    lastHash: currentHash,
    lastInsights: insights,
    lastTimestamp: now,
    requestCount: cache.requestCount + 1,
    tokensSaved: cache.tokensSaved + tokensSaved,
    lastTokenCount: tokenCount
  };

  await saveCache(newCache);

  console.log(`[AI Cache] Stored new insights (${tokenCount} tokens)`);
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  const cache = await loadCache();

  return {
    totalRequests: cache.requestCount || 0,
    tokensSaved: cache.tokensSaved || 0,
    lastUpdate: cache.lastTimestamp,
    cacheExists: !!cache.lastInsights
  };
}

/**
 * Clear cache (useful for testing or forced refresh)
 */
export async function clearCache() {
  const emptyCache = {
    lastHash: null,
    lastInsights: null,
    lastTimestamp: null,
    requestCount: 0,
    tokensSaved: 0
  };

  await saveCache(emptyCache);
  console.log('[AI Cache] Cache cleared');
}
