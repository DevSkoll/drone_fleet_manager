# System Architecture

VTOL-DB is a modular drone fleet management platform built with a modern microservices-inspired architecture.

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VTOL-DB System                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌────────────────┐                      ┌────────────────────┐           │
│    │    Frontend    │    REST + WebSocket  │      Backend       │           │
│    │  React + Vite  │◄────────────────────►│  Spring Boot 3.2   │           │
│    │    :3000       │                      │      :8080         │           │
│    └────────────────┘                      └─────────┬──────────┘           │
│           │                                          │                       │
│           │ STOMP/SockJS                             │                       │
│           │ /ws/dashboard                            │                       │
│           └──────────────────────────────────────────┤                       │
│                                                      │                       │
│                                            ┌─────────▼──────────┐           │
│                                            │      Storage       │           │
│                                            │  Flatfile (JSON)   │           │
│                                            │   or PostgreSQL    │           │
│                                            └────────────────────┘           │
│                                                      ▲                       │
│    ┌────────────────┐                               │                       │
│    │  Fleet Worker  │     Raw WebSocket             │                       │
│    │   (on drone)   │◄──────/ws/fleet───────────────┘                       │
│    │   Companion    │                                                        │
│    │   Computer     │                                                        │
│    └────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 18.2.0 |
| **Build Tool** | Vite | 5.0.8 |
| **Routing** | React Router | 6.20.0 |
| **HTTP Client** | Axios | 1.6.2 |
| **Maps** | Leaflet + react-leaflet | 1.9.4 / 4.2.1 |
| **WebSocket** | STOMP.js + SockJS | 7.0.0 / 1.6.1 |
| **Backend** | Spring Boot | 3.2.0 |
| **Language** | Java | 21 |
| **WebSocket** | Spring WebSocket | Built-in |
| **Storage** | Flatfile JSON / PostgreSQL | - |
| **Containerization** | Docker | - |

---

## Backend Architecture

### Package Structure

```
backend/src/main/java/com/vtoldb/
├── VtolDbApplication.java          # Spring Boot main class
├── config/
│   ├── WebSocketConfig.java        # STOMP broker configuration
│   └── FleetWebSocketConfig.java   # Raw WebSocket for workers
├── controller/
│   ├── DroneController.java        # REST API for drones
│   └── SettingsController.java     # REST API for settings
├── dto/
│   ├── DroneDTO.java               # Drone data transfer object
│   └── SettingsDTO.java            # Settings data transfer object
├── model/
│   ├── Drone.java                  # Drone entity
│   ├── DroneStatus.java            # Status enum
│   └── settings/                   # Settings models
│       ├── AppSettings.java
│       ├── DatabaseSettings.java
│       ├── BackupSettings.java
│       ├── SecuritySettings.java
│       ├── WebSocketSettings.java
│       └── FleetSettings.java
├── repository/
│   ├── DroneRepository.java        # Drone repository interface
│   └── SettingsRepository.java     # Settings repository interface
├── service/
│   ├── DroneService.java           # Drone business logic
│   ├── SettingsService.java        # Settings business logic
│   ├── FleetBroadcastService.java  # STOMP broadcasting
│   ├── CommandService.java         # Command dispatch
│   └── WorkerHealthService.java    # Scheduled health checks
├── storage/
│   ├── FlatfileRepositoryImpl.java       # JSON file storage
│   └── SettingsFlatfileRepositoryImpl.java
└── websocket/
    ├── handler/
    │   ├── FleetWebSocketHandler.java    # Main WS handler
    │   ├── RegistrationHandler.java      # Worker registration
    │   └── TelemetryHandler.java         # Telemetry processing
    ├── protocol/
    │   ├── MessageType.java              # Message type enum
    │   ├── FleetMessage.java             # Message envelope
    │   ├── WorkerRegistration.java       # Registration payload
    │   ├── TelemetryPayload.java         # Telemetry payload
    │   ├── CommandPayload.java           # Command payload
    │   ├── CommandAck.java               # Command acknowledgment
    │   └── RegistrationAck.java          # Registration response
    └── session/
        ├── FleetSession.java             # Session state
        └── FleetSessionManager.java      # Session tracking
```

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│              Controller Layer                    │
│  (REST endpoints, request/response handling)    │
├─────────────────────────────────────────────────┤
│               Service Layer                      │
│  (Business logic, DTO conversion, validation)   │
├─────────────────────────────────────────────────┤
│             Repository Layer                     │
│  (Data access abstraction, interfaces)          │
├─────────────────────────────────────────────────┤
│              Storage Layer                       │
│  (Flatfile JSON or PostgreSQL implementation)   │
└─────────────────────────────────────────────────┘
```

### Data Models

**Drone**
```java
{
  id: String,           // UUID
  name: String,
  model: String,
  serialNumber: String,
  status: DroneStatus,  // ACTIVE, INACTIVE, MAINTENANCE, OFFLINE
  lastSeen: LocalDateTime,
  latitude: Double,
  longitude: Double,
  altitude: Double,
  batteryLevel: Double
}
```

**AppSettings**
```java
{
  database: {
    storageType: String,      // "flatfile" or "postgresql"
    flatfilePath: String,
    postgresql: { host, port, database, username, password }
  },
  backup: {
    enabled: boolean,
    intervalHours: int,
    retentionCount: int,
    directoryPath: String
  },
  security: {
    workerAuthKey: String,
    authenticationEnabled: boolean
  },
  websocket: {
    heartbeatInterval: long,   // ms
    idleTimeout: long,         // ms
    healthCheckInterval: long  // ms
  },
  fleet: {
    defaultTelemetryInterval: long,  // ms
    offlineThreshold: long,          // ms
    maxConcurrentWorkers: int
  }
}
```

---

## Frontend Architecture

### Feature Structure

```
frontend/src/
├── App.jsx                    # Main component with routing
├── App.css                    # Global styles
├── index.css                  # CSS variables (design system)
├── components/                # Reusable components
│   ├── Button.jsx            # Button with variants
│   ├── Card.jsx              # Card with Header/Body/Footer
│   ├── DroneMap.jsx          # Leaflet map component
│   └── index.js              # Barrel exports
├── contexts/
│   └── FleetContext.jsx      # Global fleet state provider
├── features/                  # Feature-based pages
│   ├── dashboard/
│   │   └── Dashboard.jsx     # Main dashboard
│   ├── fleet/
│   │   └── FleetView.jsx     # Fleet management
│   ├── telemetry/
│   │   └── TelemetryView.jsx # Telemetry display
│   ├── logs/
│   │   └── LogsView.jsx      # Log viewer
│   ├── sensor/
│   │   └── SensorView.jsx    # Sensor data
│   └── settings/
│       ├── SettingsView.jsx  # Settings page
│       ├── SettingsView.css
│       └── sections/         # Settings section components
├── hooks/
│   └── useFleetSocket.js     # WebSocket + REST fallback
└── services/
    ├── api.js                # Axios API client
    └── websocket/
        ├── WebSocketService.js  # STOMP client
        └── channels.js          # Channel constants
```

### State Management

```
┌─────────────────────────────────────────────────────────────┐
│                      FleetProvider                           │
│  (Context providing drones, stats, connection status)       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Dashboard   │    │  FleetView   │    │  Settings    │  │
│  │  useFleet()  │    │  useFleet()  │    │  local state │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Design System (CSS Variables)

```css
/* Colors */
--color-primary: #71C9CE      /* Teal */
--color-success: #4ECDC4      /* Green */
--color-warning: #FFE66D      /* Yellow */
--color-danger: #FF6B6B       /* Red */
--color-dark: #0A1F2E         /* Background */

/* Spacing */
--space-xs: 0.25rem  --space-sm: 0.5rem   --space-md: 1rem
--space-lg: 1.5rem   --space-xl: 2rem     --space-2xl: 3rem

/* Transitions */
--transition-fast: 150ms
--transition-base: 250ms
--transition-slow: 350ms
```

---

## WebSocket Architecture

### Dual WebSocket System

VTOL-DB uses two separate WebSocket endpoints for different purposes:

| Endpoint | Protocol | Purpose | Clients |
|----------|----------|---------|---------|
| `/ws/dashboard` | STOMP over SockJS | Dashboard real-time updates | Web browsers |
| `/ws/fleet` | Raw WebSocket | Fleet worker communication | Drone workers |

### Fleet WebSocket Flow

```
Worker                          Server                      Dashboard
   │                               │                            │
   │──── REGISTER ────────────────►│                            │
   │◄─── REGISTER_ACK ────────────│                            │
   │                               │──── DRONE_UPDATED ────────►│
   │                               │                            │
   │──── TELEMETRY ───────────────►│                            │
   │                               │──── UPDATE /topic/drones ─►│
   │                               │                            │
   │◄─── COMMAND ─────────────────│                            │
   │──── COMMAND_ACK ─────────────►│                            │
   │                               │                            │
   │◄─── HEARTBEAT ───────────────►│                            │
   │                               │                            │
```

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `REGISTER` | Worker → Server | Worker registration with capabilities |
| `REGISTER_ACK` | Server → Worker | Registration confirmation |
| `TELEMETRY` | Worker → Server | Position, battery, status data |
| `COMMAND` | Server → Worker | Command for drone execution |
| `COMMAND_ACK` | Worker → Server | Command completion status |
| `HEARTBEAT` | Bidirectional | Connection keepalive |
| `ALERT` | Worker → Server | Alert/warning message |

### Session Management

```
FleetSessionManager
├── sessionId → FleetSession (main index)
├── droneId → sessionId (drone lookup)
└── wsSessionId → sessionId (cleanup on disconnect)

FleetSession
├── sessionId: String
├── workerId: String
├── droneId: String
├── capabilities: List<String>
├── lastActivity: Instant
└── wsSession: WebSocketSession
```

---

## Data Flow Diagrams

### Worker Registration

```
1. Worker connects to /ws/fleet
2. Worker sends REGISTER message
3. FleetWebSocketHandler routes to RegistrationHandler
4. RegistrationHandler:
   a. Creates FleetSession
   b. Creates/updates Drone record (status = ACTIVE)
   c. Returns REGISTER_ACK
5. FleetBroadcastService notifies dashboard
```

### Telemetry Update

```
1. Worker sends TELEMETRY message
2. TelemetryHandler extracts position, battery, status
3. DroneService.updateDrone() persists changes
4. FlatfileRepositoryImpl saves to JSON file
5. FleetBroadcastService.broadcastDroneUpdate()
6. Dashboard receives via STOMP subscription
```

### Health Check (Scheduled)

```
Every 10 seconds (configurable):
1. WorkerHealthService.checkWorkerHealth()
2. FleetSessionManager.getExpiredSessions()
3. For each expired session:
   a. Close WebSocket connection
   b. Mark drone as OFFLINE
   c. Remove session
   d. Broadcast alert to dashboard
```

---

## Storage Architecture

### Flatfile Storage (Default)

```
data/
├── drones.json      # Drone records
└── settings.json    # Application settings
```

**Thread Safety**: ConcurrentHashMap cache with synchronized file I/O

**Format**:
```json
[
  {
    "id": "drone-001",
    "name": "Drone Alpha",
    "status": "ACTIVE",
    "lastSeen": [2024, 1, 15, 10, 30, 0],
    "latitude": 37.7749,
    "longitude": -122.4194,
    "batteryLevel": 85.0
  }
]
```

### PostgreSQL Storage (Optional)

Configured via `application.yml`:
```yaml
storage:
  type: postgresql
  postgresql:
    host: postgres
    port: 5432
    database: vtoldb
    username: vtoluser
    password: vtolpass
```

---

## Security Considerations

- **CORS**: Currently allows all origins (`*`) for development
- **Worker Authentication**: Optional shared key authentication
- **Session Enforcement**: One session per drone (prevents duplicates)
- **Sensitive Field Masking**: Passwords/keys never returned in API responses

---

## Deployment Architecture

### Docker Containers

```
┌─────────────────────────────────────────────────┐
│               Docker Network                     │
│                 (vtol-network)                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐        ┌──────────────┐       │
│  │   Frontend   │        │   Backend    │       │
│  │   :3000      │◄──────►│   :8080      │       │
│  │  (nginx/     │  proxy │  (Java 21)   │       │
│  │   serve)     │        │              │       │
│  └──────────────┘        └──────┬───────┘       │
│                                 │               │
│                          ┌──────▼───────┐       │
│                          │   Volume     │       │
│                          │  ./data:/app │       │
│                          │    /data     │       │
│                          └──────────────┘       │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Scalability Notes

- **Stateless Backend**: Session state in memory (single instance)
- **Storage**: Flatfile limits to single instance; PostgreSQL enables scaling
- **WebSocket**: STOMP broker is simple in-memory (consider Redis for multi-node)

See [Deployment Guide](DEPLOYMENT.md) for production recommendations.
