# 🦊 ClusterFox IoT Module Simulator

A Python-based simulator for testing the ClusterFox dashboard with realistic IoT sensor data.

## 📋 Features

- **6 Pre-configured Sensor Modules**:
  - Temperature & Humidity Sensor
  - Weather Station (temp, humidity, pressure, light)
  - Air Quality Monitor (temp, humidity, CO2)
  - Smart Garden Sensor (soil moisture, temp, light)
  - Motion Detector (motion, temp, light)
  - Power Monitor (voltage, current, power)

- **Realistic Data Generation**:
  - Temperature: 15-35°C
  - Humidity: 30-80%
  - Pressure: 980-1020 hPa
  - Light: 0-1000 lux
  - CO2: 400-2000 ppm
  - And more...

- **Automatic Registration**: Modules auto-register with the server
- **Continuous Data Streaming**: Sends data at configurable intervals
- **Error Handling**: Graceful handling of connection issues

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd simulator
pip install -r requirements.txt
```

Or using pip directly:
```bash
pip install requests
```

### 2. Start Your ClusterFox Server

Make sure your Nuxt dev server is running:
```bash
cd ..
pnpm dev
```

### 3. Run the Simulator

```bash
python module_simulator.py
```

## 📊 Output Example

```
============================================================
🦊 ClusterFox IoT Module Simulator
============================================================
✅ Created module: temp-humi-sensor-001 (Type: temperature-humidity)
✅ Created module: weather-station-002 (Type: weather-station)
✅ Created module: air-quality-003 (Type: air-quality)
...

🚀 Starting simulation for 300 seconds (interval: 5s)
📡 Server: http://localhost:3001
🔧 Modules: 6

📝 Registered: temp-humi-sensor-001
📝 Registered: weather-station-002
...

📈 Starting data transmission...

--- Iteration 1 (0s elapsed) ---
📊 Sent data from temp-humi-sensor-001: {'temp': 23.45, 'humi': 65.32}
📊 Sent data from weather-station-002: {'temp': 22.11, 'humi': 58.76, 'pressure': 1013.45, 'light': 456.2}
...
```

## ⚙️ Configuration

### Change Server URL

Edit the `main()` function:
```python
simulator = ModuleSimulator(base_url="http://localhost:3001")
```

### Adjust Simulation Duration & Interval

```python
simulator.run_simulation(
    duration=300,  # Run for 5 minutes
    interval=5     # Send data every 5 seconds
)
```

### Add Custom Modules

```python
simulator.create_module(
    umid="your-custom-sensor-007",
    module_type="custom-type",
    sensor_fields=["field1", "field2", "field3"]
)
```

### Supported Sensor Fields

- `temp` / `temperature` - Temperature (15-35°C)
- `humi` / `humidity` - Humidity (30-80%)
- `pressure` - Atmospheric pressure (980-1020 hPa)
- `light` / `lux` - Light intensity (0-1000 lux)
- `co2` - CO2 concentration (400-2000 ppm)
- `motion` / `pir` - Motion detection (0 or 1)
- `distance` - Distance (0-400 cm)
- `voltage` - Voltage (3.0-5.0V)
- `current` - Current (0-5A)
- `power` - Power (0-100W)
- `soil_moisture` - Soil moisture (0-100%)
- `ph` - pH level (0-14)
- Custom fields will generate values 0-100

## 🛑 Stopping the Simulator

Press `Ctrl+C` to stop the simulation gracefully.

## 📡 API Endpoints Used

- `GET /api/register` - Register new modules
- `POST /api/pool` - Send sensor data

## 🔧 Troubleshooting

### Connection Refused
- Make sure your ClusterFox server is running on port 3001
- Check if another process is using port 3001

### Module Not Appearing
- Check the server console for registration messages
- Verify the API endpoints are responding

### No Data in Charts
- Wait a few iterations for data to accumulate
- Check browser console for errors
- Verify sensor-data.json is being updated

## 💡 Tips

- Start with a short duration (30-60s) to test first
- Monitor the ClusterFox dashboard while simulator runs
- Check `/analytics` page to see the charts update in real-time
- Adjust intervals based on your testing needs

## 📝 License

Part of the ClusterFox project.
