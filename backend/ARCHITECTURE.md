# 🏗️ Architecture & Technology Stack

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Web App    │              │ Flutter App  │            │
│  │  (React.js)  │              │   (Mobile)   │            │
│  └──────────────┘              └──────────────┘            │
│         │                              │                    │
└─────────┼──────────────────────────────┼────────────────────┘
          │                              │
          │     HTTP/HTTPS + WebSocket   │
          │                              │
┌─────────┴──────────────────────────────┴────────────────────┐
│                  API GATEWAY / NGINX                         │
│              (Load Balancer + SSL/TLS)                       │
└─────────┬──────────────────────────────┬────────────────────┘
          │                              │
┌─────────┴──────────────────────────────┴────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────┐           │
│  │         Node.js Backend Server               │           │
│  │  ┌────────────┐        ┌────────────┐       │           │
│  │  │  REST API  │        │ WebSocket  │       │           │
│  │  │ (Express)  │        │ (Socket.io)│       │           │
│  │  └────────────┘        └────────────┘       │           │
│  │                                              │           │
│  │  ┌────────────────────────────────────┐    │           │
│  │  │   Authentication & Authorization   │    │           │
│  │  │        (JWT + Passport.js)         │    │           │
│  │  └────────────────────────────────────┘    │           │
│  │                                              │           │
│  │  ┌────────────────────────────────────┐    │           │
│  │  │       Business Logic Layer         │    │           │
│  │  │  (Controllers, Services, Models)   │    │           │
│  │  └────────────────────────────────────┘    │           │
│  └──────────────────────────────────────────────┘           │
└──────────────────┬───────────────────┬───────────────────────┘
                   │                   │
┌──────────────────┴─────┐   ┌─────────┴─────────────────────┐
│   DATA LAYER            │   │   CACHE & QUEUE LAYER         │
│  ┌──────────────────┐   │   │  ┌─────────────────────┐     │
│  │  MySQL Database  │   │   │  │  Redis (Cache +     │     │
│  │  (Primary Data)  │   │   │  │  Session + PubSub)  │     │
│  └──────────────────┘   │   │  └─────────────────────┘     │
│                          │   │                               │
│  ┌──────────────────┐   │   │  ┌─────────────────────┐     │
│  │  File Storage    │   │   │  │  Bull Queue         │     │
│  │  (S3/MinIO/Local)│   │   │  │  (Background Jobs)  │     │
│  └──────────────────┘   │   │  └─────────────────────┘     │
└──────────────────────────┘   └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  MONITORING & LOGGING                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Winston  │  │  PM2     │  │ Prometheus│  │ Grafana  │   │
│  │ Logging  │  │ Process  │  │ Metrics   │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend Framework
```yaml
Language: Node.js (v18+ LTS)
Framework: Express.js 4.18+
Real-time: Socket.io 4.6+
Reason: 
  - Hiệu năng cao cho real-time applications
  - Ecosystem phong phú
  - Dễ scale horizontal
  - Native JSON support
```

### Database
```yaml
Primary Database: MySQL 8.0+
  - ACID compliance
  - Mature, reliable
  - Excellent for structured data
  
Cache Layer: Redis 7.0+
  - Session storage
  - Real-time data caching
  - Pub/Sub for WebSocket scaling
  - Rate limiting
  
Search Engine: Elasticsearch (Optional)
  - Full-text search for posts
  - Analytics và reporting
```

### Real-time Communication
```yaml
Protocol: WebSocket (Socket.io)
Features:
  - Auto-reconnection
  - Room/Namespace support
  - Broadcasting
  - Binary support
  
Use Cases:
  - Online/offline status
  - Typing indicators
  - Live notifications
  - Real-time messages
  - Live post updates
  - Reaction updates
```

### Authentication & Security
```yaml
Authentication: JWT (JSON Web Tokens)
  - Access Token (15 min)
  - Refresh Token (7 days)
  
Password Hashing: bcrypt
Security Headers: Helmet.js
Rate Limiting: express-rate-limit + Redis
CORS: cors middleware
File Upload: Multer + file validation
```

### File Storage
```yaml
Development: Local filesystem
Production Options:
  1. AWS S3 (recommended)
  2. MinIO (self-hosted S3-compatible)
  3. Cloudinary (image optimization)
  
Features:
  - Automatic image resizing
  - Thumbnail generation
  - CDN delivery
  - Secure URLs
```

### Background Jobs
```yaml
Queue System: Bull (Redis-based)
Use Cases:
  - Email sending
  - Push notifications
  - File processing
  - Report generation
  - Cleanup tasks
  - Analytics aggregation
```

### API Documentation
```yaml
Tool: Swagger/OpenAPI 3.0
Endpoint: /api/docs
Features:
  - Interactive API testing
  - Request/response schemas
  - Authentication flows
```

### Testing
```yaml
Unit Tests: Jest
Integration Tests: Supertest
E2E Tests: Jest + Socket.io Client
Coverage: Istanbul/nyc
```

### DevOps & Deployment
```yaml
Containerization: Docker + Docker Compose
Process Manager: PM2 (production)
Reverse Proxy: Nginx
SSL/TLS: Let's Encrypt (Certbot)
CI/CD: GitHub Actions / GitLab CI

Monitoring:
  - PM2 monitoring
  - Winston logs
  - Morgan (HTTP logs)
  - Prometheus + Grafana (optional)
```

## 🔄 Real-time Features Implementation

### 1. WebSocket Event System

```javascript
// Client -> Server Events
socket.emit('user:online')
socket.emit('typing:start', { conversationId })
socket.emit('typing:stop', { conversationId })
socket.emit('message:send', { message })
socket.emit('post:view', { postId })
socket.emit('post:react', { postId, reactionType })

// Server -> Client Events
socket.on('user:status', { userId, status, lastSeen })
socket.on('notification:new', { notification })
socket.on('message:received', { message })
socket.on('typing:indicator', { userId, conversationId })
socket.on('post:updated', { postId, action })
socket.on('comment:new', { postId, comment })
socket.on('reaction:updated', { targetId, counts })
```

### 2. Redis Pub/Sub for Scaling

```yaml
Purpose: Synchronize WebSocket events across multiple server instances

Channels:
  - user:status:${userId}
  - notification:${userId}
  - conversation:${conversationId}
  - post:${postId}
  - department:${deptId}
```

### 3. Optimistic Updates

```yaml
Strategy: Client updates UI immediately, server validates

Flow:
  1. User performs action (like, comment, etc.)
  2. Client updates UI optimistically
  3. Send request to server
  4. Server validates & broadcasts
  5. All clients sync with server state
  6. Rollback if validation fails
```

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login
   ├─> Validate credentials
   ├─> Generate Access Token (15min)
   ├─> Generate Refresh Token (7days)
   ├─> Store refresh token in Redis
   └─> Return both tokens

2. Authenticated Request
   ├─> Extract Access Token from header
   ├─> Verify & decode JWT
   ├─> Attach user to request
   └─> Proceed to route handler

3. Token Refresh
   ├─> Client sends Refresh Token
   ├─> Validate against Redis
   ├─> Generate new Access Token
   └─> Return new token pair
```

### Authorization Flow

```
Request → JWT Validation → Permission Check → Route Handler
                                    ↓
                          (roles + permissions from DB)
```

### Security Layers

```yaml
Layer 1 - Network:
  - HTTPS only (SSL/TLS)
  - Rate limiting
  - DDoS protection (Cloudflare)

Layer 2 - Application:
  - Input validation (Joi/express-validator)
  - SQL injection prevention (Parameterized queries)
  - XSS protection (Helmet)
  - CSRF tokens for sensitive operations

Layer 3 - Data:
  - Password hashing (bcrypt)
  - Sensitive data encryption
  - File upload restrictions
  - Database backups
```

## 📊 Database Strategy

### Connection Pooling
```yaml
Pool Size: 10-20 connections
Idle Timeout: 10000ms
Connection Limit: dynamic based on server capacity
```

### Indexing Strategy
```yaml
All indexes already defined in schema
Additional indexes based on query patterns:
  - Composite indexes for common WHERE clauses
  - Full-text indexes for search
  - Covering indexes for frequent queries
```

### Query Optimization
```yaml
Use ORM: Sequelize / Prisma
  - Query builder
  - Migration support
  - Connection pooling
  - Transaction support

Performance:
  - Eager loading for relations
  - Pagination for large datasets
  - Select only needed columns
  - Use indexes effectively
```

### Caching Strategy
```yaml
Cache Layers:
  1. Redis (Application cache)
     - User sessions
     - Active user list
     - Trending posts/hashtags
     - Notification counts
     
  2. MySQL Query Cache
     - Automatic for repeated queries
     
  3. HTTP Cache Headers
     - Static assets
     - Public profile data
```

## 🚀 Performance Optimization

### API Response Time Targets
```yaml
Authentication: < 200ms
Post Creation: < 300ms
Feed Loading: < 500ms
Search: < 1000ms
File Upload: < 5000ms (depends on size)
```

### Optimization Techniques
```yaml
1. Database:
   - Connection pooling
   - Query optimization
   - Proper indexing
   - Pagination

2. Caching:
   - Redis for hot data
   - HTTP cache headers
   - CDN for static files

3. Code:
   - Async/await properly
   - Avoid N+1 queries
   - Batch operations
   - Stream large data

4. Network:
   - Gzip compression
   - HTTP/2
   - CDN delivery
   - Lazy loading
```

## 📦 Deployment Architecture

### Single Server (Small Scale)
```
Server Specs:
  - 2 vCPU, 4GB RAM (minimum)
  - 50GB SSD storage
  - Ubuntu 22.04 LTS

Services:
  - Nginx (reverse proxy + static files)
  - Node.js (PM2 cluster mode)
  - MySQL (local)
  - Redis (local)
```

### Multi-Server (Production Scale)
```
Load Balancer:
  - Nginx / HAProxy
  - SSL termination
  - Health checks

App Servers (2-3 instances):
  - Node.js (PM2)
  - Auto-scaling

Database Server:
  - MySQL (primary)
  - MySQL (replica for reads)

Cache Server:
  - Redis (sentinel/cluster)

File Storage:
  - S3 / MinIO / NFS
```

## 🔧 Environment Configuration

### Development
```yaml
Database: localhost
Redis: localhost
File Storage: local filesystem
Logs: console + file
Debug: enabled
```

### Staging
```yaml
Database: staging DB
Redis: staging Redis
File Storage: S3/MinIO test bucket
Logs: file + monitoring service
Debug: enabled
SSL: enabled
```

### Production
```yaml
Database: production DB + replicas
Redis: cluster mode
File Storage: S3/CDN
Logs: centralized logging
Debug: disabled
SSL: required
Monitoring: full stack
Backups: automated
```

## 📈 Scalability Strategy

### Horizontal Scaling
```yaml
App Servers: 
  - Add more Node.js instances
  - Load balance with Nginx/HAProxy
  - Session in Redis (not in-memory)
  - Stateless architecture

WebSocket:
  - Redis Adapter for Socket.io
  - Sticky sessions on load balancer
  - Multiple Socket.io instances
```

### Vertical Scaling
```yaml
Database:
  - Increase server specs
  - Add read replicas
  - Partition large tables
  
Redis:
  - Increase memory
  - Use Redis Cluster
```

### Database Sharding (Future)
```yaml
Strategy: Shard by department_id
  - Each department in separate shard
  - Improves query performance
  - Isolates department data
```

## 🔍 Monitoring & Logging

### Application Logs
```yaml
Logger: Winston
Levels: error, warn, info, debug
Transports:
  - Console (development)
  - File rotation (production)
  - Centralized logging (optional)
```

### Metrics
```yaml
PM2:
  - CPU usage
  - Memory usage
  - Request rate
  - Error rate

Custom Metrics:
  - Active users count
  - WebSocket connections
  - API response times
  - Database query times
```

### Alerts
```yaml
Triggers:
  - Server down
  - High error rate
  - Memory/CPU > 90%
  - Database connection failures
  - Disk space < 10%

Notification:
  - Email
  - Slack/Discord webhook
  - SMS (critical)
```

## 🔄 Data Backup & Recovery

### Backup Strategy
```yaml
Database:
  - Daily full backup
  - Hourly incremental backup
  - Retention: 30 days
  - Test restore monthly

Files:
  - Daily backup to S3
  - Versioning enabled
  - Retention: 90 days

Redis:
  - RDB snapshots
  - AOF log
  - Automatic failover
```

### Disaster Recovery
```yaml
RTO (Recovery Time Objective): < 1 hour
RPO (Recovery Point Objective): < 1 hour

Steps:
  1. Spin up new server
  2. Restore database from backup
  3. Sync files from S3
  4. Update DNS
  5. Validate functionality
```

## 📱 Mobile App Considerations

### API Design for Mobile
```yaml
Principles:
  - RESTful design
  - Pagination for all lists
  - Partial response (field filtering)
  - Versioning (/api/v1/)
  
Optimization:
  - Compress responses (gzip)
  - Minimize payloads
  - Batch requests
  - Offline support (client-side)
```

### Push Notifications
```yaml
Service: Firebase Cloud Messaging (FCM)

Flow:
  1. User action triggers notification
  2. Background job created
  3. Send to FCM
  4. FCM delivers to device
  5. Update notification status
```

## 🎯 Next Steps

1. ✅ Database schema - DONE
2. 📝 API endpoints documentation
3. 🔧 Backend implementation
4. 🐳 Docker setup
5. 📋 Deployment guide
6. 🧪 Testing strategy
7. 📱 Mobile API integration guide

---

**Note**: Architecture này được thiết kế để có thể bắt đầu đơn giản (single server) và scale lên khi cần thiết.
