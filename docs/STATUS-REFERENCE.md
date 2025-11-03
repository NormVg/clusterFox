# Status Badges & States Reference

Quick reference guide for all status indicators in ClusterFox.

---

## System-Wide Status

### Overall System Health

```
● Healthy    - All systems operational (100% modules online)
● Degraded   - Partial functionality (1-99% modules online)
● Critical   - System failure (0% modules online)
```

**Color Codes:**
- **Green** (#10b981) - Healthy
- **Orange** (#f59e0b) - Degraded/Warning
- **Red** (#ef4444) - Critical/Error

---

## Module Status

### Connection Status

| Badge | Color | Description | Threshold |
|-------|-------|-------------|-----------|
| **● Online** | Green | Module actively reporting | Last seen < 30s |
| **● Inactive** | Orange | Module response slow | Last seen 30-60s |
| **● Offline** | Red | Module disconnected | Last seen > 60s |

**Configuration:**
- `moduleActiveThreshold` - Online timeout (default: 30 seconds)
- `moduleInactiveThreshold` - Offline timeout (default: 60 seconds)

**Adjustable in:** Settings page → Module Status Thresholds

---

### Registration Status

| Status | Description |
|--------|-------------|
| `new` | First-time registration |
| `existing` | Module re-registered |
| `active` | Currently reporting data |

---

## Emergency System

### Emergency Status

| Badge | Meaning | Condition |
|-------|---------|-----------|
| **🚨 Emergency Active** | Critical condition detected | Sensor exceeds threshold |
| **⚠ Monitoring** | Watching for triggers | Triggers enabled, no alerts |
| **✓ All Clear** | Normal operation | No active emergencies |

---

### Emergency Event Types

| Event Type | Description | When It Occurs |
|-----------|-------------|----------------|
| `emergency_started` | New emergency detected | First module triggers |
| `emergency_ended` | All emergencies resolved | All values return to normal |
| `emergency_changed` | Emergency modules changed | Different module triggers |
| `update` | Status check | Periodic monitoring |

---

### Trigger Conditions

| Condition | Symbol | Example | Description |
|-----------|--------|---------|-------------|
| **Above** | `>` | `temp > 35` | Triggers when value exceeds threshold |
| **Below** | `<` | `battery < 10` | Triggers when value drops below threshold |

**Example Triggers:**
```json
{
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
```

---

## Performance Metrics

### Performance Scores

| Score Range | Badge | Quality Level |
|-------------|-------|---------------|
| 90-100 | **Excellent** | Top performance |
| 75-89 | **Good** | Acceptable |
| 60-74 | **Fair** | Needs improvement |
| 0-59 | **Poor** | Critical issues |

**Score Components:**
- **Reliability** (40%) - Uptime and consistency
- **Data Quality** (35%) - Valid readings percentage
- **Response Time** (25%) - Data transmission speed

---

## Data Quality

### Quality Indicators

| Status | Badge | Valid Readings | Description |
|--------|-------|----------------|-------------|
| **● Excellent** | Green | > 95% | High-quality data stream |
| **● Good** | Blue | 80-95% | Acceptable quality |
| **● Fair** | Orange | 60-80% | Some data issues |
| **● Poor** | Red | < 60% | Significant problems |

---

## Network Status

### Connection Strength

| Strength | Visual | Range | Description |
|----------|--------|-------|-------------|
| **Strong** | ━━━ | 0.8-1.0 | Excellent connection |
| **Medium** | ━━╌ | 0.5-0.79 | Good connection |
| **Weak** | ━╌╌ | 0.2-0.49 | Poor connection |
| **Very Weak** | ╌╌╌ | 0-0.19 | Critical connection |

---

## Activity Status

### Data Rate Indicators

| Rate | Badge | Description |
|------|-------|-------------|
| **↑ Active** | Green | Data flowing (> 1/min) |
| **→ Idle** | Orange | Low activity (< 1/min) |
| **↓ Stale** | Red | No recent data (> 5 min) |

---

## Alert Priorities

### Priority Levels

| Priority | Badge | Response Time | Examples |
|----------|-------|---------------|----------|
| **Critical** | 🔴 | Immediate | Emergency triggers |
| **High** | 🟠 | < 5 minutes | Module offline |
| **Medium** | 🟡 | < 15 minutes | Performance degradation |
| **Low** | 🔵 | < 1 hour | Information only |

---

## Theme Support

All status badges support both light and dark themes using CSS variables:

```css
/* Light Theme */
--success: #10b981;  /* Green */
--warning: #f59e0b;  /* Orange */
--error: #ef4444;    /* Red */
--info: #3b82f6;     /* Blue */

/* Dark Theme (same colors with adjusted opacity) */
background: rgba(16, 185, 129, 0.1);  /* Success background */
border: 1px solid var(--success);     /* Success border */
```

---

## Status Flow Diagram

```
Module Registration
    │
    ├─→ Online (< 30s) ──→ Active monitoring
    │       │
    │       ├─→ Data normal ──→ ✓ All good
    │       │
    │       └─→ Trigger fires ──→ 🚨 Emergency
    │
    ├─→ Inactive (30-60s) ──→ ⚠ Warning
    │
    └─→ Offline (> 60s) ──→ ● Disconnected
```

---

## CSS Classes

### Status Indicator Classes

```css
.status-healthy   { color: #10b981; }  /* Green */
.status-warning   { color: #f59e0b; }  /* Orange */
.status-critical  { color: #ef4444; }  /* Red */
.status-info      { color: #3b82f6; }  /* Blue */

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}
```

### Badge Components

```html
<!-- System Status Badge -->
<div class="status-indicator status-healthy">
  <span class="status-dot"></span>
  <span>Healthy</span>
</div>

<!-- Module Status -->
<span class="badge badge-success">● Online</span>
<span class="badge badge-warning">● Inactive</span>
<span class="badge badge-error">● Offline</span>

<!-- Emergency Badge -->
<span class="badge badge-critical">🚨 Emergency Active</span>
```

---

## Status Update Frequency

| Component | Update Interval | Configurable |
|-----------|----------------|--------------|
| Module Status | Real-time on data receipt | No |
| Emergency Check | Every 5 seconds | No |
| Dashboard Stats | Every 10 seconds | Yes (Settings) |
| Performance Scores | Every 30 seconds | No |
| Network Map | On change | No |

---

## API Response Status

All API responses include a `success` boolean:

```json
{
  "success": true,    // ✓ Operation succeeded
  "success": false    // ✗ Operation failed
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found  
- `500` - Server Error

---

## Visual Status Examples

### Dashboard Header

```
Dashboard    ● Healthy
```

### Module List

```
ESP32-001    ● Online     25.5°C    65% RH
ESP32-002    ● Inactive   --°C      --% RH
ESP32-003    ● Offline    --°C      --% RH
```

### Emergency Alert

```
🚨 Emergency Active
1 module triggered: ESP32-001
Temperature: 38.5°C (threshold: 35°C)
```

### System Health Card

```
System Health                     CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

● Active Modules    1 / 13
⚡ Data Rate        1 entries/min
➕ Total Readings   2.1K
🕐 Uptime          50m
```

---

## Quick Reference

### Common Status Checks

```bash
# Check system status
curl http://localhost:3000/api/modules | jq '.success'

# Check for emergencies
curl -X POST http://localhost:3000/api/emergency-tracker

# Get current emergency status
curl http://localhost:3000/api/emergency-history | jq '.current'

# Check module status
curl http://localhost:3000/api/modules | jq '.modules[] | {umid, status}'
```

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ● | Status indicator dot |
| 🚨 | Emergency/Critical alert |
| ⚠ | Warning/Caution |
| ✓ | Success/OK |
| ✗ | Error/Failed |
| ↑ | Active/Increasing |
| → | Stable/Unchanged |
| ↓ | Decreasing/Inactive |
| ━ | Strong connection |
| ╌ | Weak connection |

---

**Last Updated:** November 3, 2025  
**Version:** 2.0
