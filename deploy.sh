#!/bin/bash

# ==============================================
# SINERGIA PRODUCTION DEPLOYMENT SCRIPT
# ==============================================
# This script deploys the Sinergia application to production
# Run this script on your production server

set -e  # Exit on any error

echo "🚀 Starting Sinergia Production Deployment..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please create it from .env.example"
    exit 1
fi

# Check if Server/.env file exists
if [ ! -f "Server/.env" ]; then
    print_error "Server/.env file not found. Please create it from Server/.env.example"
    exit 1
fi

# Check if Client/.env file exists
if [ ! -f "Client/.env" ]; then
    print_error "Client/.env file not found. Please create it from Client/.env.example"
    exit 1
fi

print_status "Environment files found ✓"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Remove old images to force rebuild
print_status "Cleaning up old images..."
docker system prune -f || true

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Test API health
print_status "Testing API health..."
sleep 10

# Try to access the health endpoint
if curl -f -s https://api.dcodelabs.studio/health > /dev/null; then
    print_success "API is responding ✓"
else
    print_warning "API health check failed, checking logs..."
    docker-compose -f docker-compose.prod.yml logs api | tail -20
fi

# Test frontend
print_status "Testing frontend..."
if curl -f -s https://dcodelabs.studio > /dev/null; then
    print_success "Frontend is responding ✓"
else
    print_warning "Frontend health check failed, checking logs..."
    docker-compose -f docker-compose.prod.yml logs client | tail -20
fi

print_success "🎉 Deployment completed!"
print_status "Services are running at:"
print_status "  Frontend: https://dcodelabs.studio"
print_status "  API: https://api.dcodelabs.studio"
print_status ""
print_status "To monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "To check status: docker-compose -f docker-compose.prod.yml ps"
