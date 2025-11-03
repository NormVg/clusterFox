#!/usr/bin/env python3
"""
Cutoff Module Simulator for ClusterFox
Simulates cutoff modules (relays, switches, etc.) that respond to emergency triggers
"""

import requests
import time
import random
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000"
POLL_INTERVAL = 2  # Check for updates every 2 seconds

class CutoffModuleSimulator:
    def __init__(self, umid, name, pool_id="POOL001"):
        self.umid = umid
        self.name = name
        self.pool_id = pool_id
        self.cutoff_active = False
        self.last_activation = None

    def register(self):
        """Register this cutoff module with the server"""
        data = {
            "umid": self.umid,
            "name": self.name,
            "poolId": self.pool_id,
            "sensors": [],  # Cutoff modules don't have sensors
            "isCutoffModule": True,
            "cutoffActive": False
        }

        try:
            response = requests.post(f"{BASE_URL}/api/register", json=data)
            if response.status_code == 200:
                print(f"✅ [{self.name}] Registered successfully (UMID: {self.umid})")
                return True
            else:
                print(f"❌ [{self.name}] Registration failed: {response.text}")
                return False
        except Exception as e:
            print(f"❌ [{self.name}] Connection error: {e}")
            return False

    def send_heartbeat(self):
        """Send heartbeat to keep module status as online/active"""
        try:
            data = {
                "umid": self.umid
            }
            response = requests.post(f"{BASE_URL}/api/heartbeat", json=data)
            if response.status_code == 200:
                return True
            else:
                print(f"\n⚠️  [{self.name}] Heartbeat failed: {response.text}")
                return False
        except Exception as e:
            print(f"\n⚠️  [{self.name}] Heartbeat error: {e}")
            return False

    def check_status(self):
        """Check if this cutoff module should be activated and send heartbeat"""
        try:
            # Send heartbeat to keep module online
            self.send_heartbeat()

            response = requests.get(f"{BASE_URL}/api/modules")
            if response.status_code == 200:
                data = response.json()

                # Handle both response formats
                if isinstance(data, dict) and 'modules' in data:
                    modules = data['modules']
                else:
                    modules = data

                # Find this module in the response
                for module in modules:
                    if module.get("umid") == self.umid:
                        new_status = module.get("cutoffActive", False)

                        # Detect status change
                        if new_status != self.cutoff_active:
                            self.handle_status_change(new_status)

                        self.cutoff_active = new_status
                        return new_status

        except Exception as e:
            print(f"❌ [{self.name}] Error checking status: {e}")

        return self.cutoff_active

    def handle_status_change(self, new_status):
        """Handle activation/deactivation of the cutoff module"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if new_status:
            # ACTIVATED
            self.last_activation = timestamp
            print(f"\n🔌 [{self.name}] CUTOFF ACTIVATED at {timestamp}")
            print(f"   └─ Shutting down connected equipment...")
            self.simulate_cutoff_action()
        else:
            # DEACTIVATED
            print(f"\n✅ [{self.name}] CUTOFF DEACTIVATED at {timestamp}")
            print(f"   └─ Restoring power to equipment...")
            self.simulate_restore_action()

    def simulate_cutoff_action(self):
        """Simulate the physical cutoff action (relay opening, etc.)"""
        # Simulate relay response time
        time.sleep(0.1)
        print(f"   └─ Relay opened, power disconnected")

        # Simulate some electrical characteristics
        print(f"   └─ Contact resistance: {random.uniform(0.001, 0.005):.4f} Ω")
        print(f"   └─ Switching time: {random.randint(5, 15)} ms")

    def simulate_restore_action(self):
        """Simulate restoring power"""
        time.sleep(0.1)
        print(f"   └─ Relay closed, power restored")
        print(f"   └─ Contact resistance: {random.uniform(0.001, 0.005):.4f} Ω")

    def run(self):
        """Main simulation loop"""
        print(f"\n{'='*60}")
        print(f"🔌 Cutoff Module Simulator: {self.name}")
        print(f"{'='*60}")
        print(f"UMID: {self.umid}")
        print(f"Pool ID: {self.pool_id}")
        print(f"Server: {BASE_URL}")
        print(f"Poll Interval: {POLL_INTERVAL}s")
        print(f"{'='*60}\n")

        # Register module
        if not self.register():
            print("Failed to register. Exiting...")
            return

        print(f"\n💡 Monitoring for cutoff triggers...")
        print(f"   (This module will activate automatically when mapped source modules enter emergency)\n")

        try:
            while True:
                self.check_status()

                # Show status indicator
                status_icon = "🔴" if self.cutoff_active else "🟢"
                status_text = "ACTIVE (CUTOFF)" if self.cutoff_active else "STANDBY"

                # Print status line (overwrite previous)
                print(f"\r{status_icon} Status: {status_text} | Last check: {datetime.now().strftime('%H:%M:%S')}", end="", flush=True)

                time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            print(f"\n\n👋 Shutting down {self.name}...")
            print(f"Total activations: {1 if self.last_activation else 0}")
            if self.last_activation:
                print(f"Last activation: {self.last_activation}")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Cutoff Module Simulator for ClusterFox")
    parser.add_argument("--umid", default=f"CUTOFF-{random.randint(1000, 9999)}",
                       help="Unique Module ID (default: auto-generated)")
    parser.add_argument("--name", default="Cutoff Relay",
                       help="Module name (default: Cutoff Relay)")
    parser.add_argument("--pool", default="POOL001",
                       help="Pool ID (default: POOL001)")
    parser.add_argument("--url", default="http://localhost:3000",
                       help="Server URL (default: http://localhost:3000)")

    args = parser.parse_args()

    # Update global BASE_URL
    global BASE_URL
    BASE_URL = args.url

    # Create and run simulator
    simulator = CutoffModuleSimulator(
        umid=args.umid,
        name=args.name,
        pool_id=args.pool
    )

    simulator.run()


if __name__ == "__main__":
    main()
