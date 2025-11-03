/**
 * Data Aggregation Pipeline
 * Summarizes and reduces IoT data before sending to AI model
 * Minimizes token usage while preserving critical insights
 */

/**
 * Aggregate module data into compact summary
 * Reduces hundreds of module entries to key statistics
 */
export function aggregateModules(modules) {
  if (!modules || modules.length === 0) {
    return {
      total: 0,
      summary: 'No modules available'
    };
  }

  const statusCounts = {};
  const typeCounts = {};
  const batteryStats = { low: 0, medium: 0, high: 0 };
  const signalStats = { weak: 0, medium: 0, strong: 0 };
  let offlineModules = [];
  let criticalModules = [];

  modules.forEach(module => {
    // Count status
    statusCounts[module.status] = (statusCounts[module.status] || 0) + 1;

    // Count types
    typeCounts[module.type] = (typeCounts[module.type] || 0) + 1;

    // Battery analysis
    if (module.battery < 20) {
      batteryStats.low++;
      criticalModules.push({ id: module.id, reason: 'low battery', value: module.battery });
    } else if (module.battery < 50) {
      batteryStats.medium++;
    } else {
      batteryStats.high++;
    }

    // Signal analysis
    if (module.signal < -80) {
      signalStats.weak++;
      if (module.signal < -90) {
        criticalModules.push({ id: module.id, reason: 'very weak signal', value: module.signal });
      }
    } else if (module.signal < -60) {
      signalStats.medium++;
    } else {
      signalStats.strong++;
    }

    // Track offline
    if (module.status === 'offline') {
      offlineModules.push(module.id);
    }
  });

  // Only include critical modules (limit to top 5)
  criticalModules = criticalModules.slice(0, 5);

  return {
    total: modules.length,
    status: statusCounts,
    types: typeCounts,
    battery: {
      critical: batteryStats.low,
      warning: batteryStats.medium,
      healthy: batteryStats.high
    },
    signal: {
      weak: signalStats.weak,
      medium: signalStats.medium,
      strong: signalStats.strong
    },
    offline: offlineModules.length,
    criticalIssues: criticalModules.length > 0 ? criticalModules : undefined
  };
}

/**
 * Aggregate sensor data into statistical summary
 * Reduces thousands of data points to trends and statistics
 */
export function aggregateSensorData(sensorData) {
  if (!sensorData || sensorData.length === 0) {
    return {
      total: 0,
      summary: 'No sensor data available'
    };
  }

  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  const recentData = sensorData.filter(d => new Date(d.timestamp).getTime() > oneHourAgo);
  const dayData = sensorData.filter(d => new Date(d.timestamp).getTime() > oneDayAgo);

  // Calculate statistics per module
  const moduleStats = {};
  recentData.forEach(data => {
    if (!moduleStats[data.moduleId]) {
      moduleStats[data.moduleId] = {
        count: 0,
        temperatures: [],
        values: []
      };
    }
    moduleStats[data.moduleId].count++;
    if (data.temperature) moduleStats[data.moduleId].temperatures.push(data.temperature);
    if (data.value) moduleStats[data.moduleId].values.push(data.value);
  });

  // Find anomalies (very high/low values)
  const anomalies = [];
  Object.entries(moduleStats).forEach(([moduleId, stats]) => {
    if (stats.temperatures.length > 0) {
      const avgTemp = stats.temperatures.reduce((a, b) => a + b, 0) / stats.temperatures.length;
      const maxTemp = Math.max(...stats.temperatures);
      const minTemp = Math.min(...stats.temperatures);

      if (maxTemp > 80 || minTemp < -20) {
        anomalies.push({
          moduleId,
          type: 'temperature',
          avg: Math.round(avgTemp * 10) / 10,
          max: maxTemp,
          min: minTemp
        });
      }
    }
  });

  return {
    total: sensorData.length,
    last1h: recentData.length,
    last24h: dayData.length,
    activeModules: Object.keys(moduleStats).length,
    avgDataPerModule: recentData.length > 0 ? Math.round(recentData.length / Object.keys(moduleStats).length) : 0,
    dataRate: `${recentData.length}/hour`,
    anomalies: anomalies.length > 0 ? anomalies.slice(0, 3) : undefined
  };
}

/**
 * Aggregate emergency history into pattern summary
 * Reduces event list to trends and critical patterns
 */
export function aggregateEmergencies(emergencies) {
  if (!emergencies || emergencies.length === 0) {
    return {
      total: 0,
      summary: 'No emergencies recorded'
    };
  }

  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  const recentEvents = emergencies.filter(e => new Date(e.timestamp).getTime() > oneHourAgo);
  const dayEvents = emergencies.filter(e => new Date(e.timestamp).getTime() > oneDayAgo);

  // Count by severity
  const severityCounts = {};
  const moduleFrequency = {};

  recentEvents.forEach(event => {
    severityCounts[event.severity] = (severityCounts[event.severity] || 0) + 1;
    moduleFrequency[event.moduleId] = (moduleFrequency[event.moduleId] || 0) + 1;
  });

  // Find modules with frequent emergencies
  const frequentModules = Object.entries(moduleFrequency)
    .filter(([_, count]) => count > 2)
    .map(([moduleId, count]) => ({ moduleId, count }))
    .slice(0, 3);

  return {
    total: emergencies.length,
    last1h: recentEvents.length,
    last24h: dayEvents.length,
    severity: severityCounts,
    frequentModules: frequentModules.length > 0 ? frequentModules : undefined,
    trend: recentEvents.length > 5 ? 'increasing' : recentEvents.length > 0 ? 'normal' : 'none'
  };
}

/**
 * Aggregate activity logs into actionable summary
 * Reduces log entries to error patterns and warnings
 */
export function aggregateLogs(logs) {
  if (!logs || logs.length === 0) {
    return {
      total: 0,
      summary: 'No logs available'
    };
  }

  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  const recentLogs = logs.filter(log => new Date(log.timestamp).getTime() > oneHourAgo);

  const levelCounts = { error: 0, warning: 0, info: 0 };
  const errorTypes = {};
  const criticalErrors = [];

  recentLogs.forEach(log => {
    levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;

    if (log.level === 'error') {
      // Extract error type from message
      const errorMatch = log.message.match(/^(\w+Error|Error)/);
      if (errorMatch) {
        const errorType = errorMatch[1];
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      }

      // Collect critical errors
      if (criticalErrors.length < 3) {
        criticalErrors.push({
          message: log.message.substring(0, 100),
          timestamp: log.timestamp
        });
      }
    }
  });

  return {
    total: logs.length,
    last1h: recentLogs.length,
    levels: levelCounts,
    errorTypes: Object.keys(errorTypes).length > 0 ? errorTypes : undefined,
    criticalErrors: criticalErrors.length > 0 ? criticalErrors : undefined,
    healthStatus: levelCounts.error > 5 ? 'critical' : levelCounts.warning > 10 ? 'warning' : 'healthy'
  };
}

/**
 * Build complete aggregated context for AI analysis
 * Returns compact, token-optimized data structure
 */
export function buildAggregatedContext(modules, sensorData, emergencies, logs) {
  return {
    modules: aggregateModules(modules),
    sensors: aggregateSensorData(sensorData),
    emergencies: aggregateEmergencies(emergencies),
    logs: aggregateLogs(logs),
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate estimated token count for context
 * Rough estimate: 1 token ≈ 4 characters
 */
export function estimateTokens(data) {
  const jsonString = JSON.stringify(data);
  return Math.ceil(jsonString.length / 4);
}
