# Quick Start Guide

Get VTOL-DB running in under 5 minutes.

## Prerequisites

- **Docker** & **Docker Compose** (v2.0+)
- **Git**

## 1. Clone the Repository

```bash
git clone https://github.com/DevSkoll/drone_fleet_manager.git
cd drone_fleet_manager
```

## 2. Start the Services

**Development mode** (with hot reload):
```bash
docker compose -f docker-compose.dev.yml up -d
```

**Production mode**:
```bash
docker compose up -d
```

## 3. Verify Installation

Wait about 30 seconds for services to start, then check:

| Service | URL | Expected |
|---------|-----|----------|
| Dashboard | http://localhost:3000 | React UI |
| API | http://localhost:8080/api/drones | JSON array |

```bash
# Check backend health
curl http://localhost:8080/api/drones
# Expected: [] (empty array)

# Check container status
docker compose -f docker-compose.dev.yml ps
```

## 4. Create Your First Drone

```bash
curl -X POST http://localhost:8080/api/drones \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Drone-001",
    "model": "DJI Mavic 3",
    "serialNumber": "SN-001-ALPHA"
  }'
```

**Response**:
```json
{
  "id": "abc123...",
  "name": "Drone-001",
  "model": "DJI Mavic 3",
  "serialNumber": "SN-001-ALPHA",
  "status": "INACTIVE",
  "lastSeen": null,
  "latitude": null,
  "longitude": null,
  "altitude": null,
  "batteryLevel": null
}
```

## 5. View in Dashboard

1. Open http://localhost:3000 in your browser
2. Click **Fleet** in the sidebar
3. See your new drone listed

## 6. Simulate a Fleet Worker (Optional)

Test real-time updates with a Python script:

```python
import asyncio
import websockets
import json

async def test_worker():
    async with websockets.connect("ws://localhost:8080/ws/fleet") as ws:
        # Register
        await ws.send(json.dumps({
            "type": "REGISTER",
            "timestamp": "2024-01-01T00:00:00Z",
            "payload": {
                "workerId": "worker-001",
                "droneId": "drone-001",
                "serialNumber": "SN-001-ALPHA",
                "capabilities": ["telemetry"]
            }
        }))
        print("Registered:", await ws.recv())

        # Send telemetry
        await ws.send(json.dumps({
            "type": "TELEMETRY",
            "timestamp": "2024-01-01T00:00:05Z",
            "payload": {
                "droneId": "drone-001",
                "position": {"latitude": 37.7749, "longitude": -122.4194, "altitude": 100},
                "battery": {"level": 85},
                "status": "ACTIVE"
            }
        }))
        print("Telemetry sent")

asyncio.run(test_worker())
```

Run with: `pip install websockets && python test_worker.py`

## 7. Stop Services

```bash
docker compose -f docker-compose.dev.yml down
```

## Next Steps

- [Architecture Overview](ARCHITECTURE.md) - Understand the system design
- [API Reference](API_REFERENCE.md) - Full API documentation
- [Configuration Guide](CONFIGURATION.md) - Customize your deployment
- [Examples](EXAMPLES.md) - More code examples

## Troubleshooting

### Port already in use
```bash
# Check what's using port 8080 or 3000
lsof -i :8080
lsof -i :3000

# Stop conflicting services or change ports in docker-compose
```

### Container won't start
```bash
# Check logs
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs frontend

# Rebuild from scratch
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build
```

### API returns 404
- Ensure backend container is running: `docker ps`
- Check backend logs: `docker compose logs backend`
- Verify correct URL: `http://localhost:8080/api/drones` (not `/api/drone`)
