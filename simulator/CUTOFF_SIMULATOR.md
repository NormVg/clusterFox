# Cutoff Module Simulator

Simulates cutoff modules (relays, switches, circuit breakers) that respond to emergency triggers from regular sensor modules.

## Overview

The cutoff simulator creates virtual cutoff modules that:
- Register with the ClusterFox server as cutoff-capable modules
- Monitor their activation status every 2 seconds
- Respond instantly when activated by the emergency system
- Simulate physical relay operations (switching time, contact resistance)
- Provide real-time feedback on cutoff actions

## Quick Start

### Run a single cutoff module:
```bash
cd simulator
./run_cutoff.sh
```

### Run with custom settings:
```bash
./run_cutoff.sh --name "Emergency Relay A" --umid CUTOFF-001
./run_cutoff.sh --name "Power Cutoff B" --pool POOL002
```

### Run multiple cutoff modules (different terminals):
```bash
# Terminal 1
./run_cutoff.sh --name "Zone A Cutoff" --umid CUTOFF-A01

# Terminal 2
./run_cutoff.sh --name "Zone B Cutoff" --umid CUTOFF-B01

# Terminal 3
./run_cutoff.sh --name "Main Power Relay" --umid CUTOFF-MAIN
```

## How It Works

1. **Registration**: Cutoff module registers with `isCutoffModule: true`
2. **Monitoring**: Polls `/api/modules` every 2 seconds for status changes
3. **Activation**: When a mapped source module enters emergency state:
   - Server automatically sets `cutoffActive: true`
   - Simulator detects change and triggers cutoff action
   - Displays activation message with timestamp
4. **Deactivation**: When emergency clears or manually stopped:
   - Server sets `cutoffActive: false`
   - Simulator restores normal operation

## Command Line Options

```
--umid <id>     Unique Module ID (default: auto-generated)
--name <name>   Module name (default: Cutoff Relay)
--pool <pool>   Pool ID (default: POOL001)
--url <url>     Server URL (default: http://localhost:3001)
--help          Show help message
```

## Output Example

```
╔════════════════════════════════════════════╗
║   Cutoff Module Simulator for ClusterFox  ║
╚════════════════════════════════════════════╝

UMID: CUTOFF-001
Name: Emergency Relay A
Pool: POOL001
Server: http://localhost:3001

✅ [Emergency Relay A] Registered successfully (UMID: CUTOFF-001)

💡 Monitoring for cutoff triggers...
   (This module will activate automatically when mapped source modules enter emergency)

🟢 Status: STANDBY | Last check: 14:32:15

🔌 [Emergency Relay A] CUTOFF ACTIVATED at 2025-11-02 14:32:18
   └─ Shutting down connected equipment...
   └─ Relay opened, power disconnected
   └─ Contact resistance: 0.0023 Ω
   └─ Switching time: 8 ms

🔴 Status: ACTIVE (CUTOFF) | Last check: 14:32:20

✅ [Emergency Relay A] CUTOFF DEACTIVATED at 2025-11-02 14:35:42
   └─ Restoring power to equipment...
   └─ Relay closed, power restored
   └─ Contact resistance: 0.0019 Ω

🟢 Status: STANDBY | Last check: 14:35:44
```

## Testing Cutoff System

1. **Start a cutoff module**:
   ```bash
   ./run_cutoff.sh --name "Test Relay" --umid CUTOFF-TEST
   ```

2. **Start a regular sensor module** (in another terminal):
   ```bash
   ./run.sh --name "Temperature Sensor" --umid TEMP-001
   ```

3. **Create mapping** (via UI or API):
   - Go to http://localhost:3001/cutoff-modules
   - Map TEMP-001 → CUTOFF-TEST

4. **Trigger emergency**:
   - Configure temperature threshold in settings
   - Let temperature exceed threshold
   - Watch cutoff module activate automatically

5. **Stop emergency**:
   - Temperature returns to normal, OR
   - Click "Stop Emergency Alert" button
   - Watch cutoff module deactivate

## Simulated Hardware Behavior

The simulator mimics real hardware characteristics:

- **Switching Time**: 5-15ms (typical relay response)
- **Contact Resistance**: 0.001-0.005Ω (clean relay contacts)
- **Response Delay**: ~100ms (mechanical relay actuation)
- **Status Polling**: 2-second interval (realistic IoT device behavior)

## Use Cases

### Emergency Power Cutoff
```bash
./run_cutoff.sh --name "Main Power Relay" --umid CUTOFF-POWER
```
Map to temperature/smoke sensors to cut power during fire emergencies.

### Zone Isolation
```bash
./run_cutoff.sh --name "Zone A Cutoff" --umid CUTOFF-ZONE-A
./run_cutoff.sh --name "Zone B Cutoff" --umid CUTOFF-ZONE-B
```
Isolate different areas independently based on local sensor conditions.

### Equipment Protection
```bash
./run_cutoff.sh --name "Pump Cutoff" --umid CUTOFF-PUMP-01
```
Map to pressure/flow sensors to protect equipment from damage.

## Dependencies

- Python 3.6+
- `requests` library (auto-installed by run_cutoff.sh)

## Manual Python Usage

```bash
python3 cutoff_simulator.py --umid CUTOFF-001 --name "My Relay"
```

## Notes

- Cutoff modules have no sensors (empty sensors array)
- They only respond to activation commands from the server
- Multiple cutoff modules can be mapped to the same source module
- Cutoff modules persist in the system like regular modules
- Use the Cutoff Modules UI page to manage mappings

## Troubleshooting

**Module not activating:**
- Check mapping exists: GET http://localhost:3001/api/module-mapping
- Verify source module is in emergency state
- Check emergency triggers are enabled in settings

**Connection errors:**
- Ensure ClusterFox server is running on port 3001
- Check firewall settings
- Verify URL with --url flag if using custom port

**Status not updating:**
- Poll interval is 2 seconds - wait for next check
- Check server logs for automatic trigger execution
- Verify cutoffActive flag in modules.json
