# 🏢 Company Forum API Documentation

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![OAS](https://img.shields.io/badge/OAS-3.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

> API Documentation for Company Forum System with Real-time Features

---

## 📋 Table of Contents

- [Servers](#-servers)
- [Authentication](#-authentication)
- [Posts](#-posts)
- [Comments](#-comments)
- [Categories](#-categories)
- [Departments](#-departments)
- [Users](#-users)
- [Notifications](#-notifications)
- [File Upload](#-file-upload)
- [WebSocket Events](#-websocket-events)
- [Response Codes](#-response-codes)

---

## 🌐 Servers

### Development Server

```
http://localhost:3000/api
```

Local development environment

### Production Server

```
https://api.company-forum.com/api
```

Production environment (Coming soon)

---

## 🔐 Authentication

### Register New User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### User Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### User Logout

```http
POST /auth/logout
```

🔒 **Authentication Required**

---

### Get Current User

```http
GET /auth/me
```

🔒 **Authentication Required**

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "user",
    "department_id": 2,
    "avatar_url": "https://..."
  }
}
```

---

## 📝 Posts

### Get All Posts

```http
GET /posts
```

**Query Parameters:**

| Parameter     | Type    | Required | Description                          |
| ------------- | ------- | -------- | ------------------------------------ |
| `page`        | integer | No       | Page number (default: 1)             |
| `limit`       | integer | No       | Items per page (default: 10)         |
| `category_id` | integer | No       | Filter by category                   |
| `search`      | string  | No       | Search in title and content          |
| `visibility`  | string  | No       | public, private, company, department |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Welcome to Company Forum",
        "content": "This is a sample post...",
        "author_id": 1,
        "author_name": "John Doe",
        "author_avatar_url": "https://...",
        "category_id": 1,
        "category_name": "Announcements",
        "visibility": "public",
        "view_count": 150,
        "comment_count": 10,
        "reaction_count": 25,
        "images": [
          {
            "id": 1,
            "file_url": "https://..."
          }
        ],
        "created_at": "2025-11-03T10:30:00Z",
        "updated_at": "2025-11-03T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

### Get Post by ID

```http
GET /posts/{id}
```

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| `id`      | integer | Yes      | Post ID     |

---

### Create New Post

```http
POST /posts
```

🔒 **Authentication Required**

**Request Body (multipart/form-data):**

| Field         | Type    | Required | Description                          |
| ------------- | ------- | -------- | ------------------------------------ |
| `title`       | string  | Yes      | Post title (max 255 chars)           |
| `content`     | string  | Yes      | Post content                         |
| `category_id` | integer | No       | Category ID                          |
| `visibility`  | string  | No       | public, private, company, department |
| `images`      | file[]  | No       | Up to 10 images (max 50MB total)     |

**Response (201):**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 123,
    "title": "New Post",
    "content": "Content here...",
    "author_id": 1,
    "images": [...]
  }
}
```

---

### Update Post

```http
PUT /posts/{id}
```

🔒 **Authentication Required** (Owner or Admin only)

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "category_id": 2,
  "visibility": "company"
}
```

---

### Delete Post

```http
DELETE /posts/{id}
```

🔒 **Authentication Required** (Owner or Admin only)

**Response (200):**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### React to Post

```http
POST /posts/{id}/reactions
```

🔒 **Authentication Required**

**Request Body:**

```json
{
  "reaction_type": "love"
}
```

**Reaction Types:**

- `like` - 👍 Like
- `love` - ❤️ Love
- `haha` - 😂 Haha
- `wow` - 😮 Wow
- `sad` - 😢 Sad
- `angry` - 😠 Angry

**Response (200):**

```json
{
  "success": true,
  "message": "Reaction added",
  "data": {
    "reaction_type": "love",
    "user_reaction": "love"
  }
}
```

> **Note:** Sending the same reaction type again will remove the reaction.

---

## 💬 Comments

### Get Comments by Post ID

```http
GET /comments/post/{post_id}
```

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| `post_id` | integer | Yes      | Post ID     |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "post_id": 123,
      "content": "Great post!",
      "author_id": 2,
      "author_name": "Jane Smith",
      "author_avatar_url": "https://...",
      "parent_id": null,
      "created_at": "2025-11-03T10:35:00Z",
      "updated_at": "2025-11-03T10:35:00Z",
      "replies": []
    }
  ]
}
```

---

### Create Comment

```http
POST /comments
```

🔒 **Authentication Required**

**Request Body:**

```json
{
  "post_id": 123,
  "content": "This is a comment",
  "parent_id": null
}
```

| Field       | Type    | Required | Description                      |
| ----------- | ------- | -------- | -------------------------------- |
| `post_id`   | integer | Yes      | Post ID                          |
| `content`   | string  | Yes      | Comment content (max 2000 chars) |
| `parent_id` | integer | No       | Parent comment ID (for replies)  |

**Response (201):**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": 456,
    "post_id": 123,
    "content": "This is a comment",
    "author_id": 1,
    "created_at": "2025-11-03T10:40:00Z"
  }
}
```

---

### Update Comment

```http
PUT /comments/{id}
```

🔒 **Authentication Required** (Owner or Admin only)

**Request Body:**

```json
{
  "content": "Updated comment content"
}
```

---

### Delete Comment

```http
DELETE /comments/{id}
```

🔒 **Authentication Required** (Owner or Admin only)

---

## 📁 Categories

### Get All Categories

```http
GET /categories
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Announcements",
      "description": "Company announcements",
      "post_count": 25,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Category by ID

```http
GET /categories/{id}
```

---

### Create Category

```http
POST /categories
```

🔒 **Admin Only**

**Request Body:**

```json
{
  "name": "New Category",
  "description": "Category description",
  "color": "#FF5733"
}
```

---

### Update Category

```http
PUT /categories/{id}
```

🔒 **Admin Only**

---

### Delete Category

```http
DELETE /categories/{id}
```

🔒 **Admin Only**

---

## 🏢 Departments

### Get All Departments

```http
GET /departments
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Engineering",
      "description": "Software development team",
      "manager_id": 5,
      "employee_count": 25
    }
  ]
}
```

---

### Get Department by ID

```http
GET /departments/{id}
```

---

### Create Department

```http
POST /departments
```

🔒 **Admin Only**

**Request Body:**

```json
{
  "name": "Marketing",
  "description": "Marketing and PR team",
  "manager_id": 10
}
```

---

### Update Department

```http
PUT /departments/{id}
```

🔒 **Admin Only**

---

### Delete Department

```http
DELETE /departments/{id}
```

🔒 **Admin Only**

---

## 👤 Users

### Get All Users

```http
GET /users
```

🔒 **Admin Only**

**Query Parameters:**

| Parameter       | Type    | Required | Description                     |
| --------------- | ------- | -------- | ------------------------------- |
| `page`          | integer | No       | Page number (default: 1)        |
| `limit`         | integer | No       | Items per page (default: 20)    |
| `role`          | string  | No       | Filter by role (admin, user)    |
| `department_id` | integer | No       | Filter by department            |
| `search`        | string  | No       | Search by name, email, username |

---

### Get User by ID

```http
GET /users/{id}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "user",
    "department_id": 2,
    "department_name": "Engineering",
    "avatar_url": "https://...",
    "bio": "Software Developer",
    "created_at": "2025-01-15T08:00:00Z",
    "post_count": 45,
    "comment_count": 120
  }
}
```

---

### Update User Profile

```http
PUT /users/{id}
```

🔒 **Authentication Required** (Own profile or Admin)

**Request Body:**

```json
{
  "full_name": "John Updated Doe",
  "bio": "Senior Software Developer",
  "phone": "+1234567890"
}
```

---

### Change Password

```http
PUT /users/{id}/password
```

🔒 **Authentication Required**

**Request Body:**

```json
{
  "current_password": "oldpass123",
  "new_password": "newpass456"
}
```

---

### Delete User

```http
DELETE /users/{id}
```

🔒 **Admin Only**

---

## 🔔 Notifications

### Get User Notifications

```http
GET /notifications
```

🔒 **Authentication Required**

**Query Parameters:**

| Parameter | Type    | Required | Description                  |
| --------- | ------- | -------- | ---------------------------- |
| `page`    | integer | No       | Page number (default: 1)     |
| `limit`   | integer | No       | Items per page (default: 20) |
| `is_read` | boolean | No       | Filter by read status        |
| `type`    | string  | No       | Filter by type               |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "comment",
        "message": "Jane Smith commented on your post",
        "data": {
          "post_id": 123,
          "comment_id": 456
        },
        "is_read": false,
        "created_at": "2025-11-03T09:30:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

**Notification Types:**

- `comment` - New comment on your post
- `reaction` - Someone reacted to your post
- `mention` - You were mentioned in a post/comment
- `reply` - Reply to your comment
- `follow` - New follower

---

### Mark Notification as Read

```http
PUT /notifications/{id}/read
```

🔒 **Authentication Required**

---

### Mark All as Read

```http
PUT /notifications/read-all
```

🔒 **Authentication Required**

---

### Delete Notification

```http
DELETE /notifications/{id}
```

🔒 **Authentication Required**

---

## 📤 File Upload

### Upload User Avatar

```http
POST /upload/avatar
```

🔒 **Authentication Required**

**Request Body (multipart/form-data):**

| Field    | Type | Required | Description                          |
| -------- | ---- | -------- | ------------------------------------ |
| `avatar` | file | Yes      | Image file (jpg, png, gif - max 5MB) |

**Response (200):**

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "https://example.com/uploads/avatars/user-1.jpg"
  }
}
```

---

### Upload Post Images

```http
POST /upload/post-images
```

🔒 **Authentication Required**

**Request Body (multipart/form-data):**

| Field    | Type   | Required | Description                      |
| -------- | ------ | -------- | -------------------------------- |
| `images` | file[] | Yes      | Up to 10 images (max 50MB total) |

---

### Upload Files

```http
POST /upload/files
```

🔒 **Authentication Required**

**Request Body (multipart/form-data):**

| Field   | Type   | Required | Description                      |
| ------- | ------ | -------- | -------------------------------- |
| `files` | file[] | Yes      | Multiple files (max 100MB total) |

**Allowed File Types:**

- Images: jpg, jpeg, png, gif, webp
- Documents: pdf, doc, docx, xls, xlsx, ppt, pptx
- Archives: zip, rar

---

## 🔌 WebSocket Events

### Connection

```javascript
const socket = io("http://localhost:3000", {
  auth: {
    token: "your-jwt-token",
  },
});
```

---

### Events to Listen

#### New Post Event

```javascript
socket.on("new_post", (data) => {
  console.log("New post created:", data);
  // data: { post_id, author_id, title, content }
});
```

---

#### New Comment Event

```javascript
socket.on("new_comment", (data) => {
  console.log("New comment:", data);
  // data: { comment_id, post_id, author_id, content }
});
```

---

#### New Reaction Event

```javascript
socket.on("new_reaction", (data) => {
  console.log("New reaction:", data);
  // data: { post_id, user_id, reaction_type }
});
```

---

#### User Online Status

```javascript
socket.on("user_status", (data) => {
  console.log("User status changed:", data);
  // data: { user_id, status: 'online' | 'offline' }
});
```

---

#### Notification Event

```javascript
socket.on("notification", (data) => {
  console.log("New notification:", data);
  // data: { type, message, data }
});
```

---

### Events to Emit

#### Join Room

```javascript
socket.emit("join_room", { room: "post_123" });
```

---

#### Leave Room

```javascript
socket.emit("leave_room", { room: "post_123" });
```

---

#### Typing Indicator

```javascript
socket.emit("typing", { post_id: 123, is_typing: true });
```

---

## 🔐 Authentication Guide

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. Register or login using `/auth/register` or `/auth/login`
2. Extract the `token` from the response
3. Include it in all subsequent requests

### Token Expiration

- Tokens expire after **24 hours**
- Refresh tokens are valid for **30 days**
- Use `/auth/refresh` to get a new token

---

## 📊 Response Codes

| Code  | Status                | Description                                      |
| ----- | --------------------- | ------------------------------------------------ |
| `200` | OK                    | Request successful                               |
| `201` | Created               | Resource created successfully                    |
| `204` | No Content            | Request successful, no content to return         |
| `400` | Bad Request           | Invalid request parameters or validation error   |
| `401` | Unauthorized          | Authentication required or token invalid/expired |
| `403` | Forbidden             | Insufficient permissions to access resource      |
| `404` | Not Found             | Requested resource does not exist                |
| `409` | Conflict              | Resource conflict (e.g., duplicate entry)        |
| `422` | Unprocessable Entity  | Request validation failed                        |
| `429` | Too Many Requests     | Rate limit exceeded                              |
| `500` | Internal Server Error | Server error occurred                            |
| `503` | Service Unavailable   | Service temporarily unavailable                  |

---

## 📝 Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Common Error Codes:**

- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ERROR` - Duplicate entry
- `RATE_LIMIT_ERROR` - Too many requests
- `SERVER_ERROR` - Internal server error

---

## 🚀 Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous users**: 100 requests per 15 minutes
- **Authenticated users**: 1000 requests per 15 minutes
- **File uploads**: 50 requests per hour

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699012800
```

---

## 📚 Additional Resources

- [GitHub Repository](https://github.com/company/forum)
- [API Changelog](./CHANGELOG.md)
- [Postman Collection](./postman_collection.json)
- [Support Email](mailto:support@company-forum.com)

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

---

**Last Updated:** November 3, 2025  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0
