# Development Guide

Setup guide for local development and contributing to VTOL-DB.

## Prerequisites

### Required
- **Java 21** (OpenJDK or Eclipse Temurin)
- **Node.js 20+** and npm
- **Maven 3.9+**
- **Docker** (recommended)
- **Git**

### Recommended
- **IDE**: IntelliJ IDEA or VS Code
- **REST Client**: Postman or curl
- **WebSocket Client**: websocat or browser DevTools

---

## Quick Start (Docker)

Fastest way to get a development environment:

```bash
# Clone
git clone https://github.com/DevSkoll/drone_fleet_manager.git
cd drone_fleet_manager

# Start with hot reload
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

**Access**:
- Frontend: http://localhost:3000 (hot reload enabled)
- Backend: http://localhost:8080
- API: http://localhost:8080/api/drones

---

## Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Install dependencies
./mvnw dependency:resolve

# Run with hot reload
./mvnw spring-boot:run

# Or build and run
./mvnw clean package -DskipTests
java -jar target/vtol-db-backend-0.1.0.jar
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
VTOL-DB/
├── backend/                    # Spring Boot application
│   ├── src/main/java/         # Java source code
│   ├── src/main/resources/    # Configuration
│   ├── src/test/              # Tests
│   ├── pom.xml                # Maven dependencies
│   └── Dockerfile             # Production Dockerfile
├── frontend/                   # React application
│   ├── src/                   # React source code
│   ├── public/                # Static assets
│   ├── package.json           # npm dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── Dockerfile             # Production Dockerfile
│   └── Dockerfile.dev         # Development Dockerfile
├── data/                       # Data storage (gitignored)
├── docs/                       # Documentation
├── docker-compose.yml          # Production compose
└── docker-compose.dev.yml      # Development compose
```

---

## Development Workflow

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Backend changes auto-reload with Spring DevTools
   - Frontend changes hot-reload with Vite

3. **Test changes**
   ```bash
   # Backend tests
   cd backend && ./mvnw test

   # Manual testing
   curl http://localhost:8080/api/drones
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "Add feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

---

## Backend Development

### Adding a New API Endpoint

1. **Create/update Controller**:
   ```java
   @RestController
   @RequestMapping("/api/newresource")
   public class NewResourceController {
       @GetMapping
       public ResponseEntity<List<NewResource>> getAll() {
           // Implementation
       }
   }
   ```

2. **Create Service**:
   ```java
   @Service
   public class NewResourceService {
       // Business logic
   }
   ```

3. **Create Repository** (if needed):
   ```java
   public interface NewResourceRepository {
       // Data access methods
   }
   ```

### Adding a WebSocket Message Type

1. **Add to MessageType enum**:
   ```java
   public enum MessageType {
       REGISTER, TELEMETRY, COMMAND, // existing
       NEW_MESSAGE_TYPE              // new
   }
   ```

2. **Create payload class**:
   ```java
   public class NewMessagePayload {
       private String field1;
       // getters, setters
   }
   ```

3. **Handle in FleetWebSocketHandler**:
   ```java
   case NEW_MESSAGE_TYPE:
       handleNewMessage(message, session);
       break;
   ```

---

## Frontend Development

### Adding a New Page

1. **Create feature directory**:
   ```
   frontend/src/features/newfeature/
   ├── NewFeatureView.jsx
   └── NewFeatureView.css
   ```

2. **Create component**:
   ```jsx
   function NewFeatureView() {
     return (
       <div className="new-feature-view">
         <h1>New Feature</h1>
       </div>
     );
   }
   export default NewFeatureView;
   ```

3. **Add route in App.jsx**:
   ```jsx
   import NewFeatureView from './features/newfeature/NewFeatureView';

   // In Routes
   <Route path="/newfeature" element={<NewFeatureView />} />

   // In navigation
   <NavLink to="/newfeature">New Feature</NavLink>
   ```

### Adding API Calls

Add to `frontend/src/services/api.js`:
```javascript
export const newResourceAPI = {
  getAll: () => apiClient.get('/newresource'),
  getById: (id) => apiClient.get(`/newresource/${id}`),
  create: (data) => apiClient.post('/newresource', data),
};
```

---

## Code Style Guidelines

### Java (Backend)

- Use constructor injection (no `@Autowired` on fields)
- Follow Spring Boot conventions
- Use meaningful variable names
- Add JavaDoc for public methods
- Keep controllers thin, logic in services

### JavaScript/React (Frontend)

- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful component and variable names
- Keep components focused and small
- Use CSS modules or feature-scoped CSS

### General

- Commit messages: Start with verb (Add, Fix, Update, Remove)
- One feature per commit
- Write tests for new functionality
- Update documentation when adding features

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=DroneServiceTest

# Run with coverage
./mvnw test jacoco:report
```

### Manual API Testing

```bash
# List drones
curl http://localhost:8080/api/drones

# Create drone
curl -X POST http://localhost:8080/api/drones \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Drone","serialNumber":"TEST-001"}'

# Test WebSocket
websocat ws://localhost:8080/ws/fleet
```

---

## Debugging

### Backend Debugging

**IntelliJ IDEA**:
1. Run > Edit Configurations
2. Add new Spring Boot configuration
3. Set main class: `com.vtoldb.VtolDbApplication`
4. Run in Debug mode

**VS Code**:
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "java",
      "name": "Debug Backend",
      "request": "launch",
      "mainClass": "com.vtoldb.VtolDbApplication"
    }
  ]
}
```

### Frontend Debugging

- Use browser DevTools (F12)
- React DevTools extension
- Network tab for API calls
- Console for WebSocket messages

### Useful Commands

```bash
# View backend logs
docker compose -f docker-compose.dev.yml logs -f backend

# View frontend logs
docker compose -f docker-compose.dev.yml logs -f frontend

# Restart specific service
docker compose -f docker-compose.dev.yml restart backend

# Rebuild after dependency changes
docker compose -f docker-compose.dev.yml up -d --build
```

---

## Common Tasks

### Reset Data

```bash
# Stop services
docker compose -f docker-compose.dev.yml down

# Remove data
rm -rf data/

# Restart
docker compose -f docker-compose.dev.yml up -d
```

### Update Dependencies

**Backend**:
```bash
cd backend
./mvnw versions:display-dependency-updates
```

**Frontend**:
```bash
cd frontend
npm outdated
npm update
```

### Generate Test Data

```bash
# Create multiple drones
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/drones \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Drone-$i\",\"serialNumber\":\"SN-00$i\"}"
done
```

---

## IDE Setup

### IntelliJ IDEA

1. Open project root as Maven project
2. Import frontend as module
3. Enable annotation processing
4. Install plugins: Lombok, Spring Boot

### VS Code

**Recommended Extensions**:
- Extension Pack for Java
- Spring Boot Extension Pack
- ES7+ React/Redux Snippets
- Prettier - Code formatter
- GitLens

**settings.json**:
```json
{
  "java.configuration.updateBuildConfiguration": "automatic",
  "editor.formatOnSave": true
}
```

---

## Contribution Guidelines

1. Fork the repository
2. Create feature branch from `main`
3. Make changes with tests
4. Update documentation if needed
5. Submit pull request with description
6. Address review feedback

### PR Checklist

- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console errors in browser
- [ ] Commit messages are descriptive
