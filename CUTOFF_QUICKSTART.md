# Cutoff Modules System - Quick Start Guide

## ✅ System Status: OPERATIONAL

All components are now working:
- ✅ Backend APIs (4 endpoints)
- ✅ Automatic cutoff triggering
- ✅ Cutoff module simulator
- ✅ UI page (cutoff-modules route)
- ✅ Sidebar navigation

## 🚀 Quick Test Workflow

### 1. Start a Cutoff Module
```bash
cd simulator
./run_cutoff.sh --name "Emergency Relay" --umid CUTOFF-001
```

You should see:
```
✅ [Emergency Relay] Registered successfully (UMID: CUTOFF-001)
💡 Monitoring for cutoff triggers...
🟢 Status: STANDBY | Last check: HH:MM:SS
```

### 2. Start a Regular Sensor Module
```bash
# In another terminal
./run.sh --name "Temperature Sensor" --umid TEMP-001
```

### 3. Access the UI
Open your browser to: **http://localhost:3000/cutoff-modules**

You should see:
- Cutoff Modules tab with "Emergency Relay" listed
- Module Mappings tab (empty initially)

### 4. Create a Mapping
On the Cutoff Modules page:
1. Go to "Module Mappings" tab
2. Select "TEMP-001" as source module
3. Select "CUTOFF-001" as cutoff module
4. Click "Add Mapping"

### 5. Trigger Emergency
In your sensor simulator terminal, make the temperature exceed the threshold set in settings.

**Expected Result:**
- Temperature sensor enters emergency state
- Server automatically activates CUTOFF-001
- Cutoff simulator shows:
```
🔌 [Emergency Relay] CUTOFF ACTIVATED at 2025-11-02 21:45:30
   └─ Shutting down connected equipment...
   └─ Relay opened, power disconnected
   └─ Contact resistance: 0.0023 Ω
   └─ Switching time: 8 ms

🔴 Status: ACTIVE (CUTOFF) | Last check: 21:45:32
```

### 6. Clear Emergency
Stop the emergency (temperature returns to normal OR click "Stop Emergency Alert" button)

**Expected Result:**
- Cutoff simulator shows:
```
✅ [Emergency Relay] CUTOFF DEACTIVATED at 2025-11-02 21:48:15
   └─ Restoring power to equipment...
   └─ Relay closed, power restored

🟢 Status: STANDBY | Last check: 21:48:17
```

## 📡 API Endpoints

All working on port **3000**:

### Registration
```bash
POST /api/register
{
  "umid": "CUTOFF-001",
  "name": "Emergency Relay",
  "poolId": "POOL001",
  "sensors": [],
  "isCutoffModule": true,
  "cutoffActive": false
}
```

### List Cutoff Modules
```bash
GET /api/cutoff-modules
```

### Get Mappings
```bash
GET /api/module-mapping
GET /api/module-mapping?sourceModuleUmid=TEMP-001
```

### Create/Remove Mapping
```bash
POST /api/module-mapping
{
  "sourceModuleUmid": "TEMP-001",
  "cutoffModuleUmid": "CUTOFF-001",
  "action": "add"  // or "remove"
}
```

### Manual Cutoff Trigger
```bash
POST /api/cutoff-trigger
{
  "cutoffModuleUmid": "CUTOFF-001",
  "action": "activate",  // or "deactivate"
  "triggeredBy": "manual"
}
```

## 🧪 Testing Scenarios

### Scenario 1: Single Cutoff
- 1 temperature sensor
- 1 cutoff module
- Map sensor → cutoff
- Trigger emergency on sensor
- Verify cutoff activates

### Scenario 2: Multiple Cutoffs
- 1 temperature sensor
- 2 cutoff modules (e.g., Zone A, Zone B)
- Map sensor → both cutoffs
- Trigger emergency
- Verify both cutoffs activate simultaneously

### Scenario 3: Zone Isolation
- 2 temperature sensors (Zone A, Zone B)
- 2 cutoff modules (Cutoff A, Cutoff B)
- Map: Sensor A → Cutoff A, Sensor B → Cutoff B
- Trigger emergency on Sensor A only
- Verify only Cutoff A activates (Zone B unaffected)

### Scenario 4: Manual Control
- Start cutoff module
- Use UI to manually activate/deactivate
- Verify simulator responds to manual triggers

## 📁 File Structure

```
server/
  api/
    register.post.js        ✅ New - Module registration
    cutoff-modules.get.js   ✅ New - List cutoff modules
    module-mapping.get.js   ✅ New - Get mappings
    module-mapping.post.js  ✅ New - Add/remove mappings
    cutoff-trigger.post.js  ✅ New - Manual trigger
    modules.get.js          ✅ Modified - Auto-trigger logic
  data/
    cutoff-mappings.json    ✅ New - Stores mappings

pages/
  cutoff-modules.vue        ✅ New - UI page

components/
  Sidebar.vue               ✅ Modified - Added menu item

simulator/
  cutoff_simulator.py       ✅ New - Python simulator
  run_cutoff.sh             ✅ New - Run script
  CUTOFF_SIMULATOR.md       ✅ New - Documentation

docs/
  CUTOFF_MODULES.md         ✅ New - Implementation guide
```

## 🎯 Key Features

1. **Automatic Activation**: Cutoffs trigger automatically when mapped source modules enter emergency
2. **Real-time Monitoring**: 2-second polling interval for responsive cutoff control
3. **Manual Override**: UI buttons to manually activate/deactivate cutoffs
4. **Multiple Mappings**: One source can trigger multiple cutoffs
5. **Zone Isolation**: Independent cutoff control per module
6. **Realistic Simulation**: Mimics real relay behavior (switching time, contact resistance)
7. **Activity Logging**: All activations logged to activity.json

## 🔧 Troubleshooting

**Cutoff not activating:**
- Check mapping exists in UI
- Verify emergency triggers enabled in settings
- Check source module is in emergency state
- Look at server logs for "[CUTOFF]" messages

**Simulator connection errors:**
- Ensure server running on port 3000
- Check `BASE_URL` in simulator matches server

**UI page not loading:**
- Clear browser cache
- Restart Nuxt dev server
- Check browser console for errors

## 📊 Expected Behavior

**Emergency Flow:**
1. Sensor reads critical value
2. Server detects emergency (modules.get.js)
3. Server checks cutoff-mappings.json
4. Server sets `cutoffActive: true` on mapped cutoffs
5. Simulator polls, detects change, activates relay
6. UI shows red "ACTIVE" badge
7. Audio alert plays (if enabled)

**Clear Flow:**
1. Emergency condition resolves
2. Server sets `cutoffActive: false`
3. Simulator detects change, deactivates relay
4. UI shows green "STANDBY" badge

## 🎉 Success Criteria

✅ Cutoff module registers with `isCutoffModule: true`
✅ Module appears in Cutoff Modules UI tab
✅ Mapping can be created via UI
✅ Emergency on source module triggers cutoff automatically
✅ Simulator shows activation message and relay simulation
✅ UI updates to show "ACTIVE" status
✅ Emergency clear deactivates cutoff
✅ Manual trigger buttons work in UI

All criteria met! System is fully operational. 🚀
