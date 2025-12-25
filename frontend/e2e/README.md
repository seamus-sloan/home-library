# E2E Testing Setup

This directory contains end-to-end tests using Playwright.

## Database Seeding

The E2E tests use a separate SQLite database (`backend/data/library-e2e.db`) that is automatically reset before each test run with consistent seed data.

### How It Works

1. **Global Setup**: The Playwright configuration includes a `globalSetup` script that runs before all tests
2. **Database Reset**: The setup script runs `cargo run --bin reset-e2e-db` which:
   - Removes the existing E2E database
   - Applies all migrations using sqlx to create a fresh schema
   - Seeds the database with test data from `backend/e2e-seed.sql`

### Test Data

The seed data includes:

**Users:**
- Test (ID: 1, Color: #3B82F6)
- Alice (ID: 2, Color: #EF4444)
- Bob (ID: 3, Color: #10B981)

**Genres:**
- Science Fiction, Fantasy, Mystery, Non-Fiction, Biography

**Tags:**
- Favorite, To Reread, Classic, Award Winner

**Books:**
- Dune (Science Fiction, by Test user)
- The Hobbit (Fantasy, by Test user)
- Murder on the Orient Express (Mystery, by Test user)
- Sapiens (Non-Fiction, by Test user, currently reading)
- Foundation (Science Fiction, by Test user)
- Pride and Prejudice (by Alice user)

**Additional data:**
- Ratings for some books
- Reading statuses (Read, Reading, Unread)
- Journal entries
- Lists with books

### Running Tests with E2E Database

To run the backend with the E2E database for manual testing, edit `.env` in the project root or set the environment variable:

```bash
cd backend
DATABASE_FILE=data/library-e2e.db cargo run
```

Or edit `.env` (in project root) and change:
```
DATABASE_FILE=backend/data/library-e2e.db
```

### Manually Resetting the Database

If you need to manually reset the E2E database:

```bash
cd backend
cargo run --bin reset-e2e-db
```

### Modifying Seed Data

To modify the test data:

1. Edit `backend/e2e-seed.sql`
2. The changes will be automatically applied on the next test run
3. Or manually reset using the command above

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in headed mode
npm run test:e2e:headed
```

## Requirements

- Rust/Cargo (for running the reset binary)
- `sqlite3` command-line tool (for seeding test data)
- Backend migrations must be present in `backend/migrations/`
