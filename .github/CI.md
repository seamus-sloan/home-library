# Continuous Integration

This project uses GitHub Actions for CI/CD.

## Workflows

### 1. PR Checks (`pr-checks.yml`)
Runs on every pull request to ensure code quality:

**Backend:**
- ✅ Formatting check (`cargo fmt`)
- ✅ Linting (`cargo clippy`)
- ✅ Unit tests (`cargo test`)

**Frontend:**
- ✅ Formatting check (`npm run format:check`)
- ✅ Linting (`npm run lint`)
- ✅ Unit tests (`npm run test:run`)

**Build:**
- ✅ Backend release build
- ✅ Frontend production build

### 2. Playwright E2E Tests (`playwright.yml`)
Runs on pushes to main/master and on pull requests:

**Steps:**
1. Set up Rust toolchain
2. Set up Node.js
3. Build backend (release mode)
4. Reset E2E database with seed data
5. Start backend server
6. Build frontend
7. Start frontend preview server
8. Install Playwright browsers
9. Run E2E tests across Chromium, Firefox, and WebKit
10. Upload test results and reports

**Artifacts:**
- Playwright HTML report (30 day retention)
- Test results (7 day retention)

## Branch Protection

To require these checks before merging PRs:

1. Go to repository **Settings** → **Branches**
2. Click **Add rule** or edit existing rule for `main`/`master`
3. Enable:
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
4. Select required status checks:
   - `Backend Lint & Format`
   - `Backend Tests`
   - `Frontend Lint & Format`
   - `Frontend Tests`
   - `Build Check`
   - `test` (Playwright E2E Tests)
5. Save changes

## Running Checks Locally

**Backend:**
```bash
cd backend

# Format check
cargo fmt --all -- --check

# Linting
cargo clippy -- -D warnings

# Tests
cargo test

# Build
cargo build --release
```

**Frontend:**
```bash
cd frontend

# Format check
npm run format:check

# Linting
npm run lint

# Tests
npm run test:run

# Build
npm run build
```

**E2E Tests:**
```bash
cd frontend
npm run test:e2e
```

## Caching

Both workflows use caching to speed up builds:
- **Rust**: Caches `~/.cargo` and `backend/target/`
- **Node**: Caches npm packages based on `package-lock.json`

## Database in CI

E2E tests use a separate SQLite database (`backend/data/library-e2e.db`) that is:
1. Reset before each test run
2. Seeded with consistent test data from `backend/e2e-seed.sql`
3. Isolated from development databases

The global setup is skipped in CI (controlled by `process.env.CI`) and database reset is handled explicitly in the workflow.

## Troubleshooting

**Tests failing in CI but passing locally?**
- Check if you're using the E2E database locally
- Ensure your `.env` matches CI configuration
- Run tests with `CI=true npm run test:e2e` to simulate CI environment

**Build timeout?**
- Check Rust cache is working
- Backend builds are cached between runs
- Consider reducing the number of Playwright browsers tested

**Flaky E2E tests?**
- Review retry configuration in `playwright.config.ts`
- CI uses `workers: 1` to avoid race conditions
- Check server startup health checks are adequate
