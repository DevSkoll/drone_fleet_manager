# API Reference

Complete reference for VTOL-DB REST and WebSocket APIs.

## Base URL

```
REST API:    http://localhost:8080/api
WebSocket:   ws://localhost:8080/ws/fleet      (workers)
             ws://localhost:8080/ws/dashboard  (dashboard)
```

## Authentication

Currently, VTOL-DB does not require authentication for REST API calls. Worker authentication via shared key can be enabled in settings.

---

# REST API

## Drones API

### List All Drones

```http
GET /api/drones
```

**Response** `200 OK`:
```json
[
  {
    "id": "drone-001",
    "name": "Alpha Drone",
    "model": "DJI Mavic 3",
    "serialNumber": "SN-001-ALPHA",
    "status": "ACTIVE",
    "lastSeen": "2024-01-15T10:30:00",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "altitude": 100.0,
    "batteryLevel": 85.0
  }
]
```

### Get Drone by ID

```http
GET /api/drones/{id}
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `id` | path | Drone UUID |

**Response** `200 OK`:
```json
{
  "id": "drone-001",
  "name": "Alpha Drone",
  "model": "DJI Mavic 3",
  "serialNumber": "SN-001-ALPHA",
  "status": "ACTIVE",
  "lastSeen": "2024-01-15T10:30:00",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "altitude": 100.0,
  "batteryLevel": 85.0
}
```

**Response** `404 Not Found`:
```json
null
```

### Create Drone

```http
POST /api/drones
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "New Drone",
  "model": "DJI Mavic 3",
  "serialNumber": "SN-002-BETA"
}
```

**Response** `201 Created`:
```json
{
  "id": "generated-uuid",
  "name": "New Drone",
  "model": "DJI Mavic 3",
  "serialNumber": "SN-002-BETA",
  "status": "INACTIVE",
  "lastSeen": null,
  "latitude": null,
  "longitude": null,
  "altitude": null,
  "batteryLevel": null
}
```

### Update Drone

```http
PUT /api/drones/{id}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Updated Drone Name",
  "model": "DJI Mavic 3 Pro",
  "status": "MAINTENANCE"
}
```

**Response** `200 OK`:
```json
{
  "id": "drone-001",
  "name": "Updated Drone Name",
  "model": "DJI Mavic 3 Pro",
  "serialNumber": "SN-001-ALPHA",
  "status": "MAINTENANCE",
  "lastSeen": "2024-01-15T10:30:00",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "altitude": 100.0,
  "batteryLevel": 85.0
}
```

**Response** `404 Not Found` if drone doesn't exist.

### Delete Drone

```http
DELETE /api/drones/{id}
```

**Response** `204 No Content` on success.

**Response** `404 Not Found` if drone doesn't exist.

---

## Settings API

### Get Settings

```http
GET /api/settings
```

**Response** `200 OK`:
```json
{
  "database": {
    "storageType": "flatfile",
    "flatfilePath": "./data/drones.json",
    "postgresql": {
      "host": "localhost",
      "port": 5432,
      "database": "vtoldb",
      "username": "",
      "password": null,
      "hasPassword": false
    }
  },
  "backup": {
    "enabled": false,
    "intervalHours": 24,
    "retentionCount": 7,
    "directoryPath": "./backups"
  },
  "security": {
    "workerAuthKey": null,
    "hasAuthKey": false,
    "authenticationEnabled": false
  },
  "websocket": {
    "heartbeatInterval": 15000,
    "idleTimeout": 60000,
    "healthCheckInterval": 10000
  },
  "fleet": {
    "defaultTelemetryInterval": 5000,
    "offlineThreshold": 30000,
    "maxConcurrentWorkers": 50
  }
}
```

> **Note**: Sensitive fields (`password`, `workerAuthKey`) are always `null` in responses. Use `hasPassword`/`hasAuthKey` to check if they're set.

### Update Settings

```http
PUT /api/settings
Content-Type: application/json
```

**Request Body** (partial update supported):
```json
{
  "backup": {
    "enabled": true,
    "intervalHours": 12
  },
  "fleet": {
    "maxConcurrentWorkers": 100
  }
}
```

**Response** `200 OK`: Returns complete updated settings.

**Response** `400 Bad Request`:
```json
{
  "error": "intervalHours must be between 1 and 168"
}
```

### Reset Settings to Defaults

```http
POST /api/settings/reset
```

**Response** `200 OK`: Returns settings with default values.

### Generate Auth Key

```http
POST /api/settings/generate-auth-key
```

**Response** `200 OK`:
```json
{
  "authKey": "HZw3OSsbLSnw99eAS0yS9mjPuCicaveokK7B65O24wY"
}
```

> **Important**: Copy the key immediately. It's only shown once.

---

## Settings Validation Rules

| Setting | Min | Max | Notes |
|---------|-----|-----|-------|
| `backup.intervalHours` | 1 | 168 | Max 1 week |
| `backup.retentionCount` | 1 | 100 | |
| `security.workerAuthKey` | 16 chars | - | If set |
| `websocket.heartbeatInterval` | 1000 | 300000 | ms |
| `websocket.idleTimeout` | 10000 | 600000 | ms |
| `websocket.healthCheckInterval` | 1000 | 60000 | ms |
| `fleet.defaultTelemetryInterval` | 1000 | 60000 | ms |
| `fleet.offlineThreshold` | 5000 | 300000 | ms |
| `fleet.maxConcurrentWorkers` | 1 | 1000 | |

---

# WebSocket API

## Fleet WebSocket (Workers)

**Endpoint**: `ws://localhost:8080/ws/fleet`

Raw WebSocket connection for drone workers.

### Message Envelope

All messages use this envelope format:

```json
{
  "type": "MESSAGE_TYPE",
  "channel": "optional_channel",
  "correlationId": "optional_uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "payload": { }
}
```

### REGISTER

Worker registration with the server.

**Direction**: Worker → Server

```json
{
  "type": "REGISTER",
  "timestamp": "2024-01-15T10:30:00Z",
  "payload": {
    "workerId": "worker-001",
    "droneId": "drone-001",
    "serialNumber": "SN-001-ALPHA",
    "capabilities": ["telemetry", "commands", "video"],
    "firmwareVersion": "1.2.3",
    "protocolVersion": "1.0"
  }
}
```

### REGISTER_ACK

Registration acknowledgment from server.

**Direction**: Server → Worker

```json
{
  "type": "REGISTER_ACK",
  "timestamp": "2024-01-15T10:30:00Z",
  "payload": {
    "status": "ACCEPTED",
    "sessionId": "session-uuid",
    "heartbeatInterval": 15000,
    "configuredChannels": ["telemetry", "commands"]
  }
}
```

**Status values**: `ACCEPTED`, `REJECTED`

### TELEMETRY

Real-time drone telemetry data.

**Direction**: Worker → Server

```json
{
  "type": "TELEMETRY",
  "timestamp": "2024-01-15T10:30:05Z",
  "payload": {
    "droneId": "drone-001",
    "position": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "altitude": 100.0,
      "heading": 45.0,
      "speed": 5.5
    },
    "battery": {
      "level": 85,
      "voltage": 22.5,
      "current": 12.3,
      "temperature": 35.0
    },
    "status": "ACTIVE",
    "flightMode": "AUTO",
    "sensors": {
      "gpsFixType": "3D_FIX",
      "satelliteCount": 12,
      "signalStrength": 95
    }
  }
}
```

### COMMAND

Command from server to drone.

**Direction**: Server → Worker

```json
{
  "type": "COMMAND",
  "correlationId": "cmd-uuid-123",
  "timestamp": "2024-01-15T10:31:00Z",
  "payload": {
    "droneId": "drone-001",
    "command": "GOTO",
    "parameters": {
      "latitude": 37.7750,
      "longitude": -122.4195,
      "altitude": 50.0
    },
    "priority": "NORMAL",
    "timeout": 30000
  }
}
```

**Command types**: `ARM`, `DISARM`, `TAKEOFF`, `LAND`, `GOTO`, `RTL`, `HOVER`, `SET_MODE`, `SET_SPEED`, `SET_ALTITUDE`, `EMERGENCY_STOP`, `CALIBRATE`

### COMMAND_ACK

Command acknowledgment from worker.

**Direction**: Worker → Server

```json
{
  "type": "COMMAND_ACK",
  "correlationId": "cmd-uuid-123",
  "timestamp": "2024-01-15T10:31:05Z",
  "payload": {
    "status": "SUCCESS",
    "message": "Command executed successfully",
    "result": {
      "actualAltitude": 50.2
    }
  }
}
```

**Status values**: `SUCCESS`, `FAILED`, `TIMEOUT`, `REJECTED`

### HEARTBEAT

Connection keepalive signal.

**Direction**: Bidirectional

```json
{
  "type": "HEARTBEAT",
  "timestamp": "2024-01-15T10:30:15Z",
  "payload": {
    "workerId": "worker-001"
  }
}
```

### ALERT

Alert/warning message from worker.

**Direction**: Worker → Server

```json
{
  "type": "ALERT",
  "timestamp": "2024-01-15T10:32:00Z",
  "payload": {
    "droneId": "drone-001",
    "severity": "WARNING",
    "code": "LOW_BATTERY",
    "message": "Battery level below 20%",
    "data": {
      "currentLevel": 18
    }
  }
}
```

**Severity levels**: `INFO`, `WARNING`, `ERROR`, `CRITICAL`

---

## Dashboard WebSocket (STOMP)

**Endpoint**: `ws://localhost:8080/ws/dashboard`

STOMP over SockJS for browser clients.

### Connection

```javascript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws/dashboard'),
  onConnect: () => {
    console.log('Connected to dashboard');
  }
});

client.activate();
```

### Topics

| Topic | Description |
|-------|-------------|
| `/topic/drones` | Fleet state updates |
| `/topic/telemetry` | Telemetry streams |
| `/topic/alerts` | System alerts |

### Subscribe Example

```javascript
client.subscribe('/topic/drones', (message) => {
  const data = JSON.parse(message.body);
  console.log('Drone update:', data);
});
```

### Message Format

```json
{
  "type": "UPDATE",
  "channel": "drones",
  "timestamp": "2024-01-15T10:30:00Z",
  "payload": {
    "updateType": "DRONE_UPDATED",
    "droneId": "drone-001",
    "data": {
      "status": "ACTIVE",
      "batteryLevel": 85.0,
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

**Update types**: `DRONE_CREATED`, `DRONE_UPDATED`, `DRONE_DELETED`, `SNAPSHOT`

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful delete) |
| `400` | Bad Request (validation error) |
| `404` | Not Found |
| `500` | Internal Server Error |

### Error Response Format

```json
{
  "error": "Description of what went wrong"
}
```

### WebSocket Errors

Errors are sent as messages with type `ERROR`:

```json
{
  "type": "ERROR",
  "timestamp": "2024-01-15T10:30:00Z",
  "payload": {
    "code": "INVALID_MESSAGE",
    "message": "Unknown message type: INVALID"
  }
}
```

---

## Rate Limits

Currently, VTOL-DB does not implement rate limiting. For production deployments, consider adding rate limiting at the reverse proxy level (nginx, Kong, etc.).

---

## CORS

CORS is enabled for all origins (`*`) by default. This is suitable for development but should be restricted in production.

Configure allowed origins via reverse proxy in production.
