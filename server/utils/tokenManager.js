/**
 * Token Management Utilities
 * Tracks and limits token usage to stay within free tier
 * Implements daily limits and rate limiting
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const USAGE_FILE = join(process.cwd(), 'server/data/token-usage.json');

// Google Gemini 1.5 Flash free tier limits
const LIMITS = {
  requestsPerMinute: 15,
  requestsPerDay: 1500,
  tokensPerMinute: 1000000,
  tokensPerDay: 50000000
};

// Safety margins (use 80% of limits)
const SAFE_LIMITS = {
  requestsPerMinute: Math.floor(LIMITS.requestsPerMinute * 0.8),
  requestsPerDay: Math.floor(LIMITS.requestsPerDay * 0.8),
  tokensPerMinute: Math.floor(LIMITS.tokensPerMinute * 0.8),
  tokensPerDay: Math.floor(LIMITS.tokensPerDay * 0.8)
};

/**
 * Load token usage data
 */
async function loadUsage() {
  try {
    const data = await fs.readFile(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      daily: {},
      minute: []
    };
  }
}

/**
 * Save token usage data
 */
async function saveUsage(usage) {
  try {
    await fs.writeFile(USAGE_FILE, JSON.stringify(usage, null, 2));
  } catch (error) {
    console.error('Failed to save token usage:', error);
  }
}

/**
 * Get current date key (YYYY-MM-DD)
 */
function getDateKey() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Clean old usage data (keep last 7 days)
 */
function cleanOldData(usage) {
  const dateKey = getDateKey();
  const dates = Object.keys(usage.daily);

  dates.forEach(date => {
    const daysDiff = Math.floor((new Date(dateKey) - new Date(date)) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      delete usage.daily[date];
    }
  });

  // Clean minute data older than 2 minutes
  const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
  usage.minute = usage.minute.filter(entry => entry.timestamp > twoMinutesAgo);
}

/**
 * Check if request can be made within limits
 */
export async function canMakeRequest(estimatedTokens = 1000) {
  const usage = await loadUsage();
  cleanOldData(usage);

  const dateKey = getDateKey();
  const now = Date.now();
  const oneMinuteAgo = now - (60 * 1000);

  // Initialize daily stats if needed
  if (!usage.daily[dateKey]) {
    usage.daily[dateKey] = {
      requests: 0,
      tokens: 0
    };
  }

  // Count requests and tokens in last minute
  const recentRequests = usage.minute.filter(entry => entry.timestamp > oneMinuteAgo);
  const requestsInMinute = recentRequests.length;
  const tokensInMinute = recentRequests.reduce((sum, entry) => sum + entry.tokens, 0);

  // Check daily limits
  const dailyRequests = usage.daily[dateKey].requests;
  const dailyTokens = usage.daily[dateKey].tokens;

  const checks = {
    requestsPerMinute: requestsInMinute < SAFE_LIMITS.requestsPerMinute,
    requestsPerDay: dailyRequests < SAFE_LIMITS.requestsPerDay,
    tokensPerMinute: (tokensInMinute + estimatedTokens) < SAFE_LIMITS.tokensPerMinute,
    tokensPerDay: (dailyTokens + estimatedTokens) < SAFE_LIMITS.tokensPerDay
  };

  const canProceed = Object.values(checks).every(check => check);

  if (!canProceed) {
    const reasons = [];
    if (!checks.requestsPerMinute) reasons.push(`requests/min limit (${requestsInMinute}/${SAFE_LIMITS.requestsPerMinute})`);
    if (!checks.requestsPerDay) reasons.push(`requests/day limit (${dailyRequests}/${SAFE_LIMITS.requestsPerDay})`);
    if (!checks.tokensPerMinute) reasons.push(`tokens/min limit (${tokensInMinute}/${SAFE_LIMITS.tokensPerMinute})`);
    if (!checks.tokensPerDay) reasons.push(`tokens/day limit (${dailyTokens}/${SAFE_LIMITS.tokensPerDay})`);

    return {
      allowed: false,
      reason: `Rate limit exceeded: ${reasons.join(', ')}`,
      limits: {
        requestsPerMinute: `${requestsInMinute}/${SAFE_LIMITS.requestsPerMinute}`,
        requestsPerDay: `${dailyRequests}/${SAFE_LIMITS.requestsPerDay}`,
        tokensPerMinute: `${tokensInMinute}/${SAFE_LIMITS.tokensPerMinute}`,
        tokensPerDay: `${dailyTokens}/${SAFE_LIMITS.tokensPerDay}`
      }
    };
  }

  return {
    allowed: true,
    limits: {
      requestsPerMinute: `${requestsInMinute}/${SAFE_LIMITS.requestsPerMinute}`,
      requestsPerDay: `${dailyRequests}/${SAFE_LIMITS.requestsPerDay}`,
      tokensPerMinute: `${tokensInMinute}/${SAFE_LIMITS.tokensPerMinute}`,
      tokensPerDay: `${dailyTokens}/${SAFE_LIMITS.tokensPerDay}`
    }
  };
}

/**
 * Record token usage after successful request
 */
export async function recordUsage(tokenCount) {
  const usage = await loadUsage();
  cleanOldData(usage);

  const dateKey = getDateKey();
  const now = Date.now();

  // Initialize daily stats if needed
  if (!usage.daily[dateKey]) {
    usage.daily[dateKey] = {
      requests: 0,
      tokens: 0
    };
  }

  // Update daily stats
  usage.daily[dateKey].requests++;
  usage.daily[dateKey].tokens += tokenCount;

  // Update minute stats
  usage.minute.push({
    timestamp: now,
    tokens: tokenCount
  });

  await saveUsage(usage);

  console.log(`[Token Usage] Recorded: ${tokenCount} tokens (Daily: ${usage.daily[dateKey].tokens}/${SAFE_LIMITS.tokensPerDay})`);
}

/**
 * Get usage statistics
 */
export async function getUsageStats() {
  const usage = await loadUsage();
  cleanOldData(usage);

  const dateKey = getDateKey();
  const daily = usage.daily[dateKey] || { requests: 0, tokens: 0 };

  const now = Date.now();
  const oneMinuteAgo = now - (60 * 1000);
  const recentRequests = usage.minute.filter(entry => entry.timestamp > oneMinuteAgo);

  return {
    today: {
      requests: daily.requests,
      tokens: daily.tokens,
      requestsLimit: SAFE_LIMITS.requestsPerDay,
      tokensLimit: SAFE_LIMITS.tokensPerDay,
      requestsPercentage: Math.round((daily.requests / SAFE_LIMITS.requestsPerDay) * 100),
      tokensPercentage: Math.round((daily.tokens / SAFE_LIMITS.tokensPerDay) * 100)
    },
    lastMinute: {
      requests: recentRequests.length,
      tokens: recentRequests.reduce((sum, entry) => sum + entry.tokens, 0),
      requestsLimit: SAFE_LIMITS.requestsPerMinute,
      tokensLimit: SAFE_LIMITS.tokensPerMinute
    },
    limits: SAFE_LIMITS
  };
}
