#!/bin/zsh

# Home Library - Raspberry Pi Deployment Script
# This script automates the deployment of Home Library to a Raspberry Pi

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ ! -f .env ]; then
    echo "${RED}Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and fill in your values."
    exit 1
fi

# Source the .env file
export $(grep -v '^#' .env | xargs)

# Validate required variables
if [ -z "$PI_HOSTNAME" ] || [ -z "$PI_USERNAME" ] || [ -z "$PI_DEPLOY_PATH" ]; then
    echo "${RED}Error: Required environment variables not set!${NC}"
    echo "Please check your .env file."
    exit 1
fi

# Function to print section headers
print_header() {
    echo "\n${BLUE}========================================${NC}"
    echo "${BLUE}$1${NC}"
    echo "${BLUE}========================================${NC}\n"
}

# Function to print success messages
print_success() {
    echo "${GREEN}✓ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo "${YELLOW}⚠ $1${NC}"
}

# Function to print error messages
print_error() {
    echo "${RED}✗ $1${NC}"
}

# Function to execute SSH commands on the Pi
ssh_exec() {
    if [ -n "$PI_PASSWORD" ]; then
        sshpass -p "$PI_PASSWORD" ssh -o StrictHostKeyChecking=no "$PI_USERNAME@$PI_HOSTNAME" "$1"
    else
        ssh -o StrictHostKeyChecking=no "$PI_USERNAME@$PI_HOSTNAME" "$1"
    fi
}

# Function to execute SCP commands to the Pi
scp_exec() {
    if [ -n "$PI_PASSWORD" ]; then
        sshpass -p "$PI_PASSWORD" scp -o StrictHostKeyChecking=no "$1" "$PI_USERNAME@$PI_HOSTNAME:$2"
    else
        scp -o StrictHostKeyChecking=no "$1" "$PI_USERNAME@$PI_HOSTNAME:$2"
    fi
}

# Check if sshpass is installed (for password-based auth)
if [ -n "$PI_PASSWORD" ]; then
    if ! command -v sshpass &> /dev/null; then
        print_warning "sshpass not found. Install it with: brew install hudochenkov/sshpass/sshpass"
        print_warning "Or remove PI_PASSWORD from .env to use SSH key authentication."
        exit 1
    fi
fi

print_header "Starting Home Library Deployment to Raspberry Pi"

# Step 1: Build Docker images locally
print_header "Step 1: Building Docker images"
echo "Building backend image..."
docker build -t ${BACKEND_IMAGE:-home-library-backend:latest} ./backend
print_success "Backend image built"

echo "Building frontend image..."
docker build -t ${FRONTEND_IMAGE:-home-library-frontend:latest} ./frontend
print_success "Frontend image built"

# Step 2: Save images to tar.gz files
print_header "Step 2: Saving images to tar.gz files"
echo "Saving backend image..."
docker save ${BACKEND_IMAGE:-home-library-backend:latest} | gzip > backend-arm64.tar.gz
print_success "Backend image saved to backend-arm64.tar.gz"

echo "Saving frontend image..."
docker save ${FRONTEND_IMAGE:-home-library-frontend:latest} | gzip > frontend-arm64.tar.gz
print_success "Frontend image saved to frontend-arm64.tar.gz"

# Step 3: Delete old -OLD.tar.gz files on the Pi
print_header "Step 3: Cleaning up old backup files on Pi"
echo "Deleting old backup files..."
ssh_exec "cd $PI_DEPLOY_PATH && rm -f backend-arm64-OLD.tar.gz frontend-arm64-OLD.tar.gz" || print_warning "No old backup files to delete"
print_success "Old backup files cleaned up"

# Step 4: Rename existing images on the Pi to -OLD
print_header "Step 4: Backing up existing images on Pi"
echo "Renaming existing images..."
ssh_exec "cd $PI_DEPLOY_PATH && [ -f backend-arm64.tar.gz ] && mv backend-arm64.tar.gz backend-arm64-OLD.tar.gz || true"
ssh_exec "cd $PI_DEPLOY_PATH && [ -f frontend-arm64.tar.gz ] && mv frontend-arm64.tar.gz frontend-arm64-OLD.tar.gz || true"
print_success "Existing images backed up"

# Step 5: Upload new images to the Pi
print_header "Step 5: Uploading new images to Pi"
echo "Uploading backend image..."
scp_exec backend-arm64.tar.gz "$PI_DEPLOY_PATH/"
print_success "Backend image uploaded"

echo "Uploading frontend image..."
scp_exec frontend-arm64.tar.gz "$PI_DEPLOY_PATH/"
print_success "Frontend image uploaded"

# Step 6: Load and run images on the Pi
print_header "Step 6: Deploying on Pi"

echo "Stopping existing containers..."
ssh_exec "cd $PI_DEPLOY_PATH && docker-compose -f docker-compose-pi.yml down" || print_warning "No containers to stop"
print_success "Existing containers stopped"

echo "Loading backend image..."
ssh_exec "cd $PI_DEPLOY_PATH && gunzip -c backend-arm64.tar.gz | docker load"
print_success "Backend image loaded"

echo "Loading frontend image..."
ssh_exec "cd $PI_DEPLOY_PATH && gunzip -c frontend-arm64.tar.gz | docker load"
print_success "Frontend image loaded"

echo "Starting containers..."
ssh_exec "cd $PI_DEPLOY_PATH && docker-compose -f docker-compose-pi.yml up -d"
print_success "Containers started"

# Step 7: Clean up local tar.gz files
print_header "Step 7: Cleaning up local files"
echo "Removing local tar.gz files..."
rm -f backend-arm64.tar.gz frontend-arm64.tar.gz
print_success "Local tar.gz files removed"

# Final status check
print_header "Deployment Complete!"
echo "Checking container status on Pi..."
ssh_exec "cd $PI_DEPLOY_PATH && docker-compose -f docker-compose-pi.yml ps"

echo "\n${GREEN}========================================${NC}"
echo "${GREEN}Deployment successful!${NC}"
echo "${GREEN}========================================${NC}"
echo "Frontend: http://${PI_HOSTNAME}"
echo "Backend API: http://${PI_HOSTNAME}:3000"
echo "\nView logs with:"
echo "  ssh $PI_USERNAME@$PI_HOSTNAME 'cd $PI_DEPLOY_PATH && docker-compose -f docker-compose-pi.yml logs -f'"
