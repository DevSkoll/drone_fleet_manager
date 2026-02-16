# Fleet Worker Agent Architecture

> Draft specification for the lightweight agent that runs on drone companion computers and communicates with the VTOL-DB Fleet Manager.

## Overview

The Fleet Worker is a Java application that runs on the drone's companion computer (e.g., Jetson Nano, Raspberry Pi, or similar edge device). It acts as the bridge between the drone's flight controller and the centralized Fleet Manager, providing:

- Real-time telemetry reporting
- Command reception and execution
- Health monitoring and heartbeat
- Automatic reconnection with exponential backoff

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Drone Companion Computer                     │
│                                                                  │
│  ┌─────────────┐    ┌─────────────────────────────────────────┐ │
│  │   Flight    │    │           Fleet Worker Agent            │ │
│  │ Controller  │◄──►│                                         │ │
│  │  (Pixhawk)  │    │  ┌─────────────┐  ┌─────────────────┐  │ │
│  └─────────────┘    │  │  MAVLink    │  │   WebSocket     │  │ │
│        │            │  │  Adapter    │  │   Client        │──┼─┼──► Fleet Manager
│    MAVLink          │  └─────────────┘  └─────────────────┘  │ │    (VTOL-DB)
│    (Serial/UDP)     │         │                │              │ │
│                     │         ▼                ▼              │ │
│                     │  ┌─────────────┐  ┌─────────────────┐  │ │
│                     │  │  Telemetry  │  │    Command      │  │ │
│                     │  │  Collector  │  │    Executor     │  │ │
│                     │  └─────────────┘  └─────────────────┘  │ │
│                     │                                         │ │
│                     └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. WebSocket Client (`ServerConnection`)

Manages the WebSocket connection to the Fleet Manager.

**Responsibilities:**
- Establish and maintain WebSocket connection to `ws://{fleet-manager}/ws/fleet`
- Handle connection lifecycle (connect, disconnect, reconnect)
- Implement exponential backoff for reconnection (1s → 2s → 4s → 8s → max 30s)
- Send/receive JSON messages
- Manage heartbeat ping/pong

**Configuration:**
```yaml
connection:
  server-url: ws://fleet-manager:8080/ws/fleet
  reconnect:
    initial-delay-ms: 1000
    max-delay-ms: 30000
    multiplier: 2.0
  heartbeat:
    interval-ms: 15000
    timeout-ms: 5000
```

### 2. Telemetry Collector (`TelemetryCollector`)

Gathers telemetry data from the flight controller.

**Data Sources:**
- **MAVLink**: Primary source for position, attitude, battery, GPS
- **Sensors**: Optional additional sensors (cameras, LiDAR, etc.)
- **System**: CPU, memory, temperature of companion computer

**Telemetry Data Model:**
```java
class TelemetryData {
    // Position
    double latitude;
    double longitude;
    double altitude;        // meters MSL
    double altitudeAGL;     // meters above ground
    double heading;         // degrees
    double speed;           // m/s

    // Attitude
    double roll;            // degrees
    double pitch;           // degrees
    double yaw;             // degrees

    // Battery
    double batteryLevel;    // percentage
    double batteryVoltage;  // volts
    double batteryCurrent;  // amps
    double batteryTemp;     // celsius

    // GPS
    int gpsFixType;         // 0=no fix, 2=2D, 3=3D
    int satelliteCount;
    double hdop;

    // Flight
    String flightMode;      // MANUAL, GUIDED, AUTO, RTL, LAND
    boolean armed;
    long flightTimeMs;

    // System
    String status;          // ACTIVE, INACTIVE, MAINTENANCE
    double cpuUsage;
    double memoryUsage;
    double temperature;
}
```

**Collection Strategy:**
- High-frequency (10 Hz): Position, attitude for smooth UI updates
- Medium-frequency (1 Hz): Battery, GPS, system stats
- On-change: Flight mode, armed state, alerts

**Publishing Strategy:**
- Aggregate and send at configurable rate (default: 1 Hz to server)
- Batch multiple readings to reduce network overhead
- Priority queue for critical updates (low battery, errors)

### 3. Command Executor (`CommandExecutor`)

Receives and executes commands from the Fleet Manager.

**Supported Commands:**
| Command | Parameters | Description |
|---------|------------|-------------|
| `GOTO` | lat, lon, alt | Navigate to waypoint |
| `RTL` | - | Return to launch |
| `LAND` | - | Land at current position |
| `TAKEOFF` | altitude | Takeoff to altitude |
| `ARM` | - | Arm motors |
| `DISARM` | - | Disarm motors |
| `SET_MODE` | mode | Change flight mode |
| `SET_SPEED` | speed | Set cruise speed |
| `PAUSE` | - | Hold current position |
| `RESUME` | - | Resume mission |
| `CAMERA_TRIGGER` | - | Trigger camera capture |
| `GIMBAL_CONTROL` | pitch, yaw | Control gimbal |

**Command Flow:**
```
Fleet Manager                    Worker Agent                  Flight Controller
     │                               │                              │
     │──── COMMAND {GOTO} ─────────►│                              │
     │                               │                              │
     │                               │── Validate Parameters ──────►│
     │                               │                              │
     │                               │◄── MAV_CMD_NAV_WAYPOINT ────│
     │                               │                              │
     │◄─── COMMAND_ACK {PENDING} ───│                              │
     │                               │                              │
     │     [Execution in progress]   │                              │
     │                               │◄── MISSION_ITEM_REACHED ────│
     │                               │                              │
     │◄─── COMMAND_ACK {SUCCESS} ───│                              │
     │                               │                              │
```

**Command Acknowledgment States:**
- `PENDING`: Command received, execution started
- `SUCCESS`: Command completed successfully
- `FAILED`: Command failed (with reason)
- `REJECTED`: Command rejected (invalid state, parameters)
- `TIMEOUT`: Command timed out

### 4. MAVLink Adapter (`MavlinkAdapter`)

Interfaces with the flight controller using MAVLink protocol.

**Connection Methods:**
- **Serial**: `/dev/ttyACM0` or `/dev/ttyUSB0` @ 57600/115200 baud
- **UDP**: `udp://localhost:14550` (via MAVProxy)
- **TCP**: `tcp://localhost:5760` (via SITL)

**Key MAVLink Messages:**
| Message | Direction | Purpose |
|---------|-----------|---------|
| `HEARTBEAT` | Both | Connection alive |
| `GLOBAL_POSITION_INT` | FC → Worker | GPS position |
| `ATTITUDE` | FC → Worker | Roll/pitch/yaw |
| `BATTERY_STATUS` | FC → Worker | Battery data |
| `GPS_RAW_INT` | FC → Worker | Raw GPS data |
| `SYS_STATUS` | FC → Worker | System status |
| `COMMAND_LONG` | Worker → FC | Send commands |
| `COMMAND_ACK` | FC → Worker | Command response |
| `MISSION_ITEM_REACHED` | FC → Worker | Waypoint reached |

**Libraries:**
- Java: [MAVLink Java Generator](https://github.com/dronefleet/mavlink) or pymavlink via Jython
- Alternative: Use MAVProxy as middleware and communicate via JSON API

## Message Protocol

### Registration
```json
// Worker → Server
{
  "type": "REGISTER",
  "timestamp": "2024-01-15T10:30:00Z",
  "payload": {
    "workerId": "worker-jetson-001",
    "droneId": "drone-alpha-001",
    "serialNumber": "PX4-001-2024",
    "capabilities": ["telemetry", "commands", "video"],
    "firmwareVersion": "1.14.0",
    "protocolVersion": "1.0",
    "vehicleType": "VTOL",
    "autopilot": "PX4"
  }
}

// Server → Worker
{
  "type": "REGISTER_ACK",
  "timestamp": "2024-01-15T10:30:01Z",
  "payload": {
    "status": "ACCEPTED",
    "sessionId": "session-uuid",
    "heartbeatInterval": 15000,
    "telemetryRate": 1000,
    "configuredChannels": ["telemetry", "commands"]
  }
}
```

### Telemetry
```json
{
  "type": "TELEMETRY",
  "timestamp": "2024-01-15T10:30:05Z",
  "payload": {
    "droneId": "drone-alpha-001",
    "position": {
      "latitude": 35.6762,
      "longitude": 139.6503,
      "altitude": 150.5,
      "heading": 45.0,
      "speed": 12.5
    },
    "attitude": {
      "roll": 2.5,
      "pitch": -1.2,
      "yaw": 45.0
    },
    "battery": {
      "level": 85,
      "voltage": 22.4,
      "current": 12.5,
      "temperature": 35.2
    },
    "gps": {
      "fixType": 3,
      "satellites": 12,
      "hdop": 0.8
    },
    "flight": {
      "mode": "GUIDED",
      "armed": true,
      "flightTime": 1234567
    },
    "status": "ACTIVE"
  }
}
```

### Command
```json
// Server → Worker
{
  "type": "COMMAND",
  "correlationId": "cmd-uuid-123",
  "timestamp": "2024-01-15T10:30:10Z",
  "payload": {
    "droneId": "drone-alpha-001",
    "command": "GOTO",
    "parameters": {
      "latitude": 35.6800,
      "longitude": 139.6550,
      "altitude": 100.0
    },
    "priority": "NORMAL",
    "timeout": 30000
  }
}

// Worker → Server
{
  "type": "COMMAND_ACK",
  "correlationId": "cmd-uuid-123",
  "timestamp": "2024-01-15T10:30:11Z",
  "payload": {
    "status": "SUCCESS",
    "message": "Waypoint navigation started"
  }
}
```

### Heartbeat
```json
// Bidirectional
{
  "type": "HEARTBEAT",
  "timestamp": "2024-01-15T10:30:15Z",
  "payload": {
    "workerId": "worker-jetson-001"
  }
}
```

### Alert
```json
{
  "type": "ALERT",
  "timestamp": "2024-01-15T10:30:20Z",
  "payload": {
    "droneId": "drone-alpha-001",
    "alertType": "LOW_BATTERY",
    "severity": "WARNING",
    "message": "Battery below 20%",
    "data": {
      "batteryLevel": 18,
      "estimatedFlightTime": 300
    }
  }
}
```

## Configuration

### Worker Configuration File (`application.yml`)
```yaml
worker:
  id: worker-jetson-001
  drone-id: drone-alpha-001

fleet-manager:
  url: ws://fleet-manager.local:8080/ws/fleet
  reconnect:
    initial-delay: 1000
    max-delay: 30000
    multiplier: 2.0

telemetry:
  rate-ms: 1000
  high-frequency-rate-ms: 100
  batch-size: 10

mavlink:
  connection: serial
  serial:
    port: /dev/ttyACM0
    baud: 115200
  udp:
    host: localhost
    port: 14550

heartbeat:
  interval-ms: 15000

logging:
  level: INFO
  file: /var/log/fleet-worker/worker.log
```

## Lifecycle

### Startup Sequence
1. Load configuration
2. Initialize MAVLink connection
3. Wait for flight controller heartbeat
4. Connect to Fleet Manager WebSocket
5. Send REGISTER message
6. Wait for REGISTER_ACK
7. Start telemetry collection and publishing
8. Start heartbeat timer

### Shutdown Sequence
1. Stop telemetry publishing
2. Send final status update
3. Close WebSocket connection gracefully
4. Close MAVLink connection
5. Exit

### Error Recovery
- **Lost MAVLink**: Reconnect with backoff, report status to Fleet Manager
- **Lost WebSocket**: Reconnect with exponential backoff
- **Command timeout**: Report TIMEOUT status, continue operation
- **Critical error**: Log, alert, attempt recovery or safe mode

## Deployment

### Docker Container
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/fleet-worker.jar app.jar
COPY config/application.yml config/
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### systemd Service
```ini
[Unit]
Description=VTOL-DB Fleet Worker Agent
After=network.target

[Service]
Type=simple
User=drone
ExecStart=/opt/fleet-worker/bin/fleet-worker
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Security Considerations

### Authentication (Future)
- JWT tokens for WebSocket authentication
- Certificate-based mutual TLS
- API key validation

### Data Protection
- TLS encryption for WebSocket connection
- Validate all incoming commands
- Rate limiting on command execution
- Geofence validation before executing navigation commands

## Future Enhancements

1. **Video Streaming**: WebRTC signaling over WebSocket
2. **Mission Upload**: Receive and execute mission plans
3. **Swarm Coordination**: Inter-drone communication
4. **Edge AI**: Local inference for object detection
5. **Offline Mode**: Store-and-forward when disconnected
6. **OTA Updates**: Remote firmware/software updates

## Project Structure (Draft)

```
fleet-worker/
├── pom.xml
├── src/main/java/com/vtoldb/worker/
│   ├── FleetWorkerApplication.java
│   ├── config/
│   │   └── WorkerConfig.java
│   ├── websocket/
│   │   ├── ServerConnection.java
│   │   └── MessageHandler.java
│   ├── mavlink/
│   │   ├── MavlinkAdapter.java
│   │   └── MavlinkMessageParser.java
│   ├── telemetry/
│   │   ├── TelemetryCollector.java
│   │   └── TelemetryPublisher.java
│   ├── command/
│   │   ├── CommandExecutor.java
│   │   └── CommandValidator.java
│   └── model/
│       ├── TelemetryData.java
│       ├── CommandRequest.java
│       └── WorkerState.java
├── src/main/resources/
│   └── application.yml
└── src/test/java/
    └── ...
```

---

*This document is a draft specification. Implementation details may change based on hardware constraints, MAVLink version compatibility, and performance requirements.*
