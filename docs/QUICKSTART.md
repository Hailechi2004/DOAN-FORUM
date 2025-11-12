# Company Forum Backend - Quick Start Guide

## 🚀 Backend đã hoàn thiện!

Backend API với đầy đủ tính năng real-time đã sẵn sàng để phát triển frontend.

## 📦 Cài đặt Dependencies

```bash
cd backend
npm install
```

## ⚙️ Cấu hình Environment

File `.env` đã có sẵn, chỉnh sửa nếu cần:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=company_forum

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🗄️ Setup Database

```bash
# Tạo database và tables (đã làm rồi)
cd database
powershell -ExecutionPolicy Bypass -File run-database.ps1

# Thêm dữ liệu mẫu
cd ..
npm run seed
```

## 🏃‍♂️ Chạy Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server sẽ chạy tại:
- **HTTP API**: http://localhost:3000
- **WebSocket**: ws://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin user

### Posts
- `GET /api/posts` - Lấy danh sách bài viết
- `GET /api/posts/:id` - Lấy chi tiết bài viết
- `POST /api/posts` - Tạo bài viết mới
- `PUT /api/posts/:id` - Sửa bài viết
- `DELETE /api/posts/:id` - Xóa bài viết
- `POST /api/posts/:id/react` - Reaction bài viết

### Comments
- `GET /api/comments/post/:post_id` - Lấy comments của bài viết
- `POST /api/comments` - Tạo comment mới
- `PUT /api/comments/:id` - Sửa comment
- `DELETE /api/comments/:id` - Xóa comment

### Messages
- `GET /api/messages/conversations` - Lấy danh sách conversations
- `POST /api/messages/conversations` - Tạo conversation mới
- `GET /api/messages/conversations/:id/messages` - Lấy tin nhắn
- `POST /api/messages/send` - Gửi tin nhắn

### Notifications
- `GET /api/notifications` - Lấy thông báo
- `PATCH /api/notifications/:id/read` - Đánh dấu đã đọc
- `PATCH /api/notifications/read-all` - Đánh dấu tất cả đã đọc

## 🔌 WebSocket Events

### Client -> Server
- `typing:start` - Bắt đầu gõ
- `typing:stop` - Dừng gõ
- `conversation:join` - Tham gia conversation
- `message:send` - Gửi tin nhắn
- `message:read` - Đánh dấu đã đọc
- `post:view` - Xem bài viết
- `post:react` - React bài viết

### Server -> Client
- `user:online` - User online
- `user:offline` - User offline
- `typing:start` - Có người đang gõ
- `typing:stop` - Dừng gõ
- `message:new` - Tin nhắn mới
- `message:read` - Tin nhắn đã đọc
- `notification:new` - Thông báo mới
- `post:react` - Có reaction mới

## 🔐 Authentication

Sử dụng JWT tokens:
1. Login để nhận `accessToken` và `refreshToken`
2. Thêm header: `Authorization: Bearer <accessToken>`
3. Khi token hết hạn, dùng refresh token để lấy token mới

## 🧪 Test Credentials

```
Admin:
  Email: admin@company.com
  Password: Password123!

Manager:
  Email: john.doe@company.com
  Password: Password123!

User:
  Email: jane.smith@company.com
  Password: Password123!
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── socket/         # WebSocket handlers
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── database/
│   ├── complete_forum_database.sql
│   ├── seed.js         # Sample data
│   └── run-database.ps1
└── package.json
```

## 🛠️ Technologies Used

- **Framework**: Express.js 4.18
- **Real-time**: Socket.io 4.6
- **Database**: MySQL 8.0 + mysql2
- **Cache**: Redis 7.0 + ioredis
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limit
- **File Upload**: multer

## 📝 Next Steps for Frontend

### 1. Setup Frontend Project
```bash
# React/Vite
npm create vite@latest frontend -- --template react
cd frontend
npm install axios socket.io-client
```

### 2. Install Required Packages
```bash
npm install react-router-dom
npm install @tanstack/react-query
npm install zustand
npm install socket.io-client
npm install axios
npm install react-toastify
```

### 3. Create API Client
```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 4. Setup Socket.io Client
```javascript
// src/services/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

export default socket;
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES LIKE 'company_forum';
```

### Redis Connection Error
```bash
# Install Redis (Windows)
# Download from: https://github.com/microsoftarchive/redis/releases

# Start Redis
redis-server
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

## 📞 Support

Kiểm tra logs nếu có lỗi:
```bash
# Development logs
npm run dev

# Production logs (với PM2)
pm2 logs
```

---

**Backend đã sẵn sàng! 🎉 Giờ có thể bắt đầu phát triển Frontend.**
