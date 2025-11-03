# ClusterFox Server API Documentation

ClusterFox is a server for managing IoT modules (Arduino/ESP32) and collecting sensor data. This API allows modules to register themselves and send sensor data to be stored and retrieved.

## Base URL

When running locally:
```
http://localhost:3000
```

## API Endpoints

### 1. Register Module

Register a new module and receive a unique session ID for authentication.

**Endpoint:** `GET /api/register`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` (or `module-type` or `moduletype`) | string | Yes | The type of module (e.g., "temperature-sensor", "humidity-monitor") |
| `umid` | string | Yes | Unique Module ID - a unique identifier for the module (e.g., "ESP32-ABC123") |

**Example Request:**
```bash
curl "http://localhost:3000/api/register?type=temperature-sensor&umid=ESP32-001"
```

**Success Response (New Registration):**
```json
{
  "success": true,
  "message": "Module registered successfully",
  "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "umid": "ESP32-001",
  "moduleType": "temperature-sensor",
  "typeComponents": ["temperature", "sensor"],
  "registeredAt": "2025-11-01T10:30:00.000Z",
  "status": "new"
}
```

**Success Response (Existing Module):**
```json
{
  "success": true,
  "message": "Module already registered",
  "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "umid": "ESP32-001",
  "moduleType": "temperature-sensor",
  "registeredAt": "2025-11-01T10:30:00.000Z",
  "status": "existing"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing required parameter: type (module-type)",
  "message": "Please provide module type (e.g., ?type=temperature-sensor)"
}
```

---

### 2. Get Modules

Retrieve information about registered modules.

**Endpoint:** `GET /api/modules`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | No | Specific session ID to retrieve module info. If omitted, returns all modules (without session IDs). |

**Example Request (All Modules):**
```bash
curl "http://localhost:3000/api/modules"
```

**Example Request (Specific Module with Session):**
```bash
curl "http://localhost:3000/api/modules?session_id=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**Success Response (All Modules):**
```json
{
  "success": true,
  "count": 2,
  "modules": [
    {
      "umid": "ESP32-001",
      "moduleType": "temperature-sensor",
      "typeComponents": ["temperature", "sensor"],
      "registeredAt": "2025-11-01T10:30:00.000Z",
      "lastSeen": "2025-11-01T11:45:00.000Z",
      "status": "active",
      "dataCount": 150
    },
    {
      "umid": "ESP32-002",
      "moduleType": "humidity-monitor",
      "typeComponents": ["humidity", "monitor"],
      "registeredAt": "2025-11-01T10:35:00.000Z",
      "lastSeen": "2025-11-01T11:40:00.000Z",
      "status": "active",
      "dataCount": 120
    }
  ]
}
```

**Success Response (Single Module with Session):**
```json
{
  "success": true,
  "module": {
    "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "umid": "ESP32-001",
    "moduleType": "temperature-sensor",
    "typeComponents": ["temperature", "sensor"],
    "registeredAt": "2025-11-01T10:30:00.000Z",
    "lastSeen": "2025-11-01T11:45:00.000Z",
    "status": "active",
    "dataCount": 150
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Module not found",
  "message": "No module found with the provided session ID"
}
```

---

### 3. Pool (Submit Sensor Data)

Submit sensor data from a registered module using the session ID for authentication. This endpoint accepts any sensor readings as query parameters.

**Endpoint:** `GET /api/pool`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | Yes | The session ID (obtained from registration) |
| `*` | any | Yes | Any additional parameters are treated as sensor data |

**Example Request:**
```bash
# Temperature sensor
curl "http://localhost:3000/api/pool?session_id=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6&temperature=25.5&unit=celsius"

# Multi-sensor module
curl "http://localhost:3000/api/pool?session_id=abc123...&temperature=23.2&humidity=65&pressure=1013"

# Custom sensor data
curl "http://localhost:3000/api/pool?session_id=xyz789...&soil_moisture=450&light_level=75&battery=3.7"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Sensor data received",
  "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "umid": "ESP32-001",
  "moduleType": "temperature-sensor",
  "dataReceived": {
    "temperature": "25.5",
    "unit": "celsius"
  },
  "timestamp": "2025-11-01T11:45:30.000Z",
  "totalDataPoints": 151
}
```

**Error Response (Missing Session ID):**
```json
{
  "success": false,
  "error": "Missing required parameter: session_id",
  "message": "Please provide session ID (e.g., ?session_id=abc123...)"
}
```

**Error Response (Invalid Session ID):**
```json
{
  "success": false,
  "error": "Invalid session ID",
  "message": "No module found with the provided session ID. Please register first."
}
```

**Error Response (No Data):**
```json
{
  "success": false,
  "error": "No sensor data provided",
  "message": "Please provide sensor data in query parameters (e.g., ?session_id=abc123&temperature=25.5&humidity=60)"
}
```

**Notes:**
- The server automatically updates the module's `lastSeen` timestamp and `dataCount`
- The server keeps the last 10,000 data entries to prevent excessive storage growth
- All sensor data parameters are stored as received

---

### 4. Get Sensor Data

Retrieve stored sensor data.

**Endpoint:** `GET /api/sensor-data`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `session_id` | string | No | - | Filter data by specific session ID |
| `limit` | integer | No | 100 | Maximum number of records to return |

**Example Request (All Data):**
```bash
curl "http://localhost:3000/api/sensor-data"
```

**Example Request (Filtered by Session):**
```bash
curl "http://localhost:3000/api/sensor-data?session_id=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6&limit=50"
```

**Success Response:**
```json
{
  "success": true,
  "count": 50,
  "total": 270,
  "data": [
    {
      "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "umid": "ESP32-001",
      "moduleType": "temperature-sensor",
      "data": {
        "temperature": "25.5",
        "unit": "celsius"
      },
      "timestamp": "2025-11-01T11:45:30.000Z",
      "receivedAt": 1730459130000
    },
    {
      "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "umid": "ESP32-001",
      "moduleType": "temperature-sensor",
      "data": {
        "temperature": "25.3",
        "unit": "celsius"
      },
      "timestamp": "2025-11-01T11:44:30.000Z",
      "receivedAt": 1730459070000
    }
  ]
}
```

**Notes:**
- Data is returned sorted by timestamp (newest first)
- The `total` field shows the total number of records in the database
- The `count` field shows the number of records returned in this response

---

## Data Storage

The API stores data in JSON files located in `server/data/`:

- **modules.json** - Stores registered modules
- **sensor-data.json** - Stores all sensor data readings

### Module Object Structure

```json
{
  "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "umid": "ESP32-001",
  "moduleType": "temperature-sensor",
  "typeComponents": ["temperature", "sensor"],
  "registeredAt": "2025-11-01T10:30:00.000Z",
  "lastSeen": "2025-11-01T11:45:00.000Z",
  "status": "active",
  "dataCount": 150,
  "sessionCreatedAt": "2025-11-01T10:30:00.000Z"
}
```

### Sensor Data Object Structure

```json
{
  "session_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "umid": "ESP32-001",
  "moduleType": "temperature-sensor",
  "data": {
    "temperature": "25.5",
    "unit": "celsius"
  },
  "timestamp": "2025-11-01T11:45:30.000Z",
  "receivedAt": 1730459130000
}
```

---

## Workflow Example

### Arduino/ESP32 Module Setup

1. **Register the module** on first boot:
```cpp
// Arduino/ESP32 code example
String umid = "ESP32-" + WiFi.macAddress();
String url = "http://your-server:3000/api/register?type=temperature-sensor&umid=" + umid;
HTTPClient http;
http.begin(url);
int httpCode = http.GET();
String response = http.getString();
// Parse JSON response to extract session_id
// Store session_id in EEPROM or preferences for future use
```

2. **Send sensor data** periodically:
```cpp
// Arduino/ESP32 code example
// Load session_id from storage
String sessionId = loadSessionId(); // Your storage function
float temp = dht.readTemperature();
String url = "http://your-server:3000/api/pool?session_id=" + sessionId + "&temperature=" + String(temp);
HTTPClient http;
http.begin(url);
int httpCode = http.GET();
```

### Dashboard/Client Application

1. **Get all registered modules**:
```javascript
const response = await fetch('http://localhost:3000/api/modules');
const { modules } = await response.json();
```

2. **Get sensor data for a specific module**:
```javascript
const sessionId = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // From module registration
const response = await fetch(`http://localhost:3000/api/sensor-data?session_id=${sessionId}&limit=100`);
const { data } = await response.json();
```

---

## Error Handling

All endpoints return a JSON response with a `success` field:
- `success: true` - Request was successful
- `success: false` - Request failed (check `error` and `message` fields)

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `404` - Resource not found
- `500` - Internal server error

---

## Security Notes

- **Session IDs**: Each module receives a unique 32-character hexadecimal session ID for authentication
- **Session Storage**: Modules should securely store their session ID (e.g., in EEPROM or preferences)
- **New Sessions**: Re-registering an existing module (same UMID) generates a new session ID, invalidating the old one
- **Public Endpoints**: The `/api/modules` endpoint without session_id returns module info without exposing session IDs

## Best Practices

1. **Module Registration**: Always register modules before sending data and store the session_id
2. **Unique IDs**: Use MAC addresses or similar unique identifiers for UMID
3. **Session Management**: Store session IDs securely on the device (EEPROM, Flash, etc.)
4. **Error Handling**: Check the `success` field in responses and handle invalid session errors
5. **Rate Limiting**: Be mindful of request frequency to avoid overwhelming the server
6. **Data Retention**: The server automatically limits storage to 10,000 most recent entries
7. **Module Naming**: Use descriptive module types (e.g., "temperature-humidity-sensor" instead of just "sensor")
8. **Re-registration**: If session ID is lost, re-register with the same UMID to get a new session

---

## Development

Built with:
- [Nuxt 3](https://nuxt.com) - Vue.js framework
- File-based JSON storage
- RESTful API design

For development setup, see [README.md](./README.md)
