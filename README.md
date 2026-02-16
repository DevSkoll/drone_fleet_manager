# VTOL-DB

**Drone Fleet Management Platform**

Real-time drone fleet management with WebSocket telemetry, interactive map visualization, and comprehensive settings. Built with Spring Boot 3.2 and React 18.

## Features

- **Real-time Dashboard** - Live fleet status with WebSocket updates
- **Interactive Map** - Color-coded drone markers with Leaflet
- **Fleet Management** - Register, monitor, and command drones
- **Telemetry Streaming** - Position, battery, and status updates
- **Worker Authentication** - Secure drone-to-server communication
- **Flexible Storage** - Flatfile (JSON) or PostgreSQL backends
- **Comprehensive Settings** - Database, backup, security, WebSocket configuration

## Quick Start

```bash
# Clone repository
git clone https://github.com/DevSkoll/drone_fleet_manager.git
cd drone_fleet_manager

# Start services
docker compose -f docker-compose.dev.yml up -d

# Verify
curl http://localhost:8080/api/drones
```

**Access:**
- Dashboard: http://localhost:3000
- API: http://localhost:8080/api/drones

See [Quick Start Guide](docs/QUICK_START.md) for detailed setup instructions.

## Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](docs/QUICK_START.md) | Get running in 5 minutes |
| [Architecture](docs/ARCHITECTURE.md) | System design and data flows |
| [API Reference](docs/API_REFERENCE.md) | REST and WebSocket API docs |
| [Configuration](docs/CONFIGURATION.md) | All configuration options |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |
| [Development](docs/DEVELOPMENT.md) | Local setup and contributing |
| [Examples](docs/EXAMPLES.md) | Python, JavaScript, and curl examples |
| [Fleet Worker Spec](docs/FLEET_WORKER_ARCHITECTURE.md) | Worker agent protocol |

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Spring Boot 3.2, Java 21, WebSocket |
| Frontend | React 18, Vite 5, Leaflet |
| Storage | Flatfile (JSON) / PostgreSQL |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
VTOL-DB/
├── backend/                 # Spring Boot application
│   ├── src/main/java/      # Java source (controllers, services, models)
│   └── src/main/resources/ # Configuration
├── frontend/                # React application
│   ├── src/features/       # Feature modules (dashboard, fleet, settings)
│   └── src/services/       # API client
├── docs/                    # Documentation
├── data/                    # Data storage (gitignored)
└── docker-compose.yml       # Container orchestration
```

## API Overview

```bash
# List drones
curl http://localhost:8080/api/drones

# Create drone
curl -X POST http://localhost:8080/api/drones \
  -H "Content-Type: application/json" \
  -d '{"name":"Drone-001","serialNumber":"SN-001"}'

# WebSocket endpoints
ws://localhost:8080/ws/fleet      # Fleet workers
ws://localhost:8080/ws/dashboard  # Dashboard clients
```

See [API Reference](docs/API_REFERENCE.md) for complete documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

See [Development Guide](docs/DEVELOPMENT.md) for setup and guidelines.

## License

MIT License

---

**Bryce at JCU//JEDI**
arctek.us
