# Code Examples

Practical examples for integrating with VTOL-DB.

## Table of Contents

- [REST API Examples (curl)](#rest-api-examples-curl)
- [Python Fleet Worker](#python-fleet-worker)
- [JavaScript Dashboard Client](#javascript-dashboard-client)
- [Complete Worker Implementation](#complete-worker-implementation)

---

## REST API Examples (curl)

### Drone Management

```bash
# List all drones
curl http://localhost:8080/api/drones

# Get specific drone
curl http://localhost:8080/api/drones/drone-001

# Create drone
curl -X POST http://localhost:8080/api/drones \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alpha Drone",
    "model": "DJI Mavic 3",
    "serialNumber": "SN-ALPHA-001"
  }'

# Update drone
curl -X PUT http://localhost:8080/api/drones/drone-001 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alpha Drone Updated",
    "status": "MAINTENANCE"
  }'

# Delete drone
curl -X DELETE http://localhost:8080/api/drones/drone-001
```

### Settings Management

```bash
# Get current settings
curl http://localhost:8080/api/settings

# Update settings (partial)
curl -X PUT http://localhost:8080/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "backup": {
      "enabled": true,
      "intervalHours": 12
    },
    "fleet": {
      "maxConcurrentWorkers": 100
    }
  }'

# Reset to defaults
curl -X POST http://localhost:8080/api/settings/reset

# Generate new auth key
curl -X POST http://localhost:8080/api/settings/generate-auth-key
```

---

## Python Fleet Worker

### Basic Worker

```python
#!/usr/bin/env python3
"""
Basic VTOL-DB Fleet Worker
Registers with server and sends telemetry updates
"""
import asyncio
import websockets
import json
from datetime import datetime, timezone

class FleetWorker:
    def __init__(self, server_url, worker_id, drone_id, serial_number):
        self.server_url = server_url
        self.worker_id = worker_id
        self.drone_id = drone_id
        self.serial_number = serial_number
        self.session_id = None
        self.heartbeat_interval = 15  # seconds

    async def connect(self):
        """Connect to fleet server and start worker loop"""
        async with websockets.connect(self.server_url) as ws:
            self.ws = ws

            # Register
            await self.register()

            # Start heartbeat and telemetry tasks
            await asyncio.gather(
                self.heartbeat_loop(),
                self.telemetry_loop(),
                self.receive_loop()
            )

    async def register(self):
        """Send registration message"""
        message = {
            "type": "REGISTER",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "workerId": self.worker_id,
                "droneId": self.drone_id,
                "serialNumber": self.serial_number,
                "capabilities": ["telemetry", "commands"],
                "firmwareVersion": "1.0.0",
                "protocolVersion": "1.0"
            }
        }
        await self.ws.send(json.dumps(message))

        # Wait for acknowledgment
        response = await self.ws.recv()
        ack = json.loads(response)

        if ack["type"] == "REGISTER_ACK":
            if ack["payload"]["status"] == "ACCEPTED":
                self.session_id = ack["payload"]["sessionId"]
                self.heartbeat_interval = ack["payload"]["heartbeatInterval"] / 1000
                print(f"Registered: session={self.session_id}")
            else:
                raise Exception("Registration rejected")

    async def heartbeat_loop(self):
        """Send periodic heartbeats"""
        while True:
            await asyncio.sleep(self.heartbeat_interval)
            message = {
                "type": "HEARTBEAT",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "payload": {"workerId": self.worker_id}
            }
            await self.ws.send(json.dumps(message))

    async def telemetry_loop(self):
        """Send periodic telemetry"""
        while True:
            await asyncio.sleep(5)  # 5 second interval
            await self.send_telemetry(
                latitude=37.7749,
                longitude=-122.4194,
                altitude=100.0,
                battery_level=85
            )

    async def send_telemetry(self, latitude, longitude, altitude, battery_level):
        """Send telemetry update"""
        message = {
            "type": "TELEMETRY",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "droneId": self.drone_id,
                "position": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "altitude": altitude,
                    "heading": 0.0,
                    "speed": 0.0
                },
                "battery": {
                    "level": battery_level,
                    "voltage": 22.5,
                    "current": 0.0,
                    "temperature": 25.0
                },
                "status": "ACTIVE",
                "flightMode": "LOITER",
                "sensors": {
                    "gpsFixType": "3D_FIX",
                    "satelliteCount": 12,
                    "signalStrength": 95
                }
            }
        }
        await self.ws.send(json.dumps(message))

    async def receive_loop(self):
        """Handle incoming messages from server"""
        async for message in self.ws:
            data = json.loads(message)
            await self.handle_message(data)

    async def handle_message(self, message):
        """Process incoming message"""
        msg_type = message.get("type")

        if msg_type == "COMMAND":
            await self.handle_command(message)
        elif msg_type == "HEARTBEAT":
            pass  # Server heartbeat, no action needed
        else:
            print(f"Unknown message type: {msg_type}")

    async def handle_command(self, message):
        """Execute command and send acknowledgment"""
        correlation_id = message.get("correlationId")
        command = message["payload"]["command"]
        parameters = message["payload"].get("parameters", {})

        print(f"Received command: {command} with params: {parameters}")

        # Execute command (mock implementation)
        success = True
        result_message = f"Executed {command}"

        # Send acknowledgment
        ack = {
            "type": "COMMAND_ACK",
            "correlationId": correlation_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "status": "SUCCESS" if success else "FAILED",
                "message": result_message
            }
        }
        await self.ws.send(json.dumps(ack))


async def main():
    worker = FleetWorker(
        server_url="ws://localhost:8080/ws/fleet",
        worker_id="worker-python-001",
        drone_id="drone-python-001",
        serial_number="SN-PY-001"
    )

    while True:
        try:
            await worker.connect()
        except Exception as e:
            print(f"Connection error: {e}")
            print("Reconnecting in 5 seconds...")
            await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main())
```

### Run the Worker

```bash
# Install dependencies
pip install websockets

# Run
python fleet_worker.py
```

---

## JavaScript Dashboard Client

### React Hook for Fleet Data

```javascript
// hooks/useFleetData.js
import { useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useFleetData(wsUrl = 'http://localhost:8080/ws/dashboard') {
  const [drones, setDrones] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        setConnected(true);
        setError(null);

        // Subscribe to drone updates
        client.subscribe('/topic/drones', (message) => {
          const data = JSON.parse(message.body);
          handleDroneUpdate(data);
        });
      },

      onDisconnect: () => {
        setConnected(false);
      },

      onStompError: (frame) => {
        setError(frame.headers['message']);
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [wsUrl]);

  const handleDroneUpdate = useCallback((data) => {
    const { updateType, droneId, data: droneData } = data.payload;

    setDrones(prev => {
      switch (updateType) {
        case 'DRONE_CREATED':
          return [...prev, droneData];
        case 'DRONE_UPDATED':
          return prev.map(d => d.id === droneId ? { ...d, ...droneData } : d);
        case 'DRONE_DELETED':
          return prev.filter(d => d.id !== droneId);
        case 'SNAPSHOT':
          return data.payload.drones || [];
        default:
          return prev;
      }
    });
  }, []);

  return { drones, connected, error };
}
```

### Usage in Component

```jsx
// components/FleetMonitor.jsx
import React from 'react';
import { useFleetData } from '../hooks/useFleetData';

function FleetMonitor() {
  const { drones, connected, error } = useFleetData();

  return (
    <div className="fleet-monitor">
      <div className="status">
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
        {error && <span className="error">{error}</span>}
      </div>

      <div className="drone-list">
        {drones.map(drone => (
          <div key={drone.id} className="drone-card">
            <h3>{drone.name}</h3>
            <p>Status: {drone.status}</p>
            <p>Battery: {drone.batteryLevel}%</p>
            <p>Position: {drone.latitude}, {drone.longitude}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FleetMonitor;
```

---

## Complete Worker Implementation

### Production-Ready Python Worker

```python
#!/usr/bin/env python3
"""
Production-ready VTOL-DB Fleet Worker
Features: Reconnection, logging, signal handling, configuration
"""
import asyncio
import websockets
import json
import logging
import signal
import sys
from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Optional, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('fleet-worker')

@dataclass
class WorkerConfig:
    server_url: str
    worker_id: str
    drone_id: str
    serial_number: str
    telemetry_interval: float = 5.0
    reconnect_delay: float = 5.0
    max_reconnect_delay: float = 60.0

class FleetWorker:
    def __init__(self, config: WorkerConfig):
        self.config = config
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.session_id: Optional[str] = None
        self.heartbeat_interval: float = 15.0
        self.running: bool = True
        self.reconnect_delay: float = config.reconnect_delay

        # Telemetry state (would come from actual drone in production)
        self.latitude: float = 37.7749
        self.longitude: float = -122.4194
        self.altitude: float = 0.0
        self.battery_level: int = 100
        self.status: str = "INACTIVE"

    async def run(self):
        """Main worker loop with reconnection"""
        while self.running:
            try:
                await self.connect_and_operate()
            except websockets.exceptions.ConnectionClosed as e:
                logger.warning(f"Connection closed: {e}")
            except Exception as e:
                logger.error(f"Error: {e}")

            if self.running:
                logger.info(f"Reconnecting in {self.reconnect_delay}s...")
                await asyncio.sleep(self.reconnect_delay)
                # Exponential backoff
                self.reconnect_delay = min(
                    self.reconnect_delay * 2,
                    self.config.max_reconnect_delay
                )

    async def connect_and_operate(self):
        """Connect and run worker operations"""
        logger.info(f"Connecting to {self.config.server_url}")

        async with websockets.connect(
            self.config.server_url,
            ping_interval=20,
            ping_timeout=10
        ) as ws:
            self.ws = ws
            self.reconnect_delay = self.config.reconnect_delay  # Reset on success

            await self.register()

            await asyncio.gather(
                self.heartbeat_task(),
                self.telemetry_task(),
                self.receive_task()
            )

    async def register(self):
        """Register with fleet server"""
        message = self._create_message("REGISTER", {
            "workerId": self.config.worker_id,
            "droneId": self.config.drone_id,
            "serialNumber": self.config.serial_number,
            "capabilities": ["telemetry", "commands"],
            "firmwareVersion": "1.0.0",
            "protocolVersion": "1.0"
        })

        await self.ws.send(json.dumps(message))
        response = json.loads(await self.ws.recv())

        if response["type"] != "REGISTER_ACK":
            raise Exception(f"Unexpected response: {response['type']}")

        payload = response["payload"]
        if payload["status"] != "ACCEPTED":
            raise Exception(f"Registration rejected")

        self.session_id = payload["sessionId"]
        self.heartbeat_interval = payload["heartbeatInterval"] / 1000
        self.status = "ACTIVE"

        logger.info(f"Registered with session {self.session_id}")

    async def heartbeat_task(self):
        """Send periodic heartbeats"""
        while self.running:
            await asyncio.sleep(self.heartbeat_interval)
            message = self._create_message("HEARTBEAT", {
                "workerId": self.config.worker_id
            })
            await self.ws.send(json.dumps(message))
            logger.debug("Heartbeat sent")

    async def telemetry_task(self):
        """Send periodic telemetry"""
        while self.running:
            await asyncio.sleep(self.config.telemetry_interval)
            await self.send_telemetry()

    async def send_telemetry(self):
        """Send current telemetry state"""
        message = self._create_message("TELEMETRY", {
            "droneId": self.config.drone_id,
            "position": {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "altitude": self.altitude,
                "heading": 0.0,
                "speed": 0.0
            },
            "battery": {
                "level": self.battery_level,
                "voltage": 22.5 * (self.battery_level / 100),
                "current": 0.0,
                "temperature": 25.0
            },
            "status": self.status,
            "flightMode": "LOITER",
            "sensors": {
                "gpsFixType": "3D_FIX",
                "satelliteCount": 12,
                "signalStrength": 95
            }
        })
        await self.ws.send(json.dumps(message))
        logger.debug(f"Telemetry sent: pos={self.latitude},{self.longitude} bat={self.battery_level}%")

    async def receive_task(self):
        """Handle incoming messages"""
        async for message in self.ws:
            if not self.running:
                break

            data = json.loads(message)
            await self.handle_message(data)

    async def handle_message(self, message: Dict[str, Any]):
        """Route incoming messages"""
        msg_type = message.get("type")

        if msg_type == "COMMAND":
            await self.handle_command(message)
        elif msg_type == "HEARTBEAT":
            pass
        else:
            logger.warning(f"Unknown message type: {msg_type}")

    async def handle_command(self, message: Dict[str, Any]):
        """Process command and send acknowledgment"""
        correlation_id = message.get("correlationId")
        payload = message["payload"]
        command = payload["command"]
        parameters = payload.get("parameters", {})

        logger.info(f"Command received: {command}")

        # Execute command
        success, result = await self.execute_command(command, parameters)

        # Send ack
        ack = self._create_message("COMMAND_ACK", {
            "status": "SUCCESS" if success else "FAILED",
            "message": result
        })
        ack["correlationId"] = correlation_id

        await self.ws.send(json.dumps(ack))
        logger.info(f"Command {command} completed: {result}")

    async def execute_command(self, command: str, parameters: Dict) -> tuple:
        """Execute drone command (mock implementation)"""
        # In production, this would interface with actual drone

        if command == "GOTO":
            self.latitude = parameters.get("latitude", self.latitude)
            self.longitude = parameters.get("longitude", self.longitude)
            self.altitude = parameters.get("altitude", self.altitude)
            return True, f"Moving to {self.latitude}, {self.longitude}"

        elif command == "TAKEOFF":
            self.altitude = parameters.get("altitude", 10.0)
            self.status = "ACTIVE"
            return True, f"Taking off to {self.altitude}m"

        elif command == "LAND":
            self.altitude = 0.0
            self.status = "INACTIVE"
            return True, "Landing"

        elif command == "RTL":
            self.latitude = 37.7749  # Home position
            self.longitude = -122.4194
            return True, "Returning to launch"

        else:
            return False, f"Unknown command: {command}"

    def _create_message(self, msg_type: str, payload: Dict) -> Dict:
        """Create message envelope"""
        return {
            "type": msg_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }

    def stop(self):
        """Stop the worker"""
        logger.info("Stopping worker...")
        self.running = False


async def main():
    config = WorkerConfig(
        server_url="ws://localhost:8080/ws/fleet",
        worker_id="worker-prod-001",
        drone_id="drone-prod-001",
        serial_number="SN-PROD-001",
        telemetry_interval=5.0
    )

    worker = FleetWorker(config)

    # Handle shutdown signals
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, worker.stop)

    try:
        await worker.run()
    finally:
        logger.info("Worker shutdown complete")


if __name__ == "__main__":
    asyncio.run(main())
```

---

## Integration Patterns

### Batch Drone Creation

```python
import requests
import json

API_URL = "http://localhost:8080/api"

def create_drones(count: int, prefix: str = "Drone"):
    """Create multiple drones"""
    drones = []
    for i in range(1, count + 1):
        response = requests.post(
            f"{API_URL}/drones",
            headers={"Content-Type": "application/json"},
            json={
                "name": f"{prefix}-{i:03d}",
                "model": "Generic UAV",
                "serialNumber": f"SN-{prefix.upper()}-{i:03d}"
            }
        )
        if response.ok:
            drones.append(response.json())
            print(f"Created: {response.json()['name']}")
        else:
            print(f"Failed: {response.status_code}")

    return drones

# Usage
drones = create_drones(10, "Alpha")
```

### Monitor Fleet Status

```python
import requests
import time

def monitor_fleet(interval: int = 10):
    """Monitor fleet status in a loop"""
    while True:
        response = requests.get("http://localhost:8080/api/drones")
        drones = response.json()

        print("\n" + "="*50)
        print(f"Fleet Status ({len(drones)} drones)")
        print("="*50)

        for drone in drones:
            status_icon = {
                "ACTIVE": "🟢",
                "INACTIVE": "🟡",
                "MAINTENANCE": "🟠",
                "OFFLINE": "🔴"
            }.get(drone["status"], "⚪")

            battery = drone.get("batteryLevel") or 0
            print(f"{status_icon} {drone['name']}: {drone['status']} | Battery: {battery:.0f}%")

        time.sleep(interval)

# Usage
monitor_fleet(10)
```

---

## See Also

- [API Reference](API_REFERENCE.md) - Complete API documentation
- [Architecture](ARCHITECTURE.md) - System design details
- [Fleet Worker Architecture](FLEET_WORKER_ARCHITECTURE.md) - Worker agent specification
