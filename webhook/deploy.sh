#!/bin/bash
set -e

timestamp() {
  date "+%Y-%m-%d %H:%M:%S %Z"
}

log() {
  echo "[$(timestamp)] $*"
}

log "Deployment webhook received"

# Navigate to repo directory (default to current working dir from the webhook)
REPO_DIR="${REPO_DIR:-$PWD}"
if [ ! -f "$REPO_DIR/docker-compose.yaml" ]; then
  echo "[ERROR] docker-compose.yaml not found in $REPO_DIR. Set REPO_DIR to the repo root."
  exit 1
fi
cd "$REPO_DIR"

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
