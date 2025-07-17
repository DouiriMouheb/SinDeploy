#!/bin/bash

# ==============================================
# CLEANUP SCRIPT FOR CORRUPTED DEPLOYMENT
# ==============================================
# This script completely cleans up the corrupted deployment
# Run this BEFORE pulling the new fixed version

set -e  # Exit on any error

echo "🧹 Starting cleanup of corrupted deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop all containers
print_status "Stopping all containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true
docker-compose -f docker-compose.yml down --remove-orphans || true
docker-compose -f docker-compose.dev.yml down --remove-orphans || true

# Remove all sin-app related containers
print_status "Removing all sin-app containers..."
docker ps -a --filter "name=sin-app" -q | xargs -r docker rm -f || true

# Remove all sin-app related images
print_status "Removing all sin-app images..."
docker images --filter "reference=sin-app*" -q | xargs -r docker rmi -f || true

# Remove dangling images
print_status "Removing dangling images..."
docker image prune -f || true

# Remove unused volumes (CAREFUL: This will remove database data)
print_warning "This will remove ALL Docker volumes including database data!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing unused volumes..."
    docker volume prune -f || true
else
    print_status "Skipping volume cleanup"
fi

# Remove unused networks
print_status "Removing unused networks..."
docker network prune -f || true

# Clean up Docker system
print_status "Cleaning up Docker system..."
docker system prune -f || true

# Remove node_modules to force fresh install
print_status "Removing node_modules directories..."
rm -rf Server/node_modules || true
rm -rf Client/node_modules || true

# Remove build artifacts
print_status "Removing build artifacts..."
rm -rf Client/dist || true
rm -rf Client/build || true

print_success "🎉 Cleanup completed!"
print_status "You can now pull the latest code and run the deployment script."
print_status ""
print_status "Next steps:"
print_status "1. git pull origin main"
print_status "2. chmod +x deploy.sh"
print_status "3. ./deploy.sh"
