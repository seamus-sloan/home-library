# Backend

Rust/Axum backend for the Home Library application.

## Setup

1. Copy the example environment file (from project root):
   ```bash
   cd ..  # Go to project root
   cp .env.example .env
   ```

2. Run the backend:
   ```bash
   cd backend
   cargo run
   ```

The backend will automatically:
- Load configuration from `../.env` (project root)
- Create the database at `backend/data/development.db` if it doesn't exist
- Run all migrations

## Configuration

Edit `.env` in the project root to configure the backend:

```bash
# Database file path (relative to backend directory)
DATABASE_FILE=data/development.db

# Backup directory (used in production)
BACKUP_DIR=data/backups

# Logging level
RUST_LOG=backend=debug,sqlx=info
```

## Database Files

All databases are stored in `backend/data/`:
- `development.db` - Development database (default)
- `library-e2e.db` - E2E test database
- `production.db` - Production database (when deployed)

## E2E Testing

To reset the E2E test database:
```bash
DATABASE_FILE=data/library-e2e.db cargo run --bin reset-e2e-db
```

Or use the npm script from the frontend:
```bash
cd ../frontend
npm run test:e2e
```

## Running in Production

The production deployment uses environment variables set in `docker-compose.yaml` to point to the correct database location.
