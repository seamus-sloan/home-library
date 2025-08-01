# Multi-stage build for Rust backend
FROM rust:1.88 AS builder

WORKDIR /app

# Install SQLx CLI first
RUN cargo install sqlx-cli --no-default-features --features sqlite

# Copy manifests first for better layer caching
COPY Cargo.toml Cargo.lock ./

# Create src directory and a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release
RUN rm src/main.rs

# Now copy the actual source code
COPY src ./src
COPY migrations ./migrations

# Set DATABASE_URL for SQLx compile-time checks
ENV DATABASE_URL=sqlite:///tmp/build.db

# Create a temporary database and run migrations for build-time validation
RUN touch /tmp/build.db
RUN sqlx migrate run --database-url sqlite:///tmp/build.db

# Build for release (only recompiles your code, not dependencies)
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install necessary runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    sqlite3 \
    cron \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/target/release/backend /app/backend

# Copy migrations directory for runtime
COPY --from=builder /app/migrations /app/migrations

# Copy backup script and entrypoint
COPY backup.sh /app/backup.sh
COPY entrypoint.sh /app/entrypoint.sh

# Make scripts executable
RUN chmod +x /app/backup.sh /app/entrypoint.sh

# Create directory for SQLite database and backups
RUN mkdir -p /app/data/backups

# Set environment variables
ENV DATABASE_FILE=/app/data/library.db
ENV RUST_LOG=backend=info,sqlx=info

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use entrypoint to start both cron and the application
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["./backend"]
