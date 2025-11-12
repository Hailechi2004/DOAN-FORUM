# 🚀 Deployment Guide - Company Forum System

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Deployment Methods](#deployment-methods)
4. [SSL/HTTPS Configuration](#ssl-configuration)
5. [Database Backup](#database-backup)
6. [Monitoring & Maintenance](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Minimum Server Requirements

**Development/Testing:**
- 2 vCPU
- 4 GB RAM
- 50 GB SSD Storage
- Ubuntu 22.04 LTS

**Production (Small Scale < 500 users):**
- 4 vCPU
- 8 GB RAM
- 100 GB SSD Storage
- Ubuntu 22.04 LTS

**Production (Medium Scale 500-2000 users):**
- 8 vCPU
- 16 GB RAM
- 200 GB SSD Storage
- Ubuntu 22.04 LTS

### Recommended VPS Providers
- DigitalOcean (Droplets) - $40-80/month
- AWS EC2 (t3.large) - $60-100/month
- Linode - $40-80/month
- Vultr - $40-80/month
- Google Cloud Platform - $60-100/month

### Domain & DNS
- Register a domain (Namecheap, GoDaddy, etc.)
- Point A record to your server IP
- Optional: Setup CDN (Cloudflare)

---

## Server Setup

### 1. Initial Server Configuration

```bash
# SSH into your server
ssh root@your-server-ip

# Update system packages
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone Asia/Ho_Chi_Minh

# Create non-root user
adduser forum
usermod -aG sudo forum

# Setup SSH key authentication (recommended)
mkdir -p /home/forum/.ssh
cp ~/.ssh/authorized_keys /home/forum/.ssh/
chown -R forum:forum /home/forum/.ssh
chmod 700 /home/forum/.ssh
chmod 600 /home/forum/.ssh/authorized_keys

# Switch to new user
su - forum
```

### 2. Install Required Software

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Install Node.js (if not using Docker for backend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Configure Firewall

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

---

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### Step 1: Clone Repository

```bash
# Create project directory
mkdir -p /home/forum/projects
cd /home/forum/projects

# Clone your repository
git clone https://github.com/your-username/company-forum.git
cd company-forum/backend
```

#### Step 2: Environment Configuration

```bash
# Copy environment file
cp .env.production.example .env

# Edit environment variables
nano .env
```

**Important: Change these values!**
```env
DB_PASSWORD=your-strong-db-password
REDIS_PASSWORD=your-strong-redis-password
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
CORS_ORIGIN=https://your-domain.com
```

#### Step 3: Build and Start Services

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check running containers
docker ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Step 4: Initialize Database

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Seed initial data (optional for production)
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

---

### Method 2: PM2 Deployment (Alternative)

#### Step 1: Setup Application

```bash
cd /home/forum/projects
git clone https://github.com/your-username/company-forum.git
cd company-forum/backend

# Install dependencies
npm install

# Build TypeScript
npm run build
```

#### Step 2: Install and Configure MySQL

```bash
# Install MySQL
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Create database and user
sudo mysql
```

```sql
CREATE DATABASE company_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'forum_user'@'localhost' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON company_forum.* TO 'forum_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 3: Install and Configure Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password (find and uncomment)
# requirepass your-strong-redis-password

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

#### Step 4: Setup Environment

```bash
# Copy and edit .env
cp .env.production.example .env
nano .env
```

#### Step 5: Run Database Migrations

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run migration
./scripts/migrate.sh

# Seed data (optional)
./scripts/seed.sh
```

#### Step 6: Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs

# Monitor application
pm2 monit
```

---

## SSL Configuration

### Using Let's Encrypt (Free SSL)

#### Step 1: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/forum
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/forum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 2: Obtain SSL Certificate

```bash
# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Step 3: Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/forum
```

Copy the Nginx configuration from `nginx/nginx.conf` and adjust for your domain.

```bash
# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## Database Backup

### Automated Daily Backup Script

```bash
# Create backup directory
sudo mkdir -p /backups/mysql
sudo chown forum:forum /backups

# Create backup script
nano ~/backup-db.sh
```

```bash
#!/bin/bash

# Database credentials
DB_NAME="company_forum"
DB_USER="forum_user"
DB_PASS="your-password"

# Backup directory
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/forum_backup_$DATE.sql.gz"

# Create backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "forum_backup_*.sql.gz" -mtime +30 -delete

# Optional: Upload to S3
# aws s3 cp $BACKUP_FILE s3://your-backup-bucket/mysql/

echo "Backup completed: $BACKUP_FILE"
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/forum/backup-db.sh >> /home/forum/backup.log 2>&1
```

### Manual Backup

```bash
# Backup database
mysqldump -u forum_user -p company_forum | gzip > forum_backup_$(date +%Y%m%d).sql.gz

# Restore database
gunzip < forum_backup_20251102.sql.gz | mysql -u forum_user -p company_forum
```

---

## Monitoring

### 1. Application Monitoring (PM2)

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Check status
pm2 status

# Restart application
pm2 restart all

# View detailed info
pm2 show forum-api
```

### 2. System Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check MySQL status
sudo systemctl status mysql

# Check Nginx status
sudo systemctl status nginx

# Check Redis status
sudo systemctl status redis-server
```

### 3. Log Monitoring

```bash
# Application logs (PM2)
pm2 logs --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log

# System logs
sudo journalctl -f
```

### 4. Setup Alerts (Optional)

```bash
# Install monitoring service
sudo apt install -y prometheus grafana

# Or use cloud services:
# - Datadog
# - New Relic
# - Sentry (for error tracking)
```

---

## Performance Optimization

### 1. MySQL Optimization

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add/modify:
```ini
[mysqld]
# Connection settings
max_connections = 500
connect_timeout = 10

# Buffer settings
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2

# Query cache
query_cache_type = 1
query_cache_size = 128M

# Slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

```bash
sudo systemctl restart mysql
```

### 2. Redis Optimization

```bash
sudo nano /etc/redis/redis.conf
```

Add/modify:
```
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Nginx Optimization

Already optimized in the provided `nginx.conf`

---

## Security Hardening

### 1. SSH Security

```bash
sudo nano /etc/ssh/sshd_config
```

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change default port
```

```bash
sudo systemctl restart sshd
```

### 2. Install Fail2Ban

```bash
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Start service
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. Regular Updates

```bash
# Auto-update script
sudo nano /etc/cron.daily/auto-update
```

```bash
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
```

```bash
sudo chmod +x /etc/cron.daily/auto-update
```

---

## Scaling Strategies

### Horizontal Scaling

```bash
# Add more backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Setup load balancer (Nginx)
# Update upstream backend configuration to include all instances
```

### Vertical Scaling

```bash
# Upgrade server resources (CPU, RAM, Disk)
# Adjust Docker resource limits in docker-compose.prod.yml
```

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
docker-compose logs backend
pm2 logs

# Check environment variables
docker-compose config

# Check port availability
sudo netstat -tlnp | grep 3000
```

#### 2. Database Connection Failed

```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -h localhost -u forum_user -p

# Check credentials in .env file
cat .env | grep DB_
```

#### 3. High Memory Usage

```bash
# Check memory usage
free -h

# Find memory-hungry processes
ps aux --sort=-%mem | head

# Restart services
docker-compose restart
# or
pm2 restart all
```

#### 4. Slow Performance

```bash
# Check database slow queries
mysql -u forum_user -p
mysql> SHOW PROCESSLIST;

# Check Redis performance
redis-cli INFO stats

# Monitor system resources
htop
```

#### 5. SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test certificate
openssl s_client -connect your-domain.com:443
```

---

## Update Deployment

### Update Application Code

```bash
# Pull latest code
cd /home/forum/projects/company-forum
git pull origin main

# Docker method
cd backend
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# PM2 method
npm install
npm run build
pm2 restart all
```

### Database Migration

```bash
# Run new migrations
./scripts/migrate.sh
# or
docker-compose exec backend npm run migrate
```

---

## Disaster Recovery

### Full System Restore

1. **Setup new server** (follow Server Setup section)

2. **Restore database:**
```bash
gunzip < backup.sql.gz | mysql -u forum_user -p company_forum
```

3. **Restore files:**
```bash
# Restore uploaded files from backup
rsync -av backup/uploads/ /home/forum/projects/company-forum/backend/uploads/
```

4. **Start application:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

5. **Update DNS** to point to new server

---

## Maintenance Checklist

### Daily
- [ ] Check application logs
- [ ] Monitor system resources
- [ ] Check error rates

### Weekly
- [ ] Review backup logs
- [ ] Check disk space
- [ ] Review security logs
- [ ] Update application if needed

### Monthly
- [ ] Test backup restoration
- [ ] Review and optimize database
- [ ] Update system packages
- [ ] Review access logs
- [ ] Performance analysis

---

## Support & Resources

### Documentation
- Express.js: https://expressjs.com/
- Socket.io: https://socket.io/docs/
- MySQL: https://dev.mysql.com/doc/
- Redis: https://redis.io/documentation
- Docker: https://docs.docker.com/
- PM2: https://pm2.keymetrics.io/docs/

### Monitoring Tools
- PM2 Web: https://app.pm2.io/
- Grafana: https://grafana.com/
- Sentry: https://sentry.io/

---

**Last Updated:** November 2, 2025  
**Version:** 1.0

**Need Help?** Contact your system administrator or dev team.
