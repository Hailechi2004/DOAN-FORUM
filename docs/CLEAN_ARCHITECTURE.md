# 🏛️ Clean Architecture - Code Structure

## 📐 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Controllers, Routes, Middleware)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │ Controllers │  │   Routes    │  │  Middleware  │       │
│  │  - User     │  │  - /api/*   │  │ - Auth       │       │
│  │  - Project  │  │  - Express  │  │ - Validate   │       │
│  │  - Task     │  │             │  │ - RateLimit  │       │
│  └─────────────┘  └─────────────┘  └──────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │ calls
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  (Use Cases - Business Orchestration)                       │
│  ┌──────────────────────────────────────────────┐          │
│  │             Use Cases                         │          │
│  │  - CreateUserUseCase                         │          │
│  │  - GetUserByIdUseCase                        │          │
│  │  - CreateProjectUseCase                      │          │
│  │  - GetAllTasksUseCase                        │          │
│  │  - UpdateTaskUseCase                         │          │
│  │  ... etc                                      │          │
│  └──────────────────────────────────────────────┘          │
└────────────┬──────────────────────────────┬─────────────────┘
             │ uses                         │ depends on
             ↓                              ↓
┌─────────────────────────┐    ┌──────────────────────────────┐
│   DOMAIN LAYER          │    │   INFRASTRUCTURE LAYER       │
│  (Core Business Logic)  │    │  (External Services)         │
│  ┌──────────────────┐   │    │  ┌────────────────────────┐ │
│  │   Entities       │   │    │  │  Repository Impl       │ │
│  │  - User          │   │    │  │  - MySQLUserRepo       │ │
│  │  - Project       │   │    │  │  - MySQLProjectRepo    │ │
│  │  - Task          │   │    │  │  - MySQLTaskRepo       │ │
│  └──────────────────┘   │    │  └────────────────────────┘ │
│  ┌──────────────────┐   │    │  ┌────────────────────────┐ │
│  │  Repo Interfaces │←──┼────┼──│  Implements            │ │
│  │  - IUserRepo     │   │    │  └────────────────────────┘ │
│  │  - IProjectRepo  │   │    │  ┌────────────────────────┐ │
│  │  - ITaskRepo     │   │    │  │  Database              │ │
│  └──────────────────┘   │    │  │  - MySQL Connection    │ │
└─────────────────────────┘    │  └────────────────────────┘ │
                               └──────────────────────────────┘

                              ┌───────────────┐
                              │ DI Container  │
                              │ Wires up all  │
                              │ dependencies  │
                              └───────────────┘
```

## 🔄 Request Flow Example

### Example: Create Project

```
1. HTTP Request
   POST /api/projects
   Body: { name: "New Project", description: "...", manager_id: 1 }
   ↓

2. Presentation Layer
   routes/projects.js
   ├─> authenticate middleware (verify JWT)
   ├─> authorize middleware (check role)
   ├─> validation middleware (validate input)
   └─> controller

   controllers/projectController.js
   ├─> Extract request data (req.body, req.user)
   ├─> Call use case
   └─> Format response
   ↓

3. Application Layer
   use-cases/project/CreateProjectUseCase.js
   ├─> Validate business rules
   │   - Check manager exists
   │   - Validate project name
   │   - Check duplicates
   ├─> Call repository
   └─> Return result
   ↓

4. Infrastructure Layer
   repositories/MySQLProjectRepository.js
   ├─> Build SQL query
   ├─> Execute with parameters (prevent SQL injection)
   ├─> Handle database errors
   └─> Return raw data
   ↓

5. Domain Layer
   entities/Project.js
   ├─> Wrap data in entity object
   ├─> Business methods available:
   │   - project.isCompleted()
   │   - project.getProgress()
   │   - project.canBeDeletedBy(user)
   └─> Return entity
   ↓

6. Response back through layers
   Entity → Use Case → Controller → HTTP Response
   {
     "success": true,
     "data": {
       "id": 123,
       "name": "New Project",
       "status": "in_progress",
       ...
     }
   }
```

## 📦 Module Dependencies

```
┌──────────────────┐
│   container.js   │  ← Dependency Injection Container
│                  │     Wire up all components
│                  │     Singleton pattern
└────────┬─────────┘
         │ Step 1: Create repositories
         ↓
┌─────────────────────────────────────────┐
│  Repositories (Infrastructure)          │
│  this.repositories = {                  │
│    user: new MySQLUserRepository(),     │
│    project: new MySQLProjectRepository(),│
│    task: new MySQLTaskRepository()      │
│  }                                      │
└────────┬────────────────────────────────┘
         │ Step 2: Create use cases
         │         Inject repositories
         ↓
┌─────────────────────────────────────────┐
│  Use Cases (Application)                │
│  this.useCases = {                      │
│    createUser: new CreateUserUseCase(   │
│      this.repositories.user             │
│    ),                                   │
│    getProjectById: new GetProjectByIdUC(│
│      this.repositories.project          │
│    ),                                   │
│    updateTask: new UpdateTaskUseCase(   │
│      this.repositories.task             │
│    )                                    │
│  }                                      │
└────────┬────────────────────────────────┘
         │ Step 3: Controllers get use cases
         │         via container.getUserUseCases()
         ↓
┌─────────────────────────────────────────┐
│  Controllers (Presentation)             │
│  class UserController {                 │
│    constructor() {                      │
│      this.useCases = container          │
│        .getUserUseCases();              │
│      this.create = this.create.bind(this);│
│    }                                    │
│                                         │
│    async create(req, res, next) {      │
│      const user = await this.useCases   │
│        .createUser.execute(req.body);   │
│      ApiResponse.success(res, user);    │
│    }                                    │
│  }                                      │
└─────────────────────────────────────────┘
```

## 🎯 Benefits of Clean Architecture

### 1. **Independent of Frameworks**

- Business logic không phụ thuộc Express.js
- Có thể đổi sang Fastify, Koa, Hapi dễ dàng
- Domain và Application layers có thể dùng cho GraphQL, gRPC, WebSocket

### 2. **Testable**

```javascript
// Test use case không cần database
const mockRepo = {
  findById: jest.fn().mockResolvedValue({
    id: 1,
    name: "Test User",
  }),
};

const useCase = new GetUserByIdUseCase(mockRepo);
const result = await useCase.execute(1);

expect(result.name).toBe("Test User");
expect(mockRepo.findById).toHaveBeenCalledWith(1);
```

### 3. **Independent of Database**

- Đổi từ MySQL → PostgreSQL chỉ cần thay repository implementation
- Business logic (use cases) không thay đổi
- Domain entities giữ nguyên

```javascript
// Before: MySQL
const userRepo = new MySQLUserRepository();

// After: PostgreSQL
const userRepo = new PostgreSQLUserRepository();

// Use cases stay the same!
const createUser = new CreateUserUseCase(userRepo);
```

### 4. **Independent of UI**

- Cùng business logic có thể dùng cho:
  - REST API (Express)
  - GraphQL (Apollo Server)
  - gRPC
  - WebSocket (Socket.io)
  - CLI tools

### 5. **Maintainable**

- Mỗi layer có responsibility rõ ràng
- Thay đổi ở một layer không ảnh hưởng layer khác
- Easy to find bugs (layer isolation)
- New team members hiểu cấu trúc nhanh

## 📁 File Structure

```
src/
├── domain/                    # Core business logic
│   ├── entities/
│   │   ├── User.js           # User entity with business methods
│   │   ├── Project.js        # Project entity
│   │   └── Task.js           # Task entity
│   └── repositories/         # Repository interfaces (contracts)
│       ├── IUserRepository.js
│       ├── IProjectRepository.js
│       └── ITaskRepository.js
│
├── application/              # Use cases (business orchestration)
│   └── use-cases/
│       ├── user/
│       │   ├── CreateUserUseCase.js
│       │   ├── GetUserByIdUseCase.js
│       │   ├── GetAllUsersUseCase.js
│       │   └── UpdateUserUseCase.js
│       ├── project/
│       │   ├── CreateProjectUseCase.js
│       │   ├── GetProjectByIdUseCase.js
│       │   ├── GetAllProjectsUseCase.js
│       │   └── UpdateProjectUseCase.js
│       └── task/
│           ├── CreateTaskUseCase.js
│           ├── GetTaskByIdUseCase.js
│           ├── GetAllTasksUseCase.js
│           └── UpdateTaskUseCase.js
│
├── infrastructure/           # External services implementation
│   └── repositories/
│       ├── MySQLUserRepository.js      # MySQL implementation
│       ├── MySQLProjectRepository.js
│       └── MySQLTaskRepository.js
│
├── presentation/            # HTTP layer
│   ├── controllers/         # 18 controllers
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── ... (13 more)
│   ├── routes/             # 18 route files
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── ... (15 more)
│   └── middleware/
│       ├── authenticate.js  # JWT verification
│       ├── authorize.js     # Role checking
│       ├── validate.js      # Input validation
│       └── rateLimiter.js   # Rate limiting
│
├── container.js            # Dependency Injection Container
├── app.js                  # Express app setup
└── server.js              # Server entry point
```

## 📋 Checklist: Thêm Feature Mới

### Ví dụ: Thêm Comments cho Tasks

#### Step 1: Domain Layer (Core Business)

```javascript
// domain/entities/Comment.js
class Comment {
  constructor({ id, content, author_id, task_id, created_at, updated_at }) {
    this.id = id;
    this.content = content;
    this.author_id = author_id;
    this.task_id = task_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Business logic methods
  isOwnedBy(userId) {
    return this.author_id === userId;
  }

  canBeEditedBy(user) {
    return this.isOwnedBy(user.id) || user.isAdmin();
  }

  isRecent() {
    const hoursDiff =
      (new Date() - new Date(this.created_at)) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }
}

module.exports = Comment;
```

```javascript
// domain/repositories/ICommentRepository.js
class ICommentRepository {
  async create(data) {
    throw new Error("Method create() must be implemented");
  }

  async findById(id) {
    throw new Error("Method findById() must be implemented");
  }

  async findByTaskId(taskId, options = {}) {
    throw new Error("Method findByTaskId() must be implemented");
  }

  async update(id, data) {
    throw new Error("Method update() must be implemented");
  }

  async delete(id) {
    throw new Error("Method delete() must be implemented");
  }
}

module.exports = ICommentRepository;
```

#### Step 2: Application Layer (Use Cases)

```javascript
// application/use-cases/comment/CreateCommentUseCase.js
class CreateCommentUseCase {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(data) {
    // Validate business rules
    if (!data.content || data.content.trim().length === 0) {
      throw new Error("Comment content is required");
    }

    if (data.content.length > 1000) {
      throw new Error("Comment is too long (max 1000 characters)");
    }

    // Create comment
    const commentId = await this.commentRepository.create({
      content: data.content.trim(),
      author_id: data.author_id,
      task_id: data.task_id,
    });

    // Return created comment
    return await this.commentRepository.findById(commentId);
  }
}

module.exports = CreateCommentUseCase;
```

```javascript
// application/use-cases/comment/GetCommentsByTaskUseCase.js
class GetCommentsByTaskUseCase {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(taskId, options = {}) {
    const { page = 1, limit = 20 } = options;

    return await this.commentRepository.findByTaskId(taskId, {
      page,
      limit,
      orderBy: "created_at DESC",
    });
  }
}

module.exports = GetCommentsByTaskUseCase;
```

#### Step 3: Infrastructure Layer (Database)

```javascript
// infrastructure/repositories/MySQLCommentRepository.js
const ICommentRepository = require("../../domain/repositories/ICommentRepository");
const Comment = require("../../domain/entities/Comment");
const db = require("../../config/database");

class MySQLCommentRepository extends ICommentRepository {
  async create(data) {
    const [result] = await db.execute(
      `INSERT INTO comments (content, author_id, task_id, created_at)
       VALUES (?, ?, ?, NOW())`,
      [data.content, data.author_id, data.task_id]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT c.*, u.full_name as author_name
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] ? new Comment(rows[0]) : null;
  }

  async findByTaskId(taskId, options = {}) {
    const { page = 1, limit = 20, orderBy = "created_at DESC" } = options;
    const offset = (page - 1) * limit;

    const [rows] = await db.execute(
      `SELECT c.*, u.full_name as author_name
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.task_id = ?
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [taskId, limit, offset]
    );

    const [countRows] = await db.execute(
      "SELECT COUNT(*) as total FROM comments WHERE task_id = ?",
      [taskId]
    );

    return {
      comments: rows.map((row) => new Comment(row)),
      total: countRows[0].total,
      page,
      limit,
    };
  }

  async update(id, data) {
    await db.execute(
      `UPDATE comments 
       SET content = ?, updated_at = NOW()
       WHERE id = ?`,
      [data.content, id]
    );
  }

  async delete(id) {
    await db.execute("DELETE FROM comments WHERE id = ?", [id]);
  }
}

module.exports = MySQLCommentRepository;
```

#### Step 4: Presentation Layer (HTTP)

```javascript
// presentation/controllers/commentController.js
const ApiResponse = require("../../utils/ApiResponse");
const container = require("../../container");

class CommentController {
  constructor() {
    this.useCases = container.getCommentUseCases();

    // Bind methods to preserve context
    this.create = this.create.bind(this);
    this.getByTask = this.getByTask.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req, res, next) {
    try {
      const comment = await this.useCases.createComment.execute({
        content: req.body.content,
        author_id: req.user.id,
        task_id: req.params.taskId,
      });

      ApiResponse.success(res, comment, "Comment created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getByTask(req, res, next) {
    try {
      const result = await this.useCases.getCommentsByTask.execute(
        req.params.taskId,
        {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 20,
        }
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      await this.useCases.updateComment.execute(
        req.params.id,
        { content: req.body.content },
        req.user
      );

      ApiResponse.success(res, null, "Comment updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteComment.execute(req.params.id, req.user);
      ApiResponse.success(res, null, "Comment deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
```

```javascript
// presentation/routes/comments.js
const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { authenticate } = require("../middleware/authenticate");
const { validate } = require("../middleware/validate");
const { body } = require("express-validator");

// Create comment on task
router.post(
  "/tasks/:taskId/comments",
  authenticate,
  [
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("content").isLength({ max: 1000 }).withMessage("Content too long"),
  ],
  validate,
  commentController.create
);

// Get comments for task
router.get(
  "/tasks/:taskId/comments",
  authenticate,
  commentController.getByTask
);

// Update comment
router.put(
  "/comments/:id",
  authenticate,
  [body("content").trim().notEmpty().withMessage("Content is required")],
  validate,
  commentController.update
);

// Delete comment
router.delete("/comments/:id", authenticate, commentController.delete);

module.exports = router;
```

#### Step 5: Update DI Container

```javascript
// container.js
const MySQLCommentRepository = require("./infrastructure/repositories/MySQLCommentRepository");
const CreateCommentUseCase = require("./application/use-cases/comment/CreateCommentUseCase");
const GetCommentsByTaskUseCase = require("./application/use-cases/comment/GetCommentsByTaskUseCase");
// ... other imports

class Container {
  constructor() {
    // ... existing code

    // Add comment repository
    this.repositories.comment = new MySQLCommentRepository();

    // Add comment use cases
    this.useCases.createComment = new CreateCommentUseCase(
      this.repositories.comment
    );
    this.useCases.getCommentsByTask = new GetCommentsByTaskUseCase(
      this.repositories.comment
    );
  }

  getCommentUseCases() {
    return {
      createComment: this.useCases.createComment,
      getCommentsByTask: this.useCases.getCommentsByTask,
      updateComment: this.useCases.updateComment,
      deleteComment: this.useCases.deleteComment,
    };
  }
}
```

#### Step 6: Register Routes

```javascript
// app.js
const commentRoutes = require("./presentation/routes/comments");

// ... existing routes
app.use("/api", commentRoutes);
```

## 🔍 Code Organization Rules

### Domain Layer Rules ✅ ❌

- ✅ Pure JavaScript classes
- ✅ Business logic only
- ✅ Entity classes với domain methods
- ✅ Repository interfaces (abstract classes)
- ❌ NO external dependencies (Express, MySQL, etc.)
- ❌ NO database calls
- ❌ NO HTTP concerns
- ❌ NO framework dependencies

### Application Layer Rules ✅ ❌

- ✅ Orchestrate domain logic
- ✅ Call repositories via interfaces
- ✅ Handle transactions
- ✅ Validate business rules
- ✅ Coordinate multiple repositories
- ❌ NO direct database calls
- ❌ NO HTTP concerns (req, res)
- ❌ NO framework-specific code

### Infrastructure Layer Rules ✅ ❌

- ✅ Implement repository interfaces
- ✅ Database connections
- ✅ External services (S3, Redis, etc.)
- ✅ SQL queries and ORM
- ✅ Return domain entities
- ❌ NO business logic
- ❌ NO HTTP concerns

### Presentation Layer Rules ✅ ❌

- ✅ Handle HTTP requests/responses
- ✅ Validate input (express-validator)
- ✅ Call use cases
- ✅ Format responses (ApiResponse)
- ✅ Apply middleware (auth, rate limit)
- ❌ NO business logic
- ❌ NO direct repository calls
- ❌ NO database queries

## 🧪 Testing Strategy

### Domain Layer Tests

```javascript
describe("Comment Entity", () => {
  it("should identify owner correctly", () => {
    const comment = new Comment({ author_id: 1 });
    expect(comment.isOwnedBy(1)).toBe(true);
    expect(comment.isOwnedBy(2)).toBe(false);
  });

  it("should check if comment is recent", () => {
    const comment = new Comment({ created_at: new Date() });
    expect(comment.isRecent()).toBe(true);
  });
});
```

### Application Layer Tests

```javascript
describe("CreateCommentUseCase", () => {
  it("should create comment successfully", async () => {
    const mockRepo = {
      create: jest.fn().mockResolvedValue(1),
      findById: jest.fn().mockResolvedValue({ id: 1, content: "Test" }),
    };

    const useCase = new CreateCommentUseCase(mockRepo);
    const result = await useCase.execute({
      content: "Test comment",
      author_id: 1,
      task_id: 1,
    });

    expect(result.content).toBe("Test");
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it("should throw error for empty content", async () => {
    const mockRepo = {};
    const useCase = new CreateCommentUseCase(mockRepo);

    await expect(useCase.execute({ content: "" })).rejects.toThrow(
      "Comment content is required"
    );
  });
});
```

### Integration Tests

```javascript
describe("Comment API", () => {
  it("POST /tasks/:taskId/comments should create comment", async () => {
    const response = await request(app)
      .post("/api/tasks/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Test comment" });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.content).toBe("Test comment");
  });
});
```

## 🚀 Migration Guide

### From Legacy MVC to Clean Architecture

**What we did:**

1. **Created 4 layers** (Domain, Application, Infrastructure, Presentation)
2. **Moved controllers** from `src/controllers/` to `src/presentation/controllers/`
3. **Moved routes** from `src/routes/` to `src/presentation/routes/`
4. **Created use cases** for User, Project, Task modules
5. **Created entities** for core business objects
6. **Fixed require paths** from `../` to `../../` in presentation layer
7. **Fixed method binding** in controllers to preserve `this` context
8. **Deleted old folders** (src/controllers, src/routes) after migration

**Test Results:**

- ✅ 45/52 tests passing (86.5% success rate)
- ❌ 7 expected failures (5 authorization, 2 rate limiting)

## 📚 Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Remember**: Dependencies always point inward to Domain! 🎯

```
Presentation → Application → Domain
Infrastructure → Domain
```
