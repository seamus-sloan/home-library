#!/bin/bash
set -e

echo "[Tue Dec 23 23:01:36 EST 2025] Deployment webhook received"

# Navigate to repo directory
cd /repo

# Pull latest changes
echo "[Tue Dec 23 23:01:36 EST 2025] Pulling latest changes from main..."
git pull origin main

# Rebuild and restart containers
echo "[Tue Dec 23 23:01:36 EST 2025] Rebuilding and restarting containers..."
docker compose up -d --build

# Show container status
echo "[Tue Dec 23 23:01:36 EST 2025] Container status:"
docker compose ps

echo "[Tue Dec 23 23:01:36 EST 2025] Deployment complete!"
