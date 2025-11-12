# Company Forum Backend - Clean Architecture

Backend API cho hệ thống forum nội bộ công ty, được xây dựng theo mô hình **Clean Architecture**.

## 🏗️ Kiến trúc Clean Architecture

Dự án tuân thủ các nguyên tắc Clean Architecture với 4 layers độc lập:

```
src/
├── domain/              # Domain Layer (Business Logic)
│   ├── entities/        # Domain entities (User, Project, Task, etc.)
│   └── repositories/    # Repository interfaces
│
├── application/         # Application Layer (Use Cases)
│   └── use-cases/       # Business use cases
│       ├── user/
│       ├── project/
│       └── task/
│
├── infrastructure/      # Infrastructure Layer (External Services)
│   └── repositories/    # Repository implementations (MySQL)
│
└── presentation/        # Presentation Layer (API)
    ├── controllers/     # HTTP request handlers
    ├── routes/          # API route definitions
    └── middleware/      # Express middleware
```

### 📦 Dependency Flow

```
Presentation → Application → Domain
      ↓
Infrastructure → Domain
```

- **Domain Layer**: Chứa business logic thuần túy, không phụ thuộc vào framework
- **Application Layer**: Chứa các use cases, orchestrate business logic
- **Infrastructure Layer**: Implement repositories, kết nối database
- **Presentation Layer**: Handle HTTP requests, routes, middleware

## 🚀 Tech Stack

- **Runtime**: Node.js v22+
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Architecture**: Clean Architecture Pattern
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **API Documentation**: Swagger

## 📋 Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- npm hoặc yarn

## 🛠️ Installation

```bash
# Clone repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env với thông tin database của bạn

# Run migrations (nếu có)
npm run migrate

# Start development server
npm run dev
```

## 🏃 Running the Application

```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## 🧪 Testing

Test coverage: **86.5%** (45/52 tests passing)

```bash
# Run all API tests
node test-all-apis.js

# Test specific module
node test-project-api.js
```

### Expected Test Failures (7 tests)

- **5 Authorization tests**: Require admin role
  - Create department/team/category
  - Get all users
  - Create project
- **2 Rate limit tests**: Too many requests
  - Search users
  - Dashboard stats

## 📁 Project Structure (Clean Architecture)

### Domain Layer

```
domain/
├── entities/           # Pure business objects
│   ├── User.js        # User entity with business methods
│   ├── Project.js     # Project entity
│   └── Task.js        # Task entity
└── repositories/      # Repository contracts (interfaces)
    ├── IUserRepository.js
    ├── IProjectRepository.js
    └── ITaskRepository.js
```

### Application Layer

```
application/
└── use-cases/         # Business use cases
    ├── user/
    │   ├── CreateUserUseCase.js
    │   ├── GetUserByIdUseCase.js
    │   ├── GetAllUsersUseCase.js
    │   └── UpdateUserProfileUseCase.js
    ├── project/
    │   ├── CreateProjectUseCase.js
    │   ├── GetProjectByIdUseCase.js
    │   ├── GetAllProjectsUseCase.js
    │   └── UpdateProjectUseCase.js
    └── task/
        ├── CreateTaskUseCase.js
        ├── GetTaskByIdUseCase.js
        ├── GetAllTasksUseCase.js
        └── UpdateTaskUseCase.js
```

### Infrastructure Layer

```
infrastructure/
├── repositories/      # Repository implementations
│   ├── MySQLUserRepository.js
│   ├── MySQLProjectRepository.js
│   └── MySQLTaskRepository.js
└── database/         # Database configuration (future)
```

### Presentation Layer

```
presentation/
├── controllers/      # HTTP request handlers
│   ├── userController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── ... (15+ controllers)
├── routes/          # API routes
│   ├── users.js
│   ├── projects.js
│   ├── tasks.js
│   └── ... (15+ route files)
└── middleware/      # Express middleware
    ├── authenticate.js
    ├── authorize.js
    └── errorHandler.js
```

### Dependency Injection

```
container.js         # DI Container - wires up all dependencies
```

## 🔌 API Endpoints

### Health Check

- `GET /api/health` - API health status

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Users (Clean Architecture)

- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Projects (Clean Architecture)

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (admin/manager)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (admin)
- `GET /api/projects/:id/members` - Get project members
- `POST /api/projects/:id/members` - Add member
- `PATCH /api/projects/:id/status` - Update status

### Tasks (Clean Architecture)

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update status
- `PATCH /api/tasks/:id/assign` - Assign to user

_... và 15+ modules khác (posts, comments, departments, teams, etc.)_

## 🔐 Authentication & Authorization

- **JWT-based authentication**: Bearer token in Authorization header
- **Role-based access control**: admin, manager, user roles
- **Middleware**:
  - `authenticate`: Verify JWT token
  - `authorize(roles)`: Check user roles

## 🎯 Key Features of Clean Architecture Implementation

### ✅ Separation of Concerns

- Business logic (Domain) tách biệt khỏi infrastructure
- Use cases orchestrate business logic
- Controllers chỉ handle HTTP requests

### ✅ Dependency Inversion

- High-level modules không phụ thuộc vào low-level modules
- Cả hai phụ thuộc vào abstractions (interfaces)
- Repository pattern với interfaces

### ✅ Testability

- Business logic có thể test độc lập
- Mock repositories dễ dàng
- Use cases test không cần database

### ✅ Maintainability

- Thay đổi database không ảnh hưởng business logic
- Thêm features mới dễ dàng
- Code rõ ràng, dễ hiểu

## 📊 Database Schema

Database: `company_forum` với 58 tables

**Core tables**:

- users, profiles, employee_records
- departments, teams
- projects, project_members, tasks
- posts, comments, reactions
- files, events, meetings, polls
- messages, notifications

## 🔧 Configuration

Environment variables (`.env`):

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=company_forum

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🐛 Troubleshooting

### Server không start

```bash
# Check MySQL connection
mysql -u root -p company_forum

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

### Tests fail

```bash
# Ensure server is running
npm run dev

# Check database connection
node test-all-apis.js
```

## 📝 Migration from Old Architecture

Dự án đã được migrate từ MVC pattern sang Clean Architecture:

**Before (MVC)**:

```
src/
├── models/           # Database + Business Logic
├── controllers/      # HTTP + Business Logic
└── routes/          # Routes
```

**After (Clean Architecture)**:

```
src/
├── domain/          # Pure Business Logic
├── application/     # Use Cases
├── infrastructure/  # Database Implementation
└── presentation/    # HTTP Layer
```

### Migration Benefits

- ✅ **86.5% test success** maintained
- ✅ Business logic tách biệt khỏi framework
- ✅ Dễ test và maintain hơn
- ✅ Scalable và flexible

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is proprietary software for internal company use.

## 👥 Team

Backend Development Team - Company Forum Project

---

**Built with ❤️ using Clean Architecture principles**
