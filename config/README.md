# Configuration

## Storage Backends

### Flatfile (Default)
JSON-based local storage. Data persists in `./data/drones.json`

### PostgreSQL
To enable PostgreSQL storage:
1. Start with profile: `docker compose --profile postgres up`
2. Update backend `application.yml`: set `storage.type: postgresql`
3. Configure connection settings in environment variables

## Environment Variables
Copy `.env.template` to `.env` and adjust values as needed.
