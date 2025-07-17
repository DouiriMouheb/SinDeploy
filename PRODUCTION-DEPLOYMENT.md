# 🚀 Production Deployment Guide - Sinergia Time Tracker

This guide provides step-by-step instructions for deploying the Sinergia Time Tracker application to production on a VPS/Droplet.

## 📋 Prerequisites

- Ubuntu 20.04+ VPS/Droplet with at least 2GB RAM
- Domain name pointed to your server IP
- SSH access to your server
- Docker and Docker Compose installed

## 🔧 Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply Docker group changes
exit
```

### 2. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. Domain DNS Configuration

Point your domain to your server IP:
```
A    @              YOUR_SERVER_IP
A    www            YOUR_SERVER_IP
A    api            YOUR_SERVER_IP
```

## 📁 Project Deployment

### 1. Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/YOUR_USERNAME/SinDeploy.git
cd SinDeploy

# Or if updating existing deployment
cd SinDeploy
git pull origin main
```

### 2. Environment Configuration

#### Root Environment File (`.env`)
```bash
# Create root environment file
cp .env.example .env
nano .env
```

**Required settings:**
```env
# Domain Configuration
DOMAIN_NAME=yourdomain.com

# Database Configuration
DB_NAME=sindb
DB_USER=sinuser
DB_PASSWORD=your_secure_database_password_here
```

#### Server Environment File (`Server/.env`)
```bash
# Create server environment file
cp Server/.env.example Server/.env
nano Server/.env
```

**Required settings:**
```env
# Environment
NODE_ENV=production

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=sindb
DB_USER=sinuser
DB_PASSWORD=your_secure_database_password_here

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_at_least_32_characters_long

# Domain Configuration
DOMAIN_NAME=yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=30

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Generate secure JWT secrets:**
```bash
# Generate JWT secrets
openssl rand -base64 32
openssl rand -base64 32
```

#### Client Environment File (`Client/.env`)
```bash
# Create client environment file
cp Client/.env.example Client/.env
nano Client/.env
```

**Required settings:**
```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com/api

# App Configuration
VITE_APP_NAME=Sinergia Company Portal
VITE_APP_VERSION=1.0.0

# Production Settings
VITE_DEV_MODE=false
VITE_ENABLE_MOCK_API=false

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### 3. Caddy Configuration

Update the Caddy configuration file:
```bash
nano caddy/Caddyfile.prod
```

**Replace `dcodelabs.studio` with your domain:**
```caddyfile
# Main domain - serves React app
yourdomain.com {
    # ... rest of configuration
}

# WWW redirect
www.yourdomain.com {
    redir https://yourdomain.com{uri} permanent
}

# API subdomain - serves backend API
api.yourdomain.com {
    # ... rest of configuration
}
```

## 🚀 Deployment Commands

### 1. Initial Deployment

```bash
# Navigate to project directory
cd ~/SinDeploy

# Stop any existing containers
docker compose -f docker-compose.prod.yml down --remove-orphans

# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Check container status
docker compose -f docker-compose.prod.yml ps
```

### 2. View Logs

```bash
# View all logs
docker compose -f docker-compose.prod.yml logs

# View specific service logs
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs client
docker compose -f docker-compose.prod.yml logs caddy
docker compose -f docker-compose.prod.yml logs db

# Follow logs in real-time
docker compose -f docker-compose.prod.yml logs -f
```

### 3. Health Checks

```bash
# Test API health
curl -f https://api.yourdomain.com/health

# Test frontend
curl -f https://yourdomain.com

# Check SSL certificates
curl -I https://yourdomain.com
```

## 🔄 Updates and Maintenance

### 1. Updating the Application

```bash
# Navigate to project directory
cd ~/SinDeploy

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker compose -f docker-compose.prod.yml up -d --build

# Clean up unused images
docker image prune -f
```

### 2. Database Backup

```bash
# Create database backup
docker exec sin-app-prod-db-1 pg_dump -U sinuser sindb > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database backup
docker exec -i sin-app-prod-db-1 psql -U sinuser sindb < backup_file.sql
```

### 3. Clean Deployment (Fresh Start)

```bash
# Stop and remove all containers
docker compose -f docker-compose.prod.yml down --remove-orphans --rmi all

# Remove volumes (WARNING: This will delete all data)
docker compose -f docker-compose.prod.yml down -v

# Fresh deployment
docker compose -f docker-compose.prod.yml up -d --build
```

## 🛠️ Troubleshooting

### Common Issues

1. **Containers not starting:**
   ```bash
   # Check logs for errors
   docker compose -f docker-compose.prod.yml logs
   
   # Check container status
   docker compose -f docker-compose.prod.yml ps
   ```

2. **SSL certificate issues:**
   ```bash
   # Check Caddy logs
   docker compose -f docker-compose.prod.yml logs caddy
   
   # Restart Caddy
   docker compose -f docker-compose.prod.yml restart caddy
   ```

3. **Database connection issues:**
   ```bash
   # Check database logs
   docker compose -f docker-compose.prod.yml logs db
   
   # Verify environment variables
   docker compose -f docker-compose.prod.yml exec api env | grep DB_
   ```

4. **API not responding:**
   ```bash
   # Check API logs
   docker compose -f docker-compose.prod.yml logs api
   
   # Restart API service
   docker compose -f docker-compose.prod.yml restart api
   ```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats

# Check disk usage
df -h
docker system df

# Clean up unused resources
docker system prune -f
```

## 🔒 Security Considerations

1. **Regular Updates:**
   ```bash
   # Update system packages monthly
   sudo apt update && sudo apt upgrade -y
   ```

2. **Backup Strategy:**
   - Set up automated database backups
   - Store backups in a separate location
   - Test backup restoration regularly

3. **Monitoring:**
   - Monitor application logs
   - Set up alerts for service failures
   - Monitor SSL certificate expiration

## 📞 Support

If you encounter issues:
1. Check the logs using the commands above
2. Verify environment variables are correctly set
3. Ensure domain DNS is properly configured
4. Check firewall settings

## 📊 Monitoring and Logging

### 1. Application Monitoring

```bash
# Monitor all containers
watch docker compose -f docker-compose.prod.yml ps

# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Check container health
docker compose -f docker-compose.prod.yml exec api curl -f http://localhost:5000/health
```

### 2. Log Management

```bash
# Rotate logs to prevent disk space issues
docker compose -f docker-compose.prod.yml logs --tail=1000 > app_logs_$(date +%Y%m%d).log

# Clear old logs (be careful!)
docker compose -f docker-compose.prod.yml logs --tail=0

# Monitor logs in real-time with filtering
docker compose -f docker-compose.prod.yml logs -f api | grep ERROR
```

### 3. Automated Backup Script

Create a backup script:
```bash
nano ~/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/$(whoami)/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker exec sin-app-prod-db-1 pg_dump -U sinuser sindb > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
```

Make it executable and add to crontab:
```bash
chmod +x ~/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add this line:
# 0 2 * * * /home/$(whoami)/backup.sh
```

## 🔧 Advanced Configuration

### 1. Custom Domain Setup

If using a different domain structure:

```bash
# For subdomain API (api.yourdomain.com)
# Update Client/.env
VITE_API_URL=https://api.yourdomain.com/api

# For path-based API (yourdomain.com/api)
# Update Client/.env
VITE_API_URL=https://yourdomain.com/api
```

### 2. SSL Certificate Management

```bash
# Check certificate status
docker compose -f docker-compose.prod.yml exec caddy caddy list-certificates

# Force certificate renewal
docker compose -f docker-compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### 3. Performance Optimization

```bash
# Optimize Docker images
docker compose -f docker-compose.prod.yml build --no-cache

# Clean up unused resources
docker system prune -a -f

# Monitor performance
docker compose -f docker-compose.prod.yml top
```

## 🚨 Emergency Procedures

### 1. Quick Rollback

```bash
# Stop current deployment
docker compose -f docker-compose.prod.yml down

# Revert to previous commit
git log --oneline -10  # Find previous commit
git checkout PREVIOUS_COMMIT_HASH

# Redeploy
docker compose -f docker-compose.prod.yml up -d --build
```

### 2. Service Recovery

```bash
# Restart specific service
docker compose -f docker-compose.prod.yml restart SERVICE_NAME

# Rebuild specific service
docker compose -f docker-compose.prod.yml up -d --build SERVICE_NAME

# Check service health
docker compose -f docker-compose.prod.yml exec SERVICE_NAME curl -f http://localhost:PORT/health
```

### 3. Database Recovery

```bash
# Stop application
docker compose -f docker-compose.prod.yml stop api client

# Restore database
docker exec -i sin-app-prod-db-1 psql -U sinuser sindb < backup_file.sql

# Restart application
docker compose -f docker-compose.prod.yml start api client
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Domain DNS configured
- [ ] Server firewall configured
- [ ] Environment files created and configured
- [ ] JWT secrets generated
- [ ] Database passwords set

### Deployment
- [ ] Repository cloned/updated
- [ ] Environment variables verified
- [ ] Docker containers built and started
- [ ] Health checks passing
- [ ] SSL certificates obtained

### Post-Deployment
- [ ] Application accessible via domain
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Backup script configured
- [ ] Monitoring set up

---

**Last Updated:** July 2025
**Version:** 1.0.0
**Domain Example:** Replace `yourdomain.com` with your actual domain
