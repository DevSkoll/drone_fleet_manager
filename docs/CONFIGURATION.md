# Configuration Guide

Complete reference for all VTOL-DB configuration options.

## Configuration Methods

1. **application.yml** - Backend Spring Boot configuration
2. **Environment Variables** - Docker/runtime overrides
3. **Settings API** - Runtime configuration via REST API
4. **Frontend Environment** - Vite environment variables

---

## Backend Configuration (application.yml)

Location: `backend/src/main/resources/application.yml`

### Complete Reference

```yaml
server:
  port: 8080                    # HTTP server port

spring:
  application:
    name: vtol-db-backend
  autoconfigure:
    exclude:                    # Disabled when using flatfile storage
      - org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
      - org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration
      - org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration

storage:
  type: flatfile                # Storage backend: flatfile or postgresql
  flatfile:
    path: ./data/drones.json    # Path to drone data file
  settings:
    path: ./data/settings.json  # Path to settings file
  postgresql:                   # PostgreSQL configuration (when type: postgresql)
    enabled: false
    host: postgres
    port: 5432
    database: vtoldb
    username: vtoluser
    password: vtolpass

websocket:
  fleet:
    endpoint: /ws/fleet         # Fleet worker WebSocket endpoint
    heartbeat-interval: 15000   # Heartbeat interval (ms)
    idle-timeout: 60000         # Worker idle timeout (ms)
    health-check-interval: 10000 # Health check frequency (ms)
  dashboard:
    endpoint: /ws/dashboard     # Dashboard STOMP endpoint

logging:
  level:
    com.vtoldb: INFO            # Application log level
    root: WARN                  # Root log level
```

---

## Environment Variables

Override application.yml values via environment variables.

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | HTTP server port | `8080` |
| `STORAGE_TYPE` | Storage backend | `flatfile` |
| `STORAGE_FLATFILE_PATH` | Drone data path | `./data/drones.json` |
| `STORAGE_SETTINGS_PATH` | Settings path | `./data/settings.json` |
| `STORAGE_POSTGRESQL_ENABLED` | Enable PostgreSQL | `false` |
| `STORAGE_POSTGRESQL_HOST` | Database host | `localhost` |
| `STORAGE_POSTGRESQL_PORT` | Database port | `5432` |
| `STORAGE_POSTGRESQL_DATABASE` | Database name | `vtoldb` |
| `STORAGE_POSTGRESQL_USERNAME` | Database user | - |
| `STORAGE_POSTGRESQL_PASSWORD` | Database password | - |
| `WEBSOCKET_FLEET_HEARTBEAT_INTERVAL` | Heartbeat interval | `15000` |
| `WEBSOCKET_FLEET_IDLE_TIMEOUT` | Idle timeout | `60000` |
| `WEBSOCKET_FLEET_HEALTH_CHECK_INTERVAL` | Health check interval | `10000` |
| `LOGGING_LEVEL_COM_VTOLDB` | App log level | `INFO` |

### Example: Docker Compose Override

```yaml
services:
  backend:
    environment:
      - STORAGE_TYPE=postgresql
      - STORAGE_POSTGRESQL_ENABLED=true
      - STORAGE_POSTGRESQL_HOST=db
      - STORAGE_POSTGRESQL_PASSWORD=secretpass
      - LOGGING_LEVEL_COM_VTOLDB=DEBUG
```

---

## Frontend Environment Variables

Location: `frontend/.env` or environment

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` |
| `VITE_WS_URL` | WebSocket URL | `http://localhost:8080/ws/dashboard` |

### Example: .env file

```bash
VITE_API_URL=http://api.example.com/api
VITE_WS_URL=wss://api.example.com/ws/dashboard
```

### Vite Configuration

Location: `frontend/vite.config.js`

```javascript
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',       // Polyfill for sockjs-client
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8080',  // Proxy API calls to backend
        changeOrigin: true
      }
    }
  }
})
```

---

## Runtime Settings (API)

Settings can be modified at runtime via the Settings API. These are stored in `settings.json`.

### Database Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `database.storageType` | string | `flatfile` | Storage backend |
| `database.flatfilePath` | string | `./data/drones.json` | Flatfile path |
| `database.postgresql.host` | string | `localhost` | PostgreSQL host |
| `database.postgresql.port` | int | `5432` | PostgreSQL port |
| `database.postgresql.database` | string | `vtoldb` | Database name |
| `database.postgresql.username` | string | `` | Username |
| `database.postgresql.password` | string | `` | Password |

### Backup Settings

| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `backup.enabled` | boolean | `false` | - | Enable backups |
| `backup.intervalHours` | int | `24` | 1-168 | Backup interval |
| `backup.retentionCount` | int | `7` | 1-100 | Backups to keep |
| `backup.directoryPath` | string | `./backups` | - | Backup directory |

### Security Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `security.workerAuthKey` | string | `` | Worker authentication key |
| `security.authenticationEnabled` | boolean | `false` | Require auth |

### WebSocket Settings

| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `websocket.heartbeatInterval` | long | `15000` | 1000-300000 | Heartbeat interval (ms) |
| `websocket.idleTimeout` | long | `60000` | 10000-600000 | Idle timeout (ms) |
| `websocket.healthCheckInterval` | long | `10000` | 1000-60000 | Health check interval (ms) |

### Fleet Settings

| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `fleet.defaultTelemetryInterval` | long | `5000` | 1000-60000 | Expected telemetry rate (ms) |
| `fleet.offlineThreshold` | long | `30000` | 5000-300000 | Offline threshold (ms) |
| `fleet.maxConcurrentWorkers` | int | `50` | 1-1000 | Max concurrent workers |

### Updating Settings via API

```bash
# Update backup settings
curl -X PUT http://localhost:8080/api/settings \
  -H "Content-Type: application/json" \
  -d '{"backup": {"enabled": true, "intervalHours": 12}}'

# Update WebSocket settings
curl -X PUT http://localhost:8080/api/settings \
  -H "Content-Type: application/json" \
  -d '{"websocket": {"heartbeatInterval": 20000}}'

# Generate new auth key
curl -X POST http://localhost:8080/api/settings/generate-auth-key
```

---

## Storage Configuration

### Flatfile Storage (Default)

Best for development and single-instance deployments.

```yaml
storage:
  type: flatfile
  flatfile:
    path: ./data/drones.json
```

**Data Location**:
```
data/
├── drones.json      # Drone records
└── settings.json    # Application settings
```

### PostgreSQL Storage

Best for production and multi-instance deployments.

```yaml
storage:
  type: postgresql
  postgresql:
    enabled: true
    host: postgres
    port: 5432
    database: vtoldb
    username: vtoluser
    password: vtolpass
```

> **Note**: Remove the Spring autoconfigure exclusions when using PostgreSQL.

---

## Logging Configuration

### Log Levels

| Level | Description |
|-------|-------------|
| `TRACE` | Most detailed logging |
| `DEBUG` | Debug information |
| `INFO` | General information (default) |
| `WARN` | Warnings |
| `ERROR` | Errors only |

### Configure via application.yml

```yaml
logging:
  level:
    com.vtoldb: DEBUG
    com.vtoldb.websocket: TRACE
    root: INFO
```

### Configure via Environment

```bash
LOGGING_LEVEL_COM_VTOLDB=DEBUG
LOGGING_LEVEL_ROOT=INFO
```

---

## Docker Configuration

### docker-compose.yml (Production)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
    environment:
      - STORAGE_TYPE=flatfile

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### docker-compose.dev.yml (Development)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src    # Hot reload
    depends_on:
      - backend
```

---

## Security Recommendations

### Production Checklist

- [ ] Enable HTTPS via reverse proxy
- [ ] Restrict CORS origins
- [ ] Enable worker authentication
- [ ] Use strong auth key (auto-generated is 32 bytes)
- [ ] Use PostgreSQL instead of flatfile
- [ ] Set appropriate timeouts
- [ ] Configure log levels appropriately
- [ ] Use environment variables for secrets

### Example Production Environment

```bash
# Backend
STORAGE_TYPE=postgresql
STORAGE_POSTGRESQL_HOST=db.internal
STORAGE_POSTGRESQL_PASSWORD=${DB_PASSWORD}
WEBSOCKET_FLEET_IDLE_TIMEOUT=30000
LOGGING_LEVEL_COM_VTOLDB=WARN

# Frontend
VITE_API_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://api.yourdomain.com/ws/dashboard
```
