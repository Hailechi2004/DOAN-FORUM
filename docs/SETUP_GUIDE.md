# 🚀 Complete Setup Guide - Company Forum Backend

## 📋 Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **MySQL**: v8.0 or higher ([Download](https://dev.mysql.com/downloads/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))

### Optional (for Production)

- **Redis**: v6.0+ for caching and sessions
- **PM2**: For process management
- **Docker**: For containerized deployment

---

## 🛠️ Installation Steps

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd DACN-FORUM/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:

- Express.js (Web framework)
- MySQL2 (Database driver)
- JWT (Authentication)
- Socket.IO (Real-time features)
- And 40+ other dependencies

### Step 3: Database Setup

#### Create Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE company_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'forum_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON company_forum.* TO 'forum_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Import Database Schema

```bash
# Import the database dump (if provided)
mysql -u root -p company_forum < database/company_forum.sql

# Or run migrations
npm run migrate
```

#### Verify Tables

```bash
node check-tables.js
```

Expected output: **58 tables found** including users, departments, teams, projects, etc.

### Step 4: Environment Configuration

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=company_forum

# JWT Configuration (IMPORTANT: Change these!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3001

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=your-session-secret-change-me

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@company.com
```

### Step 5: Create Admin User

```bash
node create-admin.js
```

This creates an admin user with:

- **Email**: admin@example.com
- **Password**: Admin123!
- **Role**: admin

### Step 6: Start Development Server

```bash
npm run dev
```

Expected output:

```
✅ Database connection successful
🚀 Server is running on port 3000
📚 Swagger docs: http://localhost:3000/api-docs
```

---

## ✅ Verification

### Test API Endpoints

```bash
# Run comprehensive API tests
node test-all-apis.js
```

Expected result:

```
📊 TEST SUMMARY
Total Tests:   59
Passed:        59
Failed:        0
Success Rate:  100.0%
```

### Access Swagger Documentation

Open browser: `http://localhost:3000/api-docs`

### Test Authentication

```bash
# Login with admin account
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

### Issue: Database connection failed

```bash
# Check MySQL is running
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql

# Verify connection
mysql -u root -p -e "SELECT 1"
```

### Issue: Module not found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Permission denied on uploads folder

```bash
# Create uploads directory
mkdir -p uploads

# Set permissions (Linux/Mac)
chmod 755 uploads

# Windows - no action needed
```

---

## 🔧 Advanced Configuration

### Redis Setup (Optional)

For caching and session storage:

```bash
# Install Redis
# Windows: Download from https://github.com/tporadowski/redis/releases
# Linux: sudo apt-get install redis-server
# Mac: brew install redis

# Start Redis
redis-server

# Update .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Email Setup (Optional)

For Gmail SMTP:

1. Enable 2FA on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

### File Storage (S3/MinIO)

For production file storage:

```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

---

## 📦 Project Commands

```bash
# Development
npm run dev              # Start with nodemon (hot reload)
npm start               # Start production server

# Testing
npm test                # Run Jest tests
node test-all-apis.js   # Run integration tests

# Database
npm run migrate         # Run migrations
npm run seed            # Seed data

# Code Quality
npm run lint            # Check code style
npm run lint:fix        # Fix code style issues
npm run format          # Format code with Prettier

# Production
npm run build           # Build for production
npm run start:prod      # Start with PM2
npm run start:cluster   # Start in cluster mode

# Docker
npm run docker:dev      # Start Docker development
npm run docker:prod     # Start Docker production
npm run docker:down     # Stop Docker containers
```

---

## 🎯 Next Steps

1. **Explore API Documentation**: http://localhost:3000/api-docs
2. **Read Architecture Guide**: [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md)
3. **Review API Tests**: [test-all-apis.js](./test-all-apis.js)
4. **Check Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Start Frontend Development**: Connect to these APIs

---

## 📞 Support

If you encounter issues:

1. Check logs: `tail -f logs/app.log`
2. Verify environment: `node -v`, `mysql --version`
3. Review error messages in console
4. Check database connectivity: `node check-tables.js`

---

## 🎉 Success!

Your backend is now running with:

- ✅ 59 API endpoints tested and working
- ✅ Clean Architecture implementation
- ✅ JWT authentication configured
- ✅ Swagger documentation available
- ✅ Admin user created
- ✅ Database connected and ready

**API Base URL**: `http://localhost:3000/api`  
**Swagger UI**: `http://localhost:3000/api-docs`  
**Health Check**: `http://localhost:3000/api/health`

Ready for frontend integration! 🚀
