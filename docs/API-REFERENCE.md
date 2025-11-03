# ClusterFox API Reference

Complete API documentation for ClusterFox IoT monitoring system.

**Version:** 2.0  
**Base URL:** `http://localhost:3000` (development)  
**Port:** 3000

---

## Table of Contents

1. [Module Management](#module-management)
2. [Sensor Data](#sensor-data)
3. [Emergency System](#emergency-system)
4. [Analytics & Performance](#analytics--performance)
5. [System Status](#system-status)
6. [Settings & Configuration](#settings--configuration)
7. [Network & Mapping](#network--mapping)
8. [Status Badges & States](#status-badges--states)

---

## Module Management

### Register Module
Register a new IoT module or retrieve existing session.

**Endpoint:** `GET /api/register`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Module type (e.g., "temperature-sensor") |
| `umid` | string | Yes | Unique Module ID |

**Response:**
```json
{
  "success": true,
  "session_id": "abc123...",
  "umid": "ESP32-001",
  "moduleType": "temperature-sensor",
  "status": "new" | "existing"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing parameters

---

### Get Modules
Retrieve all registered modules.

**Endpoint:** `GET /api/modules`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | No | Filter by specific session |
| `_t` | number | No | Cache-busting timestamp |

**Response:**
```json
{
  "success": true,
  "count": 13,
  "modules": [
    {
      "session_id": "abc123...",
      "umid": "ESP32-001",
      "moduleType": "temperature-humidity",
      "typeComponents": ["temperature", "humidity"],
      "registeredAt": "2025-11-01T10:30:00.000Z",
      "lastSeen": "2025-11-03T14:28:16.300Z",
      "status": "active",
      "dataCount": 292,
      "triggers": {
        "temperature": {
          "enabled": true,
          "threshold": 35,
          "condition": "above"
        }
      }
    }
  ]
}
```

**Module Status:**
- `active` - Module is online and reporting
- `inactive` - Module hasn't reported recently
- `offline` - Module is disconnected

---

### Update Module Triggers
Update emergency trigger thresholds for a module.

**Endpoint:** `PUT /api/modules`

**Request Body:**
```json
{
  "umid": "ESP32-001",
  "triggers": {
    "temperature": {
      "enabled": true,
      "threshold": 35,
      "condition": "above"
    },
    "humidity": {
      "enabled": true,
      "threshold": 80,
      "condition": "above"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module triggers updated",
  "umid": "ESP32-001"
}
```

---

### Delete Module
Remove a module from the system.

**Endpoint:** `POST /api/module-delete`

**Request Body:**
```json
{
  "umid": "ESP32-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module deleted successfully",
  "umid": "ESP32-001"
}
```

---

## Sensor Data

### Post Sensor Data
Submit sensor readings from a module.

**Endpoint:** `POST /api/pool`

**Request Body:**
```json
{
  "session_id": "abc123...",
  "data": {
    "temp": 25.5,
    "humi": 65.2
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data received",
  "dataId": "xyz789..."
}
```

---

### Get Sensor Data
Retrieve sensor readings.

**Endpoint:** `GET /api/sensor-data`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Max readings to return (default: 1000) |
| `umid` | string | No | Filter by module ID |
| `_t` | number | No | Cache-busting timestamp |

**Response:**
```json
{
  "success": true,
  "count": 1000,
  "data": [
    {
      "session_id": "abc123...",
      "umid": "ESP32-001",
      "moduleType": "temperature-humidity",
      "data": {
        "temp": 25.5,
        "humi": 65.2
      },
      "timestamp": "2025-11-03T14:28:16.300Z",
      "receivedAt": 1730642896300
    }
  ]
}
```

---

## Emergency System

### Emergency Tracker
Check modules for emergency trigger conditions.

**Endpoint:** `POST /api/emergency-tracker`

**Description:** Analyzes all modules and their latest sensor data to detect emergency conditions based on configured triggers.

**Response:**
```json
{
  "success": true,
  "entry": {
    "timestamp": "2025-11-03T14:38:28.262Z",
    "eventType": "emergency_started",
    "count": 1,
    "modules": [
      {
        "umid": "ESP32-001",
        "moduleType": "temperature-humidity",
        "dataTimestamp": "2025-11-03T14:38:02.875Z",
        "triggeredCount": 1
      }
    ]
  }
}
```

**Event Types:**
- `emergency_started` - New emergency detected
- `emergency_ended` - All emergencies resolved
- `emergency_changed` - Emergency modules changed
- `update` - Status check (no state change)

---

### Emergency History
Get emergency event history and current status.

**Endpoint:** `GET /api/emergency-history`

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "timestamp": "2025-11-03T14:38:28.262Z",
      "eventType": "emergency_started",
      "count": 1,
      "modules": [...]
    }
  ],
  "current": {
    "isActive": true,
    "count": 1,
    "modules": [
      {
        "umid": "ESP32-001",
        "moduleType": "temperature-humidity",
        "dataTimestamp": "2025-11-03T14:38:02.875Z",
        "triggeredCount": 1
      }
    ],
    "lastUpdate": "2025-11-03T14:38:28.262Z"
  }
}
```

---

## Analytics & Performance

### Module Performance
Get performance metrics and rankings for all modules.

**Endpoint:** `GET /api/module-performance`

**Response:**
```json
{
  "success": true,
  "performance": [
    {
      "umid": "ESP32-001",
      "moduleType": "temperature-humidity",
      "score": 95,
      "rank": 1,
      "metrics": {
        "reliability": 98,
        "dataQuality": 95,
        "uptime": 92
      }
    }
  ]
}
```

---

### Trigger Statistics
Get statistics about configured triggers.

**Endpoint:** `GET /api/trigger-stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "temperature-humidity": {
      "moduleCount": 3,
      "totalTriggers": 6,
      "activeTriggers": 4
    }
  },
  "summary": {
    "totalModules": 13,
    "totalTriggers": 18,
    "activeTriggers": 12
  }
}
```

---

## System Status

### Uptime
Get server uptime information.

**Endpoint:** `GET /api/uptime`

**Response:**
```json
{
  "success": true,
  "startTime": 1730642896300,
  "currentTime": 1730645896300,
  "formatted": "50m",
  "uptime": {
    "days": 0,
    "hours": 0,
    "minutes": 50,
    "seconds": 0
  }
}
```

---

### Pool Status
Get current pool statistics.

**Endpoint:** `GET /api/pool`

**Response:**
```json
{
  "success": true,
  "totalReadings": 2145,
  "recentActivity": {
    "lastMinute": 5,
    "lastHour": 287
  }
}
```

---

## Settings & Configuration

### Get Settings
Retrieve system configuration.

**Endpoint:** `GET /api/settings`

**Response:**
```json
{
  "success": true,
  "settings": {
    "maxSensorReadings": 1000,
    "refreshInterval": 10,
    "theme": "dark",
    "sidebarCollapsed": false,
    "moduleActiveThreshold": 30,
    "moduleInactiveThreshold": 60,
    "enableEmergencyTriggers": true,
    "enableAudioAlerts": true,
    "enableNotifications": true,
    "enableAutoRefresh": true
  }
}
```

---

### Update Settings
Update system configuration.

**Endpoint:** `POST /api/settings`

**Request Body:**
```json
{
  "maxSensorReadings": 1000,
  "refreshInterval": 10,
  "moduleActiveThreshold": 30,
  "enableEmergencyTriggers": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated",
  "settings": { ... }
}
```

---

## Network & Mapping

### Node Positions
Get/Set module positions for network visualization.

**GET:** `GET /api/node-positions`

**Response:**
```json
{
  "success": true,
  "positions": {
    "ESP32-001": { "x": 100, "y": 200 },
    "ESP32-002": { "x": 300, "y": 150 }
  }
}
```

**POST:** `POST /api/node-positions`

**Request Body:**
```json
{
  "positions": {
    "ESP32-001": { "x": 100, "y": 200 }
  }
}
```

---

### Node Connections
Get/Set module connection relationships.

**GET:** `GET /api/node-connections`

**Response:**
```json
{
  "success": true,
  "connections": [
    {
      "source": "ESP32-001",
      "target": "ESP32-002",
      "strength": 0.8
    }
  ]
}
```

---

## Status Badges & States

### System Status

The system can be in one of three states:

| Status | Badge | Description | Condition |
|--------|-------|-------------|-----------|
| **Healthy** | <span style="color: #10b981">● Healthy</span> | All modules online | 100% modules active |
| **Degraded** | <span style="color: #f59e0b">● Degraded</span> | Some modules offline | 1-99% modules active |
| **Critical** | <span style="color: #ef4444">● Critical</span> | No modules online | 0% modules active |

---

### Module Status

Individual modules can have different statuses:

| Status | Badge | Description | Condition |
|--------|-------|-------------|-----------|
| **Online** | <span style="color: #10b981">● Online</span> | Module is active | Last seen < `moduleActiveThreshold` |
| **Inactive** | <span style="color: #f59e0b">● Inactive</span> | Module is slow | Last seen < `moduleInactiveThreshold` |
| **Offline** | <span style="color: #ef4444">● Offline</span> | Module disconnected | Last seen > `moduleInactiveThreshold` |

**Default Thresholds:**
- Online: Last seen within 30 seconds
- Inactive: Last seen within 60 seconds
- Offline: Last seen over 60 seconds

---

### Emergency Status

Emergency triggers can be in different states:

| Status | Badge | Description |
|--------|-------|-------------|
| **Active** | <span style="color: #ef4444">🚨 Emergency Active</span> | Sensor value exceeds threshold |
| **Resolved** | <span style="color: #10b981">✓ All Clear</span> | All values within normal range |
| **Monitoring** | <span style="color: #f59e0b">⚠ Monitoring</span> | Triggers enabled, no alerts |

---

### Data Quality Status

| Status | Badge | Description | Condition |
|--------|-------|-------------|-----------|
| **Excellent** | <span style="color: #10b981">● Excellent</span> | High quality data | > 95% valid readings |
| **Good** | <span style="color: #3b82f6">● Good</span> | Acceptable quality | 80-95% valid readings |
| **Fair** | <span style="color: #f59e0b">● Fair</span> | Some issues | 60-80% valid readings |
| **Poor** | <span style="color: #ef4444">● Poor</span> | Low quality data | < 60% valid readings |

---

### Trigger Conditions

Emergency triggers support two condition types:

| Condition | Symbol | Description | Example |
|-----------|--------|-------------|---------|
| **Above** | `>` | Trigger when value exceeds threshold | `temp > 35°C` |
| **Below** | `<` | Trigger when value drops below threshold | `battery < 10%` |

---

## Response Status Codes

All API endpoints return standard HTTP status codes:

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Request successful |
| `400` | Bad Request | Missing or invalid parameters |
| `404` | Not Found | Resource not found |
| `500` | Internal Server Error | Server error occurred |

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed description"
}
```

---

## Rate Limiting

Currently no rate limiting is enforced. This may change in production.

---

## Authentication

Module authentication uses `session_id` tokens generated during registration. Store and include this token in subsequent requests.

**Example:**
```bash
# Register first
SESSION_ID=$(curl -s "http://localhost:3000/api/register?type=temp-sensor&umid=ESP32-001" | jq -r '.session_id')

# Use session_id for data submission
curl -X POST http://localhost:3000/api/pool \
  -H "Content-Type: application/json" \
  -d "{\"session_id\": \"$SESSION_ID\", \"data\": {\"temp\": 25.5}}"
```

---

## WebSocket Support

Currently not implemented. All communication is REST-based HTTP.

---

## Best Practices

1. **Cache Busting:** Use `_t` parameter with timestamp for real-time data
2. **Error Handling:** Always check `success` field in responses
3. **Throttling:** Don't poll faster than every 5 seconds
4. **Data Limits:** Use `limit` parameter to control response size
5. **Module IDs:** Use descriptive, unique UMIDs (e.g., "kitchen-temp-001")

---

## Examples

### Register and Send Data (Arduino/ESP32)

```cpp
#include <HTTPClient.h>

String SERVER = "http://192.168.1.100:3000";
String sessionId = "";

void setup() {
  // Register module
  HTTPClient http;
  http.begin(SERVER + "/api/register?type=temperature-sensor&umid=ESP32-001");
  int code = http.GET();
  
  if (code == 200) {
    String response = http.getString();
    // Parse JSON to get session_id
    sessionId = parseSessionId(response);
  }
  http.end();
}

void loop() {
  float temp = readTemperature();
  
  // Send data
  HTTPClient http;
  http.begin(SERVER + "/api/pool");
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"session_id\":\"" + sessionId + "\",\"data\":{\"temp\":" + String(temp) + "}}";
  int code = http.POST(payload);
  
  http.end();
  delay(5000);
}
```

---

### Dashboard Integration (JavaScript)

```javascript
// Fetch all dashboard stats
async function getDashboardStats() {
  const [modules, sensors, uptime] = await Promise.all([
    fetch('/api/modules?_t=' + Date.now()),
    fetch('/api/sensor-data?limit=100&_t=' + Date.now()),
    fetch('/api/uptime?_t=' + Date.now())
  ]);
  
  return {
    modules: await modules.json(),
    sensors: await sensors.json(),
    uptime: await uptime.json()
  };
}

// Check for emergencies
async function checkEmergencies() {
  await fetch('/api/emergency-tracker', { method: 'POST' });
  
  const response = await fetch('/api/emergency-history');
  const data = await response.json();
  
  if (data.current.isActive) {
    alert(`Emergency: ${data.current.count} modules triggered!`);
  }
}
```

---

## Changelog

**v2.0** (November 2025)
- Added emergency tracking system
- Added module performance analytics
- Added trigger statistics
- Improved status badge system
- Enhanced documentation

**v1.0** (Initial Release)
- Basic module registration
- Sensor data collection
- Settings management

---

## Support

For issues or questions:
- Check the docs folder for additional guides
- Review the simulator folder for testing examples
- Check server logs for debugging

---

**Last Updated:** November 3, 2025  
**API Version:** 2.0
