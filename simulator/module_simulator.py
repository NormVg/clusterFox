#!/usr/bin/env python3
"""
ClusterFox IoT Module Simulator
Simulates various sensor modules sending data to the ClusterFox server
"""

import requests
import time
import random
import hashlib
import json
from datetime import datetime
from typing import Dict, List, Any

class ModuleSimulator:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.modules = []

    def generate_session_id(self, umid: str) -> str:
        """Generate a unique session ID based on module ID"""
        return hashlib.sha256(f"{umid}-{time.time()}".encode()).hexdigest()

    def create_module(self, umid: str, module_type: str, sensor_fields: List[str]) -> Dict[str, Any]:
        """Create a new simulated module"""
        session_id = self.generate_session_id(umid)
        module = {
            "umid": umid,
            "moduleType": module_type,
            "session_id": session_id,
            "sensor_fields": sensor_fields,
            "registered": False
        }
        self.modules.append(module)
        print(f"✅ Created module: {umid} (Type: {module_type})")
        return module

    def register_module(self, module: Dict[str, Any]) -> bool:
        """Register a module with the server"""
        try:
            url = f"{self.base_url}/api/register"
            payload = {
                "umid": module["umid"],
                "type": module["moduleType"]
            }

            response = requests.get(url, params=payload)

            if response.status_code == 200:
                response_data = response.json()
                if response_data.get('success'):
                    # Update module with server-generated session_id
                    module["session_id"] = response_data.get('session_id')
                    module["registered"] = True
                    print(f"📝 Registered: {module['umid']} (Session: {module['session_id'][:16]}...)")
                    return True
                else:
                    print(f"❌ Registration failed for {module['umid']}: {response_data.get('error')}")
                    return False
            else:
                print(f"❌ Registration failed for {module['umid']}: HTTP {response.status_code}")
                print(f"   Response: {response.text}")
                return False

        except Exception as e:
            print(f"❌ Error registering {module['umid']}: {str(e)}")
            return False

    def generate_sensor_data(self, module: Dict[str, Any]) -> Dict[str, Any]:
        """Generate realistic sensor data based on module type"""
        data = {}

        for field in module["sensor_fields"]:
            if field in ["temp", "temperature"]:
                # Temperature: 15-35°C
                data[field] = round(random.uniform(15, 35), 2)
            elif field in ["humi", "humidity"]:
                # Humidity: 30-80%
                data[field] = round(random.uniform(30, 80), 2)
            elif field in ["pressure"]:
                # Pressure: 980-1020 hPa
                data[field] = round(random.uniform(980, 1020), 2)
            elif field in ["light", "lux"]:
                # Light: 0-1000 lux
                data[field] = round(random.uniform(0, 1000), 1)
            elif field in ["co2"]:
                # CO2: 400-2000 ppm
                data[field] = round(random.uniform(400, 2000), 0)
            elif field in ["motion", "pir"]:
                # Motion: 0 or 1
                data[field] = random.choice([0, 1])
            elif field in ["distance"]:
                # Distance: 0-400 cm
                data[field] = round(random.uniform(0, 400), 1)
            elif field in ["voltage"]:
                # Voltage: 3.0-5.0V
                data[field] = round(random.uniform(3.0, 5.0), 2)
            elif field in ["current"]:
                # Current: 0-5A
                data[field] = round(random.uniform(0, 5), 3)
            elif field in ["power"]:
                # Power: 0-100W
                data[field] = round(random.uniform(0, 100), 2)
            elif field in ["soil_moisture"]:
                # Soil moisture: 0-100%
                data[field] = round(random.uniform(0, 100), 1)
            elif field in ["ph"]:
                # pH: 0-14
                data[field] = round(random.uniform(0, 14), 2)
            else:
                # Generic value
                data[field] = round(random.uniform(0, 100), 2)

        return data

    def send_sensor_data(self, module: Dict[str, Any]) -> bool:
        """Send sensor data to the server"""
        try:
            url = f"{self.base_url}/api/pool"
            data = self.generate_sensor_data(module)

            payload = {
                "session_id": module["session_id"],
                "umid": module["umid"],
                "moduleType": module["moduleType"],
                "data": data
            }

            response = requests.post(url, json=payload)

            if response.status_code == 200:
                print(f"📊 Sent data from {module['umid']}: {data}")
                return True
            else:
                print(f"❌ Failed to send data from {module['umid']}: {response.status_code}")
                return False

        except Exception as e:
            print(f"❌ Error sending data from {module['umid']}: {str(e)}")
            return False

    def run_simulation(self, duration: int = 60, interval: int = 5):
        """Run the simulation for a specified duration"""
        print(f"\n🚀 Starting simulation for {duration} seconds (interval: {interval}s)")
        print(f"📡 Server: {self.base_url}")
        print(f"🔧 Modules: {len(self.modules)}\n")

        # Register all modules
        for module in self.modules:
            self.register_module(module)
            time.sleep(0.5)

        print("\n📈 Starting data transmission...\n")

        start_time = time.time()
        iteration = 0

        try:
            while (time.time() - start_time) < duration:
                iteration += 1
                print(f"\n--- Iteration {iteration} ({int(time.time() - start_time)}s elapsed) ---")

                for module in self.modules:
                    if module["registered"]:
                        self.send_sensor_data(module)
                        time.sleep(0.2)  # Small delay between modules

                time.sleep(interval)

        except KeyboardInterrupt:
            print("\n\n⏸️  Simulation stopped by user")

        print(f"\n✅ Simulation completed!")
        print(f"📊 Total iterations: {iteration}")
        print(f"📡 Total data points sent: {iteration * len(self.modules)}")


def main():
    """Main simulation setup"""
    print("=" * 60)
    print("🦊 ClusterFox IoT Module Simulator")
    print("=" * 60)

    # Create simulator instance
    simulator = ModuleSimulator(base_url="http://localhost:3000")

    # Create various sensor modules
    simulator.create_module(
        umid="temp-humi-sensor-001",
        module_type="temperature-humidity",
        sensor_fields=["temp", "humi"]
    )

    simulator.create_module(
        umid="weather-station-002",
        module_type="weather-station",
        sensor_fields=["temp", "humi", "pressure", "light"]
    )

    simulator.create_module(
        umid="air-quality-003",
        module_type="air-quality",
        sensor_fields=["temp", "humi", "co2"]
    )

    simulator.create_module(
        umid="smart-garden-004",
        module_type="garden-sensor",
        sensor_fields=["soil_moisture", "temp", "light"]
    )

    simulator.create_module(
        umid="motion-sensor-005",
        module_type="motion-detector",
        sensor_fields=["motion", "temp", "light"]
    )

    simulator.create_module(
        umid="power-monitor-006",
        module_type="power-meter",
        sensor_fields=["voltage", "current", "power"]
    )

    # Run simulation
    # duration: how long to run (seconds)
    # interval: time between data transmissions (seconds)
    simulator.run_simulation(duration=300, interval=5)  # 5 minutes, send every 5 seconds


if __name__ == "__main__":
    main()
