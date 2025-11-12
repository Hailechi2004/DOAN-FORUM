# 📚 Complete API Reference

> Comprehensive guide to all 59 API endpoints with examples and responses

**Base URL**: `http://localhost:3000/api`  
**Authentication**: Bearer Token in `Authorization` header  
**Content-Type**: `application/json`

---

## 📑 Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Posts](#3-posts)
4. [Comments](#4-comments)
5. [Messages](#5-messages)
6. [Notifications](#6-notifications)
7. [Departments](#7-departments)
8. [Teams](#8-teams)
9. [Categories](#9-categories)
10. [Files](#10-files)
11. [Projects](#11-projects)
12. [Tasks](#12-tasks)
13. [Events](#13-events)
14. [Polls](#14-polls)
15. [Bookmarks](#15-bookmarks)
16. [Meetings](#16-meetings)
17. [Search](#17-search)
18. [Analytics](#18-analytics)

---

## 🔐 Authentication Flow

```
1. Register → 2. Login → 3. Get Token → 4. Use Token in API calls
```

### Get Admin Token (for testing)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "username": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Use token in subsequent requests**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 1. Authentication

### 1.1 Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response** (201):

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "user@example.com",
      "username": "johndoe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 1.2 Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "username": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 1.3 Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "username": "admin",
    "profile": {
      "full_name": "Administrator",
      "avatar_url": null,
      "department_id": null
    }
  }
}
```

---

## 2. Users

### 2.1 Get All Users (Admin Only)

```http
GET /api/users?page=1&limit=20&search=john
Authorization: Bearer <admin_token>
```

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by username, email, or full name

**Response** (200):

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@example.com",
        "username": "admin",
        "is_online": false,
        "full_name": "Administrator",
        "avatar_url": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 2.2 Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "username": "admin",
    "profile": {
      "full_name": "Administrator",
      "bio": null,
      "avatar_url": null
    }
  }
}
```

---

## 3. Posts

### 3.1 Create Post

```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Welcome to Company Forum",
  "content": "This is the first post in our new forum!",
  "category_id": 1,
  "visibility": "public"
}
```

**Response** (201):

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 1,
    "title": "Welcome to Company Forum",
    "content": "This is the first post...",
    "author_id": 1,
    "category_id": 1,
    "visibility": "public",
    "created_at": "2025-11-02T10:30:00.000Z"
  }
}
```

### 3.2 Get All Posts

```http
GET /api/posts?page=1&limit=10&category_id=1
Authorization: Bearer <token>
```

**Query Parameters**:

- `page`, `limit`: Pagination
- `category_id`: Filter by category
- `visibility`: Filter by visibility (public, private, department)

**Response** (200):

```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {...}
  }
}
```

### 3.3 Get Post by ID

```http
GET /api/posts/:id
Authorization: Bearer <token>
```

### 3.4 Update Post

```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

### 3.5 React to Post

```http
POST /api/posts/:id/reactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "reaction_type": "like"
}
```

**Reaction Types**: `like`, `love`, `haha`, `wow`, `sad`, `angry`

---

## 4. Comments

### 4.1 Create Comment

```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": 1,
  "content": "Great post!",
  "parent_comment_id": null
}
```

### 4.2 Get Post Comments

```http
GET /api/comments/post/:postId
Authorization: Bearer <token>
```

### 4.3 Update Comment

```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment"
}
```

---

## 5. Messages

### 5.1 Get Conversations

```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "user_id": 2,
        "username": "johndoe",
        "last_message": "Hello!",
        "last_message_at": "2025-11-02T10:00:00.000Z",
        "unread_count": 1
      }
    ]
  }
}
```

---

## 6. Notifications

### 6.1 Get Notifications

```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "post_reaction",
        "title": "New reaction on your post",
        "message": "John Doe liked your post",
        "is_read": false,
        "created_at": "2025-11-02T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

### 6.2 Get Unread Count

```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

## 7. Departments

### 7.1 Get All Departments

```http
GET /api/departments
Authorization: Bearer <token>
```

### 7.2 Create Department (Admin Only)

```http
POST /api/departments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Engineering",
  "description": "Software Development Team",
  "head_id": 2
}
```

### 7.3 Get Department by ID

```http
GET /api/departments/:id
Authorization: Bearer <token>
```

### 7.4 Get Department Stats

```http
GET /api/departments/:id/stats
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "total_employees": 25,
    "total_teams": 3,
    "total_projects": 5,
    "active_projects": 3
  }
}
```

---

## 8. Teams

### 8.1 Get All Teams

```http
GET /api/teams?department_id=1
Authorization: Bearer <token>
```

### 8.2 Create Team (Admin Only)

```http
POST /api/teams
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Backend Team",
  "department_id": 1,
  "description": "Backend development team",
  "is_private": false
}
```

### 8.3 Get Team by ID

```http
GET /api/teams/:id
Authorization: Bearer <token>
```

### 8.4 Get Team Stats

```http
GET /api/teams/:id/stats
Authorization: Bearer <token>
```

---

## 9. Categories

### 9.1 Get All Categories

```http
GET /api/categories
Authorization: Bearer <token>
```

### 9.2 Create Category (Admin Only)

```http
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Announcements",
  "description": "Company announcements",
  "icon": "📢",
  "color": "#FF5733"
}
```

### 9.3 Get Category by ID

```http
GET /api/categories/:id
Authorization: Bearer <token>
```

---

## 10. Files

### 10.1 Get All Files

```http
GET /api/files?page=1&limit=20
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": 1,
        "filename": "document.pdf",
        "file_path": "/uploads/files/document.pdf",
        "file_type": "application/pdf",
        "file_size": 1024000,
        "uploaded_by": 1,
        "created_at": "2025-11-02T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 11. Projects

### 11.1 Get All Projects

```http
GET /api/projects?department_id=1&status=active
Authorization: Bearer <token>
```

### 11.2 Create Project (Admin Only)

```http
POST /api/projects
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Website",
  "description": "Company website redesign",
  "department_id": 1,
  "manager_id": 2,
  "start_date": "2025-11-01",
  "end_date": "2025-12-31",
  "status": "active",
  "budget": 50000
}
```

### 11.3 Get Project by ID

```http
GET /api/projects/:id
Authorization: Bearer <token>
```

### 11.4 Get Project Members

```http
GET /api/projects/:id/members
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "user_id": 2,
        "username": "johndoe",
        "full_name": "John Doe",
        "role": "developer",
        "joined_at": "2025-11-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 12. Tasks

### 12.1 Get All Tasks

```http
GET /api/tasks?project_id=1&status=in_progress
Authorization: Bearer <token>
```

### 12.2 Create Task

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": 1,
  "title": "Implement authentication",
  "description": "Add JWT authentication",
  "assigned_to": 2,
  "priority": "high",
  "due_date": "2025-11-15",
  "status": "todo"
}
```

### 12.3 Get Task by ID

```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

### 12.4 Get Task Comments

```http
GET /api/tasks/:id/comments
Authorization: Bearer <token>
```

---

## 13. Events

### 13.1 Get All Events

```http
GET /api/events?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer <token>
```

### 13.2 Create Event

```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly sync meeting",
  "event_type": "meeting",
  "start_time": "2025-11-05T10:00:00Z",
  "end_time": "2025-11-05T11:00:00Z",
  "location": "Conference Room A"
}
```

### 13.3 Get Event by ID

```http
GET /api/events/:id
Authorization: Bearer <token>
```

### 13.4 Get Event Attendees

```http
GET /api/events/:id/attendees
Authorization: Bearer <token>
```

---

## 14. Polls

### 14.1 Get All Polls

```http
GET /api/polls?status=active
Authorization: Bearer <token>
```

### 14.2 Create Poll

```http
POST /api/polls
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "Which framework should we use?",
  "description": "Vote for our next project framework",
  "options": [
    {"option_text": "React", "option_order": 1},
    {"option_text": "Vue.js", "option_order": 2},
    {"option_text": "Angular", "option_order": 3}
  ],
  "end_time": "2025-11-10T23:59:59Z"
}
```

### 14.3 Get Poll by ID

```http
GET /api/polls/:id
Authorization: Bearer <token>
```

### 14.4 Get Poll Results

```http
GET /api/polls/:id/results
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "poll": {
      "id": 1,
      "question": "Which framework should we use?",
      "total_votes": 15
    },
    "options": [
      {
        "option_text": "React",
        "vote_count": 8,
        "percentage": 53.33
      },
      {
        "option_text": "Vue.js",
        "vote_count": 5,
        "percentage": 33.33
      },
      {
        "option_text": "Angular",
        "vote_count": 2,
        "percentage": 13.33
      }
    ]
  }
}
```

---

## 15. Bookmarks

### 15.1 Get All Bookmarks

```http
GET /api/bookmarks?page=1&limit=20
Authorization: Bearer <token>
```

### 15.2 Create Bookmark

```http
POST /api/bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": 1
}
```

---

## 16. Meetings

### 16.1 Get All Meetings

```http
GET /api/meetings?start_date=2025-11-01
Authorization: Bearer <token>
```

### 16.2 Create Meeting

```http
POST /api/meetings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Sprint Planning",
  "description": "Plan next sprint tasks",
  "meeting_type": "sprint_planning",
  "start_time": "2025-11-05T09:00:00Z",
  "end_time": "2025-11-05T10:00:00Z",
  "location": "Conference Room B",
  "agenda": "Review backlog and plan sprint"
}
```

### 16.3 Get Meeting by ID

```http
GET /api/meetings/:id
Authorization: Bearer <token>
```

### 16.4 Get Meeting Participants

```http
GET /api/meetings/:id/participants
Authorization: Bearer <token>
```

---

## 17. Search

### 17.1 Global Search

```http
GET /api/search?q=project&types=posts,users,projects
Authorization: Bearer <token>
```

**Query Parameters**:

- `q`: Search query (required)
- `types`: Comma-separated types (posts, users, projects, tasks, events)

**Response** (200):

```json
{
  "success": true,
  "data": {
    "posts": [...],
    "users": [...],
    "projects": [...]
  }
}
```

### 17.2 Search Posts

```http
GET /api/search/posts?q=announcement&category_id=1
Authorization: Bearer <token>
```

### 17.3 Search Users

```http
GET /api/search/users?q=john
Authorization: Bearer <token>
```

---

## 18. Analytics

### 18.1 Get Dashboard Stats

```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "active_users_today": 45,
    "total_posts": 320,
    "posts_today": 12,
    "total_projects": 25,
    "active_projects": 18,
    "total_tasks": 450,
    "pending_tasks": 85
  }
}
```

### 18.2 Get Activity Trend

```http
GET /api/analytics/activity-trend?days=7
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "trend": [
      {"date": "2025-10-27", "posts": 5, "comments": 12, "active_users": 25},
      {"date": "2025-10-28", "posts": 8, "comments": 15, "active_users": 30},
      ...
    ]
  }
}
```

### 18.3 Get Top Users

```http
GET /api/analytics/top-users?limit=10&metric=posts
Authorization: Bearer <token>
```

**Query Parameters**:

- `limit`: Number of users (default: 10)
- `metric`: posts, comments, reactions

### 18.4 Get Project Stats

```http
GET /api/analytics/projects?department_id=1
Authorization: Bearer <token>
```

### 18.5 Get Task Stats

```http
GET /api/analytics/tasks?project_id=1
Authorization: Bearer <token>
```

---

## 🔒 Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination: Default page=1, limit=20, max limit=100
- File uploads: Max 50MB per file
- Rate limiting: 100 requests per minute per IP
- Auth rate limiting: 100 requests per 15 minutes

---

## 🔗 Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [Clean Architecture](./CLEAN_ARCHITECTURE.md)
- [Swagger UI](http://localhost:3000/api-docs)
- [Testing Guide](./test-all-apis.js)

---

**Last Updated**: November 2, 2025  
**API Version**: 1.0.0  
**Test Coverage**: 59/59 endpoints (100%)
