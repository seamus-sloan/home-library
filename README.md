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

A much simpler approach using Docker:

1. **Transfer project to Pi**
   ```bash
   # Clone or transfer your project
   scp -r /path/to/home-library pi@your-pi-ip:/home/pi/
   ```

2. **Setup on Pi**
   ```bash
   ssh pi@your-pi-ip
   cd /home/pi/home-library
   
   # Make sure Docker is installed and running
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo systemctl enable docker
   sudo usermod -aG docker pi
   # Log out and back in for group changes to take effect
   ```

3. **Deploy with Docker Compose**
   ```bash
   # Build and run the application
   docker-compose up -d --build
   
   # Check status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

4. **Access your application**
   - Frontend: http://your-pi-ip (port 80)
   - Backend API: http://your-pi-ip:3000

5. **Useful management commands**
   ```bash
   # Stop the application
   docker-compose down
   
   # Update and restart
   git pull  # if using git
   docker-compose up -d --build
   
   # Backup your database
   cp data/library.db data/backups/backup-$(date +%Y%m%d-%H%M%S).db
   ```

**Benefits of Docker deployment:**
- Cross-platform compatibility (works on ARM64/ARM32)
- Easier updates and rollbacks
- Isolated environment
- Automatic container restarts
- No need to manage system dependencies

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
