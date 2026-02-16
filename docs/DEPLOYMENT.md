# Deployment Guide

Production deployment instructions for VTOL-DB.

## Deployment Options

1. **Docker Compose** - Recommended for most deployments
2. **Kubernetes** - For large-scale deployments
3. **Manual** - Without containers

---

## Docker Compose Deployment

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- 2GB RAM minimum
- 10GB disk space

### Quick Production Deploy

```bash
# Clone repository
git clone https://github.com/DevSkoll/drone_fleet_manager.git
cd drone_fleet_manager

# Create data directory
mkdir -p data

# Start services
docker compose up -d

# Verify
docker compose ps
curl http://localhost:8080/api/drones
```

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    restart: always
    ports:
      - "8080:8080"
    volumes:
      - vtol-data:/app/data
    environment:
      - STORAGE_TYPE=flatfile
      - LOGGING_LEVEL_COM_VTOLDB=WARN
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/drones"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy

volumes:
  vtol-data:
```

### With PostgreSQL

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      - STORAGE_TYPE=postgresql
      - STORAGE_POSTGRESQL_ENABLED=true
      - STORAGE_POSTGRESQL_HOST=postgres
      - STORAGE_POSTGRESQL_DATABASE=vtoldb
      - STORAGE_POSTGRESQL_USERNAME=vtoluser
      - STORAGE_POSTGRESQL_PASSWORD=${DB_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - backend

  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_DB=vtoldb
      - POSTGRES_USER=vtoluser
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vtoluser -d vtoldb"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
```

Create `.env` file:
```bash
DB_PASSWORD=your-secure-password-here
```

---

## Reverse Proxy Setup (nginx)

### nginx Configuration

```nginx
upstream vtol-backend {
    server localhost:8080;
}

upstream vtol-frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name vtol.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vtol.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/vtol.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vtol.yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://vtol-frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://vtol-backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket - Dashboard
    location /ws/dashboard {
        proxy_pass http://vtol-backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # WebSocket - Fleet Workers
    location /ws/fleet {
        proxy_pass http://vtol-backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### SSL with Let's Encrypt

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d vtol.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

---

## Health Checks

### Backend Health

```bash
# Simple health check
curl http://localhost:8080/api/drones

# With timeout
curl --max-time 5 http://localhost:8080/api/drones
```

### Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/api/drones"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## Monitoring

### Log Monitoring

```bash
# View logs
docker compose logs -f

# Backend only
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Metrics (Recommended Tools)

- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Loki** - Log aggregation

### Example Prometheus Scrape Config

```yaml
scrape_configs:
  - job_name: 'vtol-backend'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: /actuator/prometheus  # Requires Spring Actuator
```

---

## Backup Procedures

### Enable Automatic Backups

```bash
curl -X PUT http://localhost:8080/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "backup": {
      "enabled": true,
      "intervalHours": 24,
      "retentionCount": 7,
      "directoryPath": "./backups"
    }
  }'
```

### Manual Backup

```bash
# Flatfile backup
cp data/drones.json backups/drones-$(date +%Y%m%d-%H%M%S).json
cp data/settings.json backups/settings-$(date +%Y%m%d-%H%M%S).json

# PostgreSQL backup
docker compose exec postgres pg_dump -U vtoluser vtoldb > backup.sql
```

### Restore

```bash
# Flatfile restore
cp backups/drones-20240115-120000.json data/drones.json

# PostgreSQL restore
docker compose exec -T postgres psql -U vtoluser vtoldb < backup.sql
```

---

## Scaling Considerations

### Single Node (Current Architecture)

- Flatfile storage limits to single instance
- In-memory session management
- Suitable for < 100 concurrent drones

### Multi-Node (Future)

For scaling beyond single node:

1. **Switch to PostgreSQL** for shared storage
2. **Add Redis** for session management
3. **Use sticky sessions** or session replication for WebSocket
4. **Load balancer** with WebSocket support

### Resource Requirements

| Scale | RAM | CPU | Storage |
|-------|-----|-----|---------|
| Small (< 20 drones) | 1 GB | 1 core | 1 GB |
| Medium (< 100 drones) | 2 GB | 2 cores | 5 GB |
| Large (< 500 drones) | 4 GB | 4 cores | 20 GB |

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs backend

# Check resource usage
docker stats

# Rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

### WebSocket Connection Issues

1. Check nginx WebSocket config (Upgrade headers)
2. Verify timeouts are sufficient
3. Check firewall rules for WebSocket ports
4. Ensure SSL is correctly configured for WSS

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U vtoluser -d vtoldb -c "SELECT 1"
```

### High Memory Usage

- Reduce log level to WARN
- Check for memory leaks in telemetry processing
- Consider increasing JVM heap: `-Xmx1g`

---

## Security Hardening

### Production Checklist

- [ ] Use HTTPS/WSS
- [ ] Set strong database passwords
- [ ] Enable worker authentication
- [ ] Restrict network access (firewall)
- [ ] Regular security updates
- [ ] Audit logging enabled
- [ ] Backup encryption

### Firewall Rules

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Block direct backend access (use nginx)
ufw deny 8080/tcp
ufw deny 3000/tcp

# Enable firewall
ufw enable
```

---

## Upgrade Procedures

### Standard Upgrade

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d

# Verify
docker compose logs -f
```

### Zero-Downtime Upgrade

For production environments:

```bash
# Build new images
docker compose build

# Rolling restart (requires replicas)
docker compose up -d --no-deps --scale backend=2 backend
# Wait for health checks
docker compose up -d --no-deps --scale backend=1 backend
```
