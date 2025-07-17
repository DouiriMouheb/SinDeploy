# 🚀 Sinergia Production Deployment Guide

This guide covers deploying the Sinergia application to production using Docker and Caddy with automatic SSL.

## 📋 Prerequisites

- Ubuntu 22.04 LTS server (DigitalOcean droplet recommended)
- Domain name `dcodelabs.studio` pointing to your server's IP
- SSH access to your server
- Docker and Docker Compose installed

## 🔧 Quick Deployment (For Existing Corrupted Installation)

If you have a corrupted deployment, follow these steps:

### 1. SSH to your server
```bash
ssh root@your-server-ip
```

### 2. Navigate to project directory
```bash
cd /var/www/SinDeploy  # or wherever your project is located
```

### 3. Run cleanup script
```bash
chmod +x cleanup.sh
./cleanup.sh
```

### 4. Pull latest code
```bash
git pull origin main
```

### 5. Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🛠️ Fresh Server Setup

## 🛠️ Server Setup

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Logout and login again for group changes to take effect
```

### 2. Clone Repository

```bash
git clone <your-repository-url>
cd SinDeploy
```

## ⚙️ Environment Configuration

### 1. Create Environment Files

```bash
# Copy environment templates
cp .env.example .env
cp Server/.env.example Server/.env
cp Client/.env.example Client/.env
```

### 2. Configure Root Environment (.env)

```bash
# Edit the main environment file
nano .env
```

**Required settings:**
```env
DOMAIN_NAME=yourdomain.com
DB_NAME=sindb
DB_USER=sinuser
DB_PASSWORD=your_secure_database_password_here
```

### 3. Configure Server Environment (Server/.env)

```bash
nano Server/.env
```

**Critical settings to update:**
```env
NODE_ENV=production
DB_PASSWORD=your_secure_database_password_here
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long
DOMAIN_NAME=yourdomain.com
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

**Generate secure JWT secret:**
```bash
openssl rand -base64 32
```

### 4. Configure Client Environment (Client/.env)

```bash
nano Client/.env
```

**Required settings:**
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=Sinergia
```

## 🌐 Domain Configuration

### 1. DNS Setup

Point your domain to your droplet's IP:
```
A    @              your.droplet.ip.address
A    www            your.droplet.ip.address
A    api            your.droplet.ip.address  (optional)
```

### 2. Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22  # SSH
sudo ufw enable
```

## 🐳 Deployment

### 1. Build and Deploy

```bash
# Build and start services
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 2. Database Setup

The database will be automatically initialized. To run migrations manually:

```bash
# Access the API container
docker compose -f docker-compose.prod.yml exec api bash

# Run migrations
npm run migrate

# Run seeders (if needed)
npm run seed
```

## 🔍 Monitoring and Maintenance

### 1. Health Checks

Check if services are healthy:
```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# Check specific service logs
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs client
docker compose -f docker-compose.prod.yml logs caddy
```

### 2. SSL Certificate

Caddy automatically handles SSL certificates via Let's Encrypt. Check certificate status:
```bash
docker compose -f docker-compose.prod.yml exec caddy caddy list-certificates
```

### 3. Database Backup

```bash
# Create backup
docker compose -f docker-compose.prod.yml exec db pg_dump -U sinuser sindb > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose -f docker-compose.prod.yml exec -T db psql -U sinuser sindb < backup_file.sql
```

## 🔄 Updates and Maintenance

### 1. Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Clean up old images
docker image prune -f
```

### 2. Log Management

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Clean up logs
docker system prune -f
```

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   # Check Caddy logs
   docker compose -f docker-compose.prod.yml logs caddy
   
   # Restart Caddy
   docker compose -f docker-compose.prod.yml restart caddy
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker compose -f docker-compose.prod.yml logs db
   
   # Test database connection
   docker compose -f docker-compose.prod.yml exec api npm run test:db
   ```

3. **API Not Responding**
   ```bash
   # Check API health
   curl https://yourdomain.com/api/auth/health
   
   # Check API logs
   docker compose -f docker-compose.prod.yml logs api
   ```

### Performance Optimization

1. **Enable Docker BuildKit**
   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Optimize Database**
   ```bash
   # Access database
   docker compose -f docker-compose.prod.yml exec db psql -U sinuser sindb
   
   # Run VACUUM and ANALYZE
   VACUUM ANALYZE;
   ```

## 📊 Monitoring URLs

After deployment, verify these endpoints:

- **Main App**: `https://yourdomain.com`
- **API Health**: `https://yourdomain.com/api/auth/health`
- **API Docs**: `https://yourdomain.com/api` (if implemented)

## 🔐 Security Checklist

- [ ] Strong database passwords
- [ ] Secure JWT secret (32+ characters)
- [ ] Firewall configured
- [ ] SSL certificates active
- [ ] Regular backups scheduled
- [ ] Log monitoring in place
- [ ] Environment files secured

## 📞 Support

For issues or questions:
1. Check the logs first
2. Review this documentation
3. Check GitHub issues
4. Contact the development team

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
