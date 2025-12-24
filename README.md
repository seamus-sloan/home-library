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

1. **Backend Setup**
   ```bash
   cd backend
   
   # Running will create a SQLite database for you... or you can use sqlx commands
   export DATABASE_URL="sqlite:library.db"

   # Install dependencies and run migrations
   cargo build
   
   # Start the backend server (runs on port 3000)
   cargo run
   ```

2. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start the development server (runs on port 5173)
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

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

## 💾 Backup Configuration

The application automatically creates daily backups at 12PM UTC via a cron job running inside the backend container.

### Local Backups (Default)

By default, backups are stored in `./data/backups/` on the host system. The backup system:
- Creates timestamped backups (format: `backup-YYYYMMDD-HHMMSS.db`)
- Retains the 7 most recent backups
- Automatically deletes older backups to save space

### NAS/Remote Backups (Optional)

To enable automatic backups to remote storage (NAS, network drive, cloud mount, etc.):

1. **Mount your NAS on the host system**
   ```bash
   # Example for NFS mount
   sudo mount -t nfs 192.168.1.3:/volume1/shared /mnt/nas

   # Or for CIFS/SMB mount
   sudo mount -t cifs //192.168.1.3/shared /mnt/nas -o credentials=/root/.credentials/nas-credentials
   ```

2. **Update `docker-compose.yml`**

   Uncomment and adjust the NAS volume mount:
   ```yaml
   volumes:
     - ./data:/app/data
     - /mnt/nas/path/to/backups:/app/backups-nas  # Uncomment and adjust path
   ```

3. **Enable NAS backups via environment variable**

   Uncomment the environment variable:
   ```yaml
   environment:
     - NAS_BACKUP_DIR=/app/backups-nas  # Uncomment this line
   ```

4. **Restart the containers**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Important Notes

- **Do NOT mount the NAS directly to `/app/data` or `/app/data/backups`** - SQLite requires local filesystem access for reliable operations. Network filesystems will cause "database is locked" errors.
- **NAS backups are non-critical** - If the NAS copy fails, the local backup will still succeed and the application will continue running.
- **Backup retention** - Only local backups are cleaned up automatically. You may want to implement your own retention policy for NAS backups.

### Manual Backup Testing

To manually trigger a backup:
```bash
docker exec home-library-backend /app/backup.sh
```

Check backup logs:
```bash
docker exec home-library-backend tail -f /var/log/backup.log
```

List current backups:
```bash
# Local backups
ls -lh ./data/backups/

# NAS backups (if configured)
ls -lh /mnt/nas/path/to/backups/
```

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
- **Coverage**: End-to-end coverage
- **Run tests**: `npm run e2e` (TODO...)

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
