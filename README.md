# Drone Management Platform

Modular platform for managing drone fleets with support for telemetry, logs, sensor data, and future ROS2/MAVLINK integration. Built with Spring Boot backend and React frontend, both containerized for scalable deployment.

## Architecture

### Backend (Spring Boot)
- **Modular service architecture**: Separate services for drones, telemetry, logs, and sensors
- **Abstracted storage layer**: Supports flatfile (JSON) and PostgreSQL backends
- **RESTful API**: Clean API contracts with DTOs
- **Repository pattern**: Pluggable storage implementations

### Frontend (React + Vite)
- **Feature-based structure**: Dashboard, Fleet, Telemetry, Logs, Sensor modules
- **Responsive design**: Dark-themed UI optimized for data visualization
- **API client abstraction**: Centralized backend communication
- **Map-ready**: Leaflet integration prepared for geospatial display

### Infrastructure
- **Docker containerization**: Backend, frontend, and optional PostgreSQL
- **Docker Compose orchestration**: Simple multi-service management
- **Volume mounts**: Persistent data storage
- **Network isolation**: Services communicate via dedicated bridge network

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000 and 8080 available

### Running the Application

```bash
# Start with flatfile storage (default)
docker compose up --build

# Start with PostgreSQL storage
docker compose --profile postgres up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/drones

### Stopping Services
```bash
docker compose down

# Remove volumes (data)
docker compose down -v
```

## Project Structure

```
VTOL-DB/
├── backend/
│   ├── src/main/java/com/vtoldb/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # Entity models
│   │   ├── repository/      # Data access interfaces
│   │   ├── service/         # Business logic
│   │   └── storage/         # Storage implementations
│   ├── src/main/resources/
│   │   └── application.yml  # Spring Boot config
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── features/        # Feature modules
│   │   │   ├── dashboard/   # Dashboard view
│   │   │   ├── fleet/       # Fleet management
│   │   │   ├── telemetry/   # Telemetry display
│   │   │   ├── logs/        # Log viewer
│   │   │   └── sensor/      # Sensor data
│   │   ├── services/        # API client
│   │   ├── components/      # Shared components
│   │   └── App.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── config/
│   ├── .env.template
│   └── README.md
├── data/                    # Flatfile storage (gitignored)
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Drone Management
- `GET /api/drones` - List all drones
- `GET /api/drones/{id}` - Get drone by ID
- `POST /api/drones` - Create new drone
- `PUT /api/drones/{id}` - Update drone
- `DELETE /api/drones/{id}` - Delete drone

### Example Request
```json
POST /api/drones
{
  "name": "Drone Alpha",
  "model": "VTOL-X1",
  "serialNumber": "VTX-2024-001",
  "status": "ACTIVE",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "altitude": 100.5,
  "batteryLevel": 85.0
}
```

## Configuration

### Storage Backend

**Flatfile (Default)**
- Data stored in `./data/drones.json`
- Suitable for development and small deployments
- No external dependencies

**PostgreSQL**
1. Enable in `docker-compose.yml` using `--profile postgres`
2. Update `backend/src/main/resources/application.yml`:
   ```yaml
   storage:
     type: postgresql
   ```
3. Configure database connection in environment variables

### Environment Variables
See `config/.env.template` for configuration options.

## Development

### Local Backend Development
```bash
cd backend
./mvnw spring-boot:run
```

### Local Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Future Expansion

### Planned Features
- **Command Service**: ROS2/MAVLINK protocol integration
- **WebSocket Support**: Real-time telemetry streaming
- **Map Integration**: Interactive drone visualization with Leaflet
- **Log Analysis**: Search, filter, and analysis tools
- **Sensor Data Management**: Image gallery and data downloads
- **Authentication**: User management and access control
- **Mission Planning**: Waypoint and flight path management

### Modularity
The platform is designed for easy expansion:
- Add new feature modules in `frontend/src/features/`
- Add new service modules in `backend/src/main/java/com/vtoldb/service/`
- Implement new storage backends via `DroneRepository` interface

## Technology Stack

**Backend**
- Spring Boot 3.2.0
- Java 17
- Jackson (JSON processing)
- Maven

**Frontend**
- React 18
- Vite 5
- React Router 6
- Axios
- Leaflet (maps)

**Infrastructure**
- Docker
- Docker Compose
- PostgreSQL 16 (optional)

---

**Bryce at JCU//JEDI**  
arctek.us
