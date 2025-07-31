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
   export DATABASE_URL="sqlite:development.db"

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
   scp backend/development.db pi@your-pi-ip:/home/pi/home-library/
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

### Option 2: Docker Deployment

1. **Create Dockerfile** (in project root)
   ```dockerfile
   # Multi-stage build for Rust backend
   FROM rust:1.70 as backend-builder
   WORKDIR /app/backend
   COPY backend/ .
   RUN cargo build --release
   
   # Build frontend
   FROM node:18 as frontend-builder
   WORKDIR /app/frontend
   COPY frontend/package*.json ./
   RUN npm ci
   COPY frontend/ .
   RUN npm run build
   
   # Final runtime image
   FROM debian:bullseye-slim
   RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
   WORKDIR /app
   
   # Copy built applications
   COPY --from=backend-builder /app/backend/target/release/backend .
   COPY --from=frontend-builder /app/frontend/dist ./static
   COPY backend/development.db .
   
   EXPOSE 3000
   CMD ["./backend"]
   ```

2. **Deploy with Docker**
   ```bash
   # Build and run
   docker build -t home-library .
   docker run -d -p 3000:3000 -v $(pwd)/data:/app/data home-library
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
