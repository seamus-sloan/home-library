# 📚 Home Library

A personal library management system built with Rust and React, designed for book nerds who want to organize their collection, journal/blog about their books, and rate or tag their books.

## 🎯 Purpose

Home Library helps you:
- **Catalog your books** with titles, authors, cover images, and ratings
- **Organize with tags and genres** for easy discovery
- **Track your reading journey** with personal journal entries
- **Search and filter** your collection efficiently
- **Multi-user support** for family libraries

## 🏗️ Architecture

- **Backend**: Rust | Axum
- **Frontend**: React | Typescript
- **Database**: SQLite

## 🚀 Getting Started

### Local Development

1. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env to configure your setup (all paths relative to backend/ directory)
   # DATABASE_FILE=data/development.db (default)
   ```

2. **Backend Setup**
   ```bash
   cd backend

   # Build and start the backend server (runs on port 3000)
   # The server will automatically:
   # - Load config from ../.env
   # - Create the database if it doesn't exist
   # - Run all migrations
   cargo run
   ```

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Start the development server (runs on port 5173)
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Database Configuration

All databases are stored in `backend/data/`:
- `development.db` - Development database (default)
- `library-e2e.db` - E2E test database
- `production.db` - Production database

**Switch databases** by editing `.env`:
```bash
DATABASE_FILE=data/library-e2e.db
```

Or override temporarily:
```bash
cd backend
DATABASE_FILE=data/library-e2e.db cargo run
```

### Docker Development

If you prefer using Docker for development:

1. **Start with Docker Compose**
   ```bash
   # Build and run both frontend and backend
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost (port 80)
   - Backend API: http://localhost:3000

3. **Useful Docker commands**
   ```bash
   # Stop all services
   docker-compose down
   
   # Rebuild and restart
   docker-compose up
   
   # View logs
   docker-compose logs -f
   
   # Clean up (removes containers, networks, and images)
   docker-compose down --rmi all --volumes
   ```

**Note**: The Docker setup persists your SQLite database in the `./data` directory, so your data will survive container restarts.

## 💾 Backups

Daily backups run automatically at 12PM UTC. By default, backups are stored in `./data/backups/` (retains 7 most recent).

### NAS Backups

To store backups on a NAS, update `docker-compose.yml`:
```yaml
volumes:
  - /mnt/nas/path/to/backups:/app/backups
environment:
  - BACKUP_DIR=/app/backups
```

Manual backup: `docker exec home-library-backend /app/backup.sh`

## 🥧 Deploying to Raspberry Pi

### Option 1: Manual Deployment

1. **Build the application**
   ```bash
   # Build frontend
   cd frontend
   npm run build
   
   # Build backend for ARM64 (if cross-compiling)
   cd ../backend
   cargo build --release --target aarch64-unknown-linux-gnu
   ```

2. **Transfer to Pi**
   ```bash
   scp -r frontend/dist pi@your-pi-ip:/home/pi/home-library/
   scp backend/target/release/backend pi@your-pi-ip:/home/pi/home-library/
   scp backend/library.db pi@your-pi-ip:/home/pi/home-library/
   ```

3. **Setup on Pi**
   ```bash
   ssh pi@your-pi-ip
   cd /home/pi/home-library
   
   # Make backend executable
   chmod +x backend
   
   # Create systemd service (optional)
   sudo nano /etc/systemd/system/home-library.service
   ```

### Option 2: Docker Deployment on Pi

A much simpler approach using Docker (build locally, deploy to Pi):

1. **Build images locally for ARM64**
   ```bash
   # Build images (will automatically build for your current architecture)
   docker build -t home-library-backend:latest ./backend
   docker build -t home-library-frontend:latest ./frontend
   
   # Save images to files
   docker save home-library-backend:latest | gzip > backend-arm64.tar.gz
   docker save home-library-frontend:latest | gzip > frontend-arm64.tar.gz
   ```

2. **Transfer images and compose file to Pi**
   ```bash
   scp backend-arm64.tar.gz frontend-arm64.tar.gz docker-compose-pi.yml pi@your-pi-ip:/home/pi/
   scp -r data pi@your-pi-ip:/home/pi/  # Optional: if you have existing data
   ```

3. **Setup on Pi**
   ```bash
   ssh pi@your-pi-ip
   
   # Install Docker if not already installed
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo systemctl enable docker
   sudo usermod -aG docker pi
   # Log out (exit) and SSH back in for group changes to take effect
   
   # Load the images
   gunzip -c backend-arm64.tar.gz | docker load
   gunzip -c frontend-arm64.tar.gz | docker load
   
   # Create data directory if it doesn't exist
   mkdir -p data
   ```

4. **Deploy with Docker Compose**
   ```bash
   # Start the application using the Pi-specific compose file
   docker-compose -f docker-compose-pi.yml up -d
   
   # Check status
   docker-compose -f docker-compose-pi.yml ps
   
   # View logs
   docker-compose -f docker-compose-pi.yml logs -f
   ```

4. **Access your application**
   - Frontend: http://your-pi-ip (port 80)
   - Backend API: http://your-pi-ip:3000

5. **Useful management commands**
   ```bash
   # Stop the application
   docker-compose -f docker-compose-pi.yml down
   
   # Update: rebuild images locally, transfer, and restart
   # (on your local machine)
   docker build -t home-library-backend:latest ./backend
   docker save home-library-backend:latest | gzip > backend-arm64.tar.gz
   scp backend-arm64.tar.gz pi@your-pi-ip:/home/pi/
   
   # (on the Pi)
   docker-compose -f docker-compose-pi.yml down
   gunzip -c backend-arm64.tar.gz | docker load
   docker-compose -f docker-compose-pi.yml up -d
   
   # Backup your database
   cp data/library.db data/backups/backup-$(date +%Y%m%d-%H%M%S).db
   ```

**Benefits of this Docker approach:**
- **Much faster**: No compilation on the Pi
- **Cross-platform**: Build ARM64 images on your fast x86 machine
- **Reliable**: Pre-built images reduce deployment issues
- **Efficient**: Pi only needs to run containers, not build them
- **Easy updates**: Just rebuild and transfer new images

**Alternative: Docker Registry**
For frequent updates, consider pushing to Docker Hub or a registry:
```bash
# Push to registry (one-time setup)
docker tag home-library-backend:latest yourusername/home-library-backend:latest
docker push yourusername/home-library-backend:latest

# On Pi, just pull and run
docker-compose pull && docker-compose up -d
```

## 🧪 Testing

**Frontend Testing:**
- **Framework**: Vitest with Testing Library
- **Coverage**: Component rendering, user interactions, form validation
- **Run tests**: `npm test`

**Backend Testing:**
- **Framework**: Rust's built-in testing framework
- **Coverage**: API endpoints, database operations, business logic
- **Run tests**: `cargo test`

**End-to-End Testing:**
- **Framework**: Playwright
- **Coverage**: Full user workflows across frontend and backend
- **Run tests**:
  ```bash
  cd frontend
  npm run test:e2e        # Run all E2E tests
  npm run test:e2e:ui     # Run in UI mode
  npm run test:e2e:headed # Run in headed mode
  ```
- **Database**: Tests automatically reset `backend/data/library-e2e.db` before each run with seed data

## Future Enhancements
- **SQLite optimization**: Consider enabling WAL mode for better concurrent access
- **Frontend**: The app uses RTK Query for efficient caching and data fetching
- **Images**: Book covers are stored as URLs; consider implementing local image storage for offline use
- **Mobile app**: React Native or PWA version
- **Book scanning**: Barcode scanning for easy book addition
- **Social features**: Share reviews and recommendations
- **Analytics**: Reading statistics and insights
- **Themes**: Multiple UI themes and customization options

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
