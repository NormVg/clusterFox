# Cutoff Module System - Implementation Guide

## Overview
The cutoff module system allows users to map regular sensor modules to cutoff modules. When a regular module enters emergency status (triggers threshold), its mapped cutoff module will automatically activate.

## System Architecture

### 1. Data Structure

**cutoff-mappings.json:**
```json
{
  "mappings": [
    {
      "sourceModuleUmid": "umid-sensor-123",
      "cutoffModuleUmid": "umid-cutoff-456",
      "createdAt": "2025-11-02T...",
      "updatedAt": "2025-11-02T..."
    }
  ]
}
```

**Module Properties:**
- `isCutoffModule`: boolean - Marks module as a cutoff module
- `cutoffActive`: boolean - Current cutoff activation state
- `lastTriggeredAt`: string - ISO timestamp of last trigger
- `triggeredBy`: string - UMID of module that triggered this cutoff

### 2. API Endpoints

#### GET /api/cutoff-modules
Returns all modules where `isCutoffModule === true`
```javascript
Response: {
  success: true,
  cutoffModules: [...],
  total: 5
}
```

#### GET /api/module-mapping
Returns all source-to-cutoff mappings
```javascript
Response: {
  success: true,
  mappings: [...]
}
```

#### POST /api/module-mapping
Add or remove module mappings
```javascript
Body: {
  sourceModuleUmid: "umid-sensor-123",
  cutoffModuleUmid: "umid-cutoff-456",
  action: "add" | "remove"
}
```

#### POST /api/cutoff-trigger
Manually trigger or deactivate a cutoff module
```javascript
Body: {
  cutoffModuleUmid: "umid-cutoff-456",
  action: "activate" | "deactivate",
  triggeredBy: "manual" | "umid-sensor-123"
}
```

### 3. Automatic Triggering

**In `modules.get.js`:**
1. Check all modules for emergency status
2. For each emergency module, find its mapping
3. If mapping exists, activate the mapped cutoff module
4. If emergency clears, deactivate the cutoff module

**Logic Flow:**
```
Module enters emergency
  ↓
Check if mapping exists
  ↓
Find cutoff module
  ↓
Activate cutoff module (cutoffActive = true)
  ↓
Log: "[CUTOFF] 🔌 Module X ACTIVATED by emergency on Y"

Module exits emergency
  ↓
Find active cutoff module
  ↓
Deactivate cutoff module (cutoffActive = false)
  ↓
Log: "[CUTOFF] ✅ Module X DEACTIVATED - emergency cleared"
```

## Usage Example

### Register a Cutoff Module
```javascript
// Register as normal module but mark as cutoff type
POST /api/register
{
  "umid": "umid-cutoff-relay-001",
  "moduleType": "cutoff-relay",
  "isCutoffModule": true
}
```

### Map Regular Module to Cutoff
```javascript
POST /api/module-mapping
{
  "sourceModuleUmid": "umid-temp-sensor-001",
  "cutoffModuleUmid": "umid-cutoff-relay-001",
  "action": "add"
}
```

### Monitor Cutoff Status
```javascript
GET /api/modules
// Response includes:
{
  umid: "umid-cutoff-relay-001",
  isCutoffModule: true,
  cutoffActive: true,
  lastTriggeredAt: "2025-11-02T14:30:00.000Z",
  triggeredBy: "umid-temp-sensor-001"
}
```

## Next Steps

### UI Implementation (TODO)
1. **Cutoff Modules Page** (`/cutoff-modules`)
   - List all cutoff modules
   - Manual activate/deactivate buttons
   - Status indicators

2. **Module Mapping Interface**
   - Dropdown: Select source module
   - Dropdown: Select cutoff module
   - Save mapping button
   - List current mappings with remove option

3. **Visual Indicators**
   - Badge on cutoff modules: "CUTOFF ACTIVE" / "CUTOFF STANDBY"
   - Emergency alert shows triggered cutoff modules
   - Connection lines showing mappings

4. **Settings Integration**
   - Auto-deactivate cutoff on emergency clear (toggle)
   - Cutoff activation delay (seconds)
   - Email/notification on cutoff trigger

## Example Use Cases

1. **Temperature Emergency → Cooling System**
   - Temp sensor exceeds threshold → Activate cooling cutoff relay

2. **Humidity Emergency → Ventilation**
   - Humidity sensor triggers → Activate ventilation fan

3. **Pressure Emergency → Safety Valve**
   - Pressure sensor critical → Open safety valve relay

4. **Multiple Sensors → Single Cutoff**
   - Any sensor emergency → Master emergency cutoff

## Console Logging

All cutoff operations are logged:
- `[CUTOFF] 🔌 Module X ACTIVATED` - Cutoff triggered
- `[CUTOFF] ✅ Module X DEACTIVATED` - Cutoff cleared
- `[CUTOFF] Error ...` - Any errors

Monitor console for real-time cutoff activity.
