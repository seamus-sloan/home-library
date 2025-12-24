#!/bin/sh
set -e

timestamp() {
  date "+%Y-%m-%d %H:%M:%S %Z"
}

log() {
  echo "[$(timestamp)] $*"
}

log "Deployment webhook received"

# Navigate to repo directory
cd /repo

# Pull latest changes
log "Pulling latest changes from main..."
git pull origin main

# Rebuild and restart containers
log "Rebuilding and restarting containers..."
docker compose up -d --build

# Show container status
log "Container status:"
docker compose ps

log "Deployment complete!"
