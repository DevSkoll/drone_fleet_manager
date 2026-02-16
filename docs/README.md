# VTOL-DB Documentation

Welcome to the VTOL-DB documentation. VTOL-DB is a modular drone fleet management platform for monitoring, controlling, and managing fleets of unmanned aerial vehicles.

## What is VTOL-DB?

VTOL-DB provides a centralized control plane for drone fleet operations:

- **Real-time Monitoring** - Track drone positions, battery levels, and status via WebSocket
- **Fleet Management** - Create, update, and manage drone records
- **Worker Communication** - Bidirectional communication with drone companion computers
- **Command Dispatch** - Send commands to drones and receive acknowledgments
- **Configurable** - Flexible settings for deployment customization

## Quick Links

| I want to... | Go to... |
|--------------|----------|
| Get started quickly | [Quick Start Guide](QUICK_START.md) |
| Understand the architecture | [Architecture Overview](ARCHITECTURE.md) |
| Build an integration | [API Reference](API_REFERENCE.md) |
| Configure the system | [Configuration Guide](CONFIGURATION.md) |
| Deploy to production | [Deployment Guide](DEPLOYMENT.md) |
| Contribute to development | [Development Guide](DEVELOPMENT.md) |
| See code examples | [Examples](EXAMPLES.md) |
| Build a fleet worker | [Fleet Worker Architecture](FLEET_WORKER_ARCHITECTURE.md) |

## Documentation Index

### Getting Started
- **[Quick Start](QUICK_START.md)** - Get running in under 5 minutes with Docker

### Architecture & Design
- **[Architecture](ARCHITECTURE.md)** - System design, components, and data flows
- **[Fleet Worker Architecture](FLEET_WORKER_ARCHITECTURE.md)** - Drone-side worker agent specification

### Reference
- **[API Reference](API_REFERENCE.md)** - Complete REST and WebSocket API documentation
- **[Configuration](CONFIGURATION.md)** - All configuration options explained

### Operations
- **[Deployment](DEPLOYMENT.md)** - Production deployment, scaling, and monitoring
- **[Development](DEVELOPMENT.md)** - Local setup and contribution guidelines

### Examples
- **[Examples](EXAMPLES.md)** - Python, JavaScript, and curl examples

## Technology Stack

| Component | Technology |
|-----------|------------|
| Backend | Spring Boot 3.2, Java 21 |
| Frontend | React 18, Vite 5 |
| Real-time | WebSocket (STOMP + Raw) |
| Storage | Flatfile JSON / PostgreSQL |
| Container | Docker, Docker Compose |
| Maps | Leaflet |

## Key Features

### Dashboard
- Real-time fleet overview with statistics
- Interactive map with drone locations
- Status monitoring with alerts

### Fleet Management
- Searchable drone inventory
- Status filtering and tracking
- Battery level visualization

### Settings
- Database configuration
- Backup scheduling
- Security settings
- WebSocket tuning
- Fleet parameters

### WebSocket Communication
- STOMP for dashboard real-time updates
- Raw WebSocket for fleet workers
- Automatic reconnection
- Heartbeat monitoring

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                        VTOL-DB                              │
├────────────────────────────────────────────────────────────┤
│                                                             │
│   Dashboard ◄──STOMP──► Backend ◄──REST──► API Clients    │
│   (Browser)             (Spring)                           │
│                            │                               │
│                            ▼                               │
│   Fleet Workers ◄──WS──► Storage (JSON/PostgreSQL)        │
│   (on drones)                                              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/DevSkoll/drone_fleet_manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DevSkoll/drone_fleet_manager/discussions)

## License

VTOL-DB is open source software.

---

**Version**: 0.1.0
**Last Updated**: 2024
