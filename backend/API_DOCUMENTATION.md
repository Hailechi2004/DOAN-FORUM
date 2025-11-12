# 🚀 API Documentation - Company Forum System

## 📋 Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [WebSocket Events](#websocket-events)
- [REST API Endpoints](#rest-api-endpoints)
  - [Authentication](#auth-endpoints)
  - [Users](#user-endpoints)
  - [Posts](#post-endpoints)
  - [Comments](#comment-endpoints)
  - [Messages](#message-endpoints)
  - [Notifications](#notification-endpoints)
  - [Departments](#department-endpoints)
  - [Meetings](#meeting-endpoints)
  - [Reports](#report-endpoints)

---

## Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://your-domain.com/api/v1
WebSocket:   ws://localhost:3000 or wss://your-domain.com
```

## Authentication

### JWT Token Structure
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

### Headers
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## WebSocket Events

### Connection
```javascript
// Client connects
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Server acknowledges
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### User Status Events

#### Client → Server
```javascript
// Set user online
socket.emit('user:online');

// Set user offline
socket.emit('user:offline');

// Update status
socket.emit('user:status', { status: 'away' });
```

#### Server → Client
```javascript
// User status changed
socket.on('user:status', (data) => {
  // data: { userId, status: 'online|offline|away', lastSeen }
});

// Multiple users status
socket.on('users:status:bulk', (data) => {
  // data: [{ userId, status, lastSeen }, ...]
});
```

### Typing Indicators

#### Client → Server
```javascript
// Start typing
socket.emit('typing:start', { 
  conversationId: 123 
});

// Stop typing
socket.emit('typing:stop', { 
  conversationId: 123 
});
```

#### Server → Client
```javascript
// Someone is typing
socket.on('typing:indicator', (data) => {
  // data: { userId, username, conversationId, isTyping: true|false }
});
```

### Message Events

#### Client → Server
```javascript
// Send message
socket.emit('message:send', {
  conversationId: 123,
  content: 'Hello!',
  attachments: [1, 2, 3] // file IDs
});

// Mark as read
socket.emit('message:read', {
  messageId: 456
});
```

#### Server → Client
```javascript
// New message received
socket.on('message:new', (data) => {
  // data: { message object }
});

// Message read receipt
socket.on('message:read', (data) => {
  // data: { messageId, userId, readAt }
});
```

### Post Events

#### Client → Server
```javascript
// User viewing post
socket.emit('post:view', { postId: 789 });

// React to post
socket.emit('post:react', { 
  postId: 789, 
  reactionType: 'like' 
});
```

#### Server → Client
```javascript
// Post updated
socket.on('post:updated', (data) => {
  // data: { postId, action: 'created|updated|deleted' }
});

// New comment
socket.on('post:comment:new', (data) => {
  // data: { postId, comment object }
});

// Reaction updated
socket.on('post:reaction:updated', (data) => {
  // data: { postId, reactions: { like: 10, love: 5, ... } }
});
```

### Notification Events

#### Server → Client
```javascript
// New notification
socket.on('notification:new', (data) => {
  // data: { notification object }
});

// Notification read
socket.on('notification:read', (data) => {
  // data: { notificationId }
});

// Bulk notification update
socket.on('notification:bulk', (data) => {
  // data: { unreadCount, notifications: [...] }
});
```

### Room Management

```javascript
// Join department room (automatic)
socket.emit('join:department', { departmentId: 1 });

// Join conversation room
socket.emit('join:conversation', { conversationId: 123 });

// Leave room
socket.emit('leave:room', { room: 'conversation:123' });
```

---

## REST API Endpoints

## Auth Endpoints

### POST /auth/register
Register new user account

**Request:**
```json
{
  "username": "john.doe",
  "email": "john@company.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "employeeCode": "EMP001",
  "departmentId": 1,
  "position": "Developer"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john.doe",
      "email": "john@company.com",
      "profile": {
        "fullName": "John Doe",
        "avatar": null
      }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

### POST /auth/login
Login to system

**Request:**
```json
{
  "email": "john@company.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john.doe",
      "email": "john@company.com",
      "isOnline": true,
      "roles": ["Employee"],
      "permissions": ["posts.create", "comments.create"]
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

### POST /auth/refresh
Refresh access token

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

### POST /auth/logout
Logout user

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/forgot-password
Request password reset

**Request:**
```json
{
  "email": "john@company.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### POST /auth/reset-password
Reset password with token

**Request:**
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`

---

## User Endpoints

### GET /users/me
Get current user profile

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john.doe",
    "email": "john@company.com",
    "status": "active",
    "isOnline": true,
    "lastSeen": "2025-11-02T10:30:00Z",
    "profile": {
      "fullName": "John Doe",
      "avatar": "https://cdn.example.com/avatars/1.jpg",
      "coverPhoto": "https://cdn.example.com/covers/1.jpg",
      "bio": "Senior Developer",
      "phone": "+84 123 456 789",
      "birthDate": "1990-01-01",
      "gender": "male"
    },
    "employee": {
      "employeeCode": "EMP001",
      "position": "Senior Developer",
      "department": {
        "id": 1,
        "name": "IT Department"
      },
      "startDate": "2020-01-01"
    },
    "stats": {
      "postsCount": 45,
      "commentsCount": 234,
      "reactionsReceived": 567
    }
  }
}
```

### PUT /users/me
Update current user profile

**Request:**
```json
{
  "profile": {
    "fullName": "John Doe Updated",
    "bio": "Senior Full-stack Developer",
    "phone": "+84 987 654 321"
  }
}
```

**Response:** `200 OK`

### POST /users/me/avatar
Upload avatar

**Content-Type:** `multipart/form-data`

**Request:**
```
avatar: <file>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.example.com/avatars/1.jpg"
  }
}
```

### POST /users/me/cover
Upload cover photo

**Content-Type:** `multipart/form-data`

**Response:** `200 OK`

### GET /users/:userId
Get user profile by ID

**Response:** `200 OK`

### GET /users
Search/list users

**Query Parameters:**
- `search` - Search by name/username
- `departmentId` - Filter by department
- `status` - Filter by status (active/suspended)
- `isOnline` - Filter online users
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### POST /users/:userId/connect
Send friend request

**Response:** `201 Created`

### PUT /users/:userId/connect
Accept/reject friend request

**Request:**
```json
{
  "action": "accept" // or "reject"
}
```

**Response:** `200 OK`

### DELETE /users/:userId/connect
Remove connection

**Response:** `200 OK`

### GET /users/me/connections
Get user connections

**Query:** `status=accepted|pending|blocked`

**Response:** `200 OK`

---

## Post Endpoints

### GET /posts
Get feed posts

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `departmentId` - Filter by department
- `categoryId` - Filter by category
- `authorId` - Filter by author
- `visibility` - Filter by visibility
- `hashtag` - Filter by hashtag

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Welcome to our forum",
        "content": "This is the first post...",
        "category": {
          "id": 1,
          "name": "Announcement",
          "code": "announcement"
        },
        "author": {
          "id": 1,
          "username": "john.doe",
          "fullName": "John Doe",
          "avatar": "..."
        },
        "department": {
          "id": 1,
          "name": "IT Department"
        },
        "visibility": "company",
        "attachments": [
          {
            "id": 1,
            "type": "image",
            "url": "...",
            "thumbnail": "..."
          }
        ],
        "hashtags": ["#welcome", "#announcement"],
        "mentions": [
          {
            "userId": 2,
            "username": "jane.doe"
          }
        ],
        "reactions": {
          "like": 10,
          "love": 5,
          "total": 15
        },
        "stats": {
          "viewCount": 100,
          "commentCount": 25,
          "shareCount": 3
        },
        "userReaction": "like", // current user's reaction
        "isPinned": false,
        "createdAt": "2025-11-02T10:00:00Z",
        "updatedAt": "2025-11-02T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### POST /posts
Create new post

**Content-Type:** `multipart/form-data`

**Request:**
```json
{
  "title": "My New Post",
  "content": "Post content here...",
  "categoryId": 2,
  "visibility": "company",
  "departmentId": 1,
  "hashtags": ["#tech", "#innovation"],
  "mentions": [2, 3, 4], // user IDs
  "attachments": [<files>]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "post": { /* post object */ }
  }
}
```

### GET /posts/:postId
Get post by ID

**Response:** `200 OK`

### PUT /posts/:postId
Update post

**Response:** `200 OK`

### DELETE /posts/:postId
Delete post (soft delete)

**Response:** `200 OK`

### POST /posts/:postId/react
React to post

**Request:**
```json
{
  "reactionType": "like" // like, love, haha, sad, angry
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reactions": {
      "like": 11,
      "love": 5,
      "total": 16
    },
    "userReaction": "like"
  }
}
```

### DELETE /posts/:postId/react
Remove reaction

**Response:** `200 OK`

### POST /posts/:postId/share
Share post

**Request:**
```json
{
  "comment": "Check this out!",
  "visibility": "company"
}
```

**Response:** `201 Created`

### POST /posts/:postId/save
Save post for later

**Response:** `201 Created`

### DELETE /posts/:postId/save
Unsave post

**Response:** `200 OK`

### GET /posts/saved
Get saved posts

**Response:** `200 OK`

### POST /posts/:postId/pin
Pin post (admin/manager only)

**Request:**
```json
{
  "duration": 7 // days
}
```

**Response:** `200 OK`

---

## Comment Endpoints

### GET /posts/:postId/comments
Get comments for post

**Query:**
- `page` - Page number
- `limit` - Items per page
- `sortBy` - Sort by (createdAt, reactions)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "Great post!",
        "author": {
          "id": 2,
          "username": "jane.doe",
          "fullName": "Jane Doe",
          "avatar": "..."
        },
        "parentId": null,
        "depth": 0,
        "replies": [
          {
            "id": 2,
            "content": "Thanks!",
            "author": { /* ... */ },
            "parentId": 1,
            "depth": 1,
            "replies": []
          }
        ],
        "reactions": {
          "like": 5,
          "total": 5
        },
        "userReaction": null,
        "createdAt": "2025-11-02T10:15:00Z",
        "edited": false
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### POST /posts/:postId/comments
Create comment

**Request:**
```json
{
  "content": "Great post!",
  "parentId": null, // or parent comment ID for reply
  "attachments": [<files>]
}
```

**Response:** `201 Created`

### PUT /comments/:commentId
Update comment

**Response:** `200 OK`

### DELETE /comments/:commentId
Delete comment

**Response:** `200 OK`

### POST /comments/:commentId/react
React to comment

**Response:** `200 OK`

### DELETE /comments/:commentId/react
Remove reaction from comment

**Response:** `200 OK`

---

## Message Endpoints

### GET /conversations
Get user's conversations

**Query:**
- `page`, `limit`
- `type` - dm or group

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "type": "dm",
        "title": null,
        "avatar": null,
        "participants": [
          {
            "userId": 1,
            "username": "john.doe",
            "fullName": "John Doe",
            "avatar": "...",
            "isOnline": true,
            "lastSeen": "..."
          }
        ],
        "lastMessage": {
          "id": 123,
          "content": "Hello!",
          "sender": { /* ... */ },
          "createdAt": "2025-11-02T11:00:00Z"
        },
        "unreadCount": 3,
        "updatedAt": "2025-11-02T11:00:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### POST /conversations
Create conversation

**Request:**
```json
{
  "type": "dm", // or "group"
  "participantIds": [2, 3],
  "title": "Project Discussion" // for group only
}
```

**Response:** `201 Created`

### GET /conversations/:conversationId
Get conversation details

**Response:** `200 OK`

### GET /conversations/:conversationId/messages
Get messages in conversation

**Query:**
- `page`, `limit`
- `before` - Get messages before messageId (pagination)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 123,
        "content": "Hello!",
        "sender": {
          "id": 1,
          "username": "john.doe",
          "fullName": "John Doe",
          "avatar": "..."
        },
        "attachments": [
          {
            "id": 1,
            "type": "image",
            "url": "...",
            "thumbnail": "..."
          }
        ],
        "readBy": [
          {
            "userId": 2,
            "readAt": "2025-11-02T11:01:00Z"
          }
        ],
        "createdAt": "2025-11-02T11:00:00Z",
        "edited": false
      }
    ],
    "pagination": {
      "hasMore": true,
      "nextCursor": 122
    }
  }
}
```

### POST /conversations/:conversationId/messages
Send message

**Content-Type:** `multipart/form-data`

**Request:**
```json
{
  "content": "Hello!",
  "attachments": [<files>]
}
```

**Response:** `201 Created`

### PUT /messages/:messageId
Edit message

**Response:** `200 OK`

### DELETE /messages/:messageId
Delete message

**Response:** `200 OK`

### POST /messages/:messageId/read
Mark message as read

**Response:** `200 OK`

### POST /conversations/:conversationId/read-all
Mark all messages as read

**Response:** `200 OK`

---

## Notification Endpoints

### GET /notifications
Get user notifications

**Query:**
- `page`, `limit`
- `isRead` - Filter by read status
- `type` - Filter by type

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "post_comment",
        "actor": {
          "id": 2,
          "username": "jane.doe",
          "fullName": "Jane Doe",
          "avatar": "..."
        },
        "referenceType": "post",
        "referenceId": 123,
        "payload": {
          "postTitle": "My Post",
          "commentText": "Nice post!"
        },
        "isRead": false,
        "createdAt": "2025-11-02T11:30:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": { /* ... */ }
  }
}
```

### GET /notifications/unread-count
Get unread notification count

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### PUT /notifications/:notificationId/read
Mark notification as read

**Response:** `200 OK`

### POST /notifications/read-all
Mark all notifications as read

**Response:** `200 OK`

### GET /notifications/preferences
Get notification preferences

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "preferences": [
      {
        "type": "post_comment",
        "enabled": true,
        "emailEnabled": true,
        "pushEnabled": true
      }
    ]
  }
}
```

### PUT /notifications/preferences
Update notification preferences

**Request:**
```json
{
  "preferences": [
    {
      "type": "post_comment",
      "enabled": true,
      "emailEnabled": false,
      "pushEnabled": true
    }
  ]
}
```

**Response:** `200 OK`

---

## Department Endpoints

### GET /departments
Get all departments

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": 1,
        "name": "IT Department",
        "code": "IT",
        "description": "Information Technology",
        "manager": {
          "id": 5,
          "fullName": "Manager Name",
          "avatar": "..."
        },
        "parentId": null,
        "children": [
          {
            "id": 2,
            "name": "Development Team",
            "code": "DEV"
          }
        ],
        "memberCount": 15,
        "isActive": true
      }
    ]
  }
}
```

### POST /departments
Create department (admin only)

**Request:**
```json
{
  "name": "New Department",
  "code": "NEW",
  "description": "Department description",
  "parentId": 1,
  "managerId": 5
}
```

**Response:** `201 Created`

### GET /departments/:departmentId
Get department details

**Response:** `200 OK`

### PUT /departments/:departmentId
Update department

**Response:** `200 OK`

### DELETE /departments/:departmentId
Delete department

**Response:** `200 OK`

### GET /departments/:departmentId/members
Get department members

**Response:** `200 OK`

### GET /departments/:departmentId/announcements
Get department announcements

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": 1,
        "title": "Important Update",
        "content": "Please read...",
        "priority": "high",
        "author": { /* ... */ },
        "publishedAt": "2025-11-02T09:00:00Z",
        "expiresAt": "2025-11-09T09:00:00Z",
        "isPinned": true,
        "readCount": 12,
        "totalRecipients": 15,
        "userHasRead": false
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### POST /departments/:departmentId/announcements
Create department announcement (manager only)

**Request:**
```json
{
  "title": "Important Update",
  "content": "Please read this...",
  "priority": "high",
  "expiresAt": "2025-11-09T09:00:00Z"
}
```

**Response:** `201 Created`

### POST /announcements/:announcementId/read
Mark announcement as read

**Response:** `200 OK`

---

## Meeting Endpoints

### GET /meetings
Get user's meetings

**Query:**
- `page`, `limit`
- `startDate`, `endDate` - Filter by date range
- `status` - Filter by attendee status
- `departmentId` - Filter by department

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "meetings": [
      {
        "id": 1,
        "title": "Sprint Planning",
        "description": "Q4 Sprint Planning Meeting",
        "organizer": { /* ... */ },
        "department": { /* ... */ },
        "startTime": "2025-11-05T09:00:00Z",
        "endTime": "2025-11-05T10:00:00Z",
        "location": "Meeting Room A",
        "meetingLink": "https://zoom.us/j/123456",
        "attendees": [
          {
            "user": { /* ... */ },
            "status": "accepted",
            "respondedAt": "..."
          }
        ],
        "attachments": [
          {
            "id": 1,
            "name": "agenda.pdf",
            "url": "..."
          }
        ],
        "userStatus": "invited",
        "isCancelled": false
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### POST /meetings
Create meeting

**Content-Type:** `multipart/form-data`

**Request:**
```json
{
  "title": "Sprint Planning",
  "description": "Q4 Sprint Planning",
  "departmentId": 1,
  "startTime": "2025-11-05T09:00:00Z",
  "endTime": "2025-11-05T10:00:00Z",
  "location": "Meeting Room A",
  "meetingLink": "https://zoom.us/j/123456",
  "attendeeIds": [1, 2, 3, 4],
  "attachments": [<files>]
}
```

**Response:** `201 Created`

### GET /meetings/:meetingId
Get meeting details

**Response:** `200 OK`

### PUT /meetings/:meetingId
Update meeting

**Response:** `200 OK`

### DELETE /meetings/:meetingId
Cancel meeting

**Response:** `200 OK`

### PUT /meetings/:meetingId/respond
Respond to meeting invitation

**Request:**
```json
{
  "status": "accepted" // accepted, declined, tentative
}
```

**Response:** `200 OK`

---

## Report Endpoints

### GET /reports
Get reports (admin/manager)

**Query:**
- `page`, `limit`
- `status` - Filter by status
- `targetType` - Filter by type
- `departmentId` - Filter by department

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "reporter": { /* ... */ },
        "targetType": "post",
        "targetId": 123,
        "target": {
          "id": 123,
          "title": "Reported Post",
          "content": "...",
          "author": { /* ... */ }
        },
        "reason": "Spam",
        "details": "This post contains spam content",
        "status": "open",
        "handledBy": null,
        "createdAt": "2025-11-02T12:00:00Z",
        "resolvedAt": null
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### POST /reports
Create report

**Request:**
```json
{
  "targetType": "post",
  "targetId": 123,
  "reason": "Spam",
  "details": "This post contains spam content"
}
```

**Response:** `201 Created`

### GET /reports/:reportId
Get report details

**Response:** `200 OK`

### PUT /reports/:reportId
Update report status (admin/manager)

**Request:**
```json
{
  "status": "resolved",
  "resolutionNote": "Post has been removed"
}
```

**Response:** `200 OK`

---

## File Upload Endpoints

### POST /files/upload
Upload file

**Content-Type:** `multipart/form-data`

**Request:**
```
file: <file>
type: image|video|document
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "file": {
      "id": 1,
      "url": "https://cdn.example.com/files/xyz.jpg",
      "thumbnail": "https://cdn.example.com/files/xyz_thumb.jpg",
      "originalName": "image.jpg",
      "mimeType": "image/jpeg",
      "size": 102400
    }
  }
}
```

### DELETE /files/:fileId
Delete file

**Response:** `200 OK`

---

## Search Endpoints

### GET /search
Global search

**Query:**
- `q` - Search query
- `type` - Filter by type (posts, users, all)
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "users": [...],
    "departments": [...],
    "total": 45
  }
}
```

### GET /search/hashtags
Search hashtags

**Query:**
- `q` - Search query
- `limit`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hashtags": [
      {
        "tag": "tech",
        "usageCount": 123
      }
    ]
  }
}
```

---

## Analytics Endpoints (Admin/Manager)

### GET /analytics/dashboard
Get dashboard analytics

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "activeUsers": 250,
    "totalPosts": 1234,
    "totalComments": 5678,
    "todayActivity": {
      "posts": 15,
      "comments": 67,
      "activeUsers": 120
    },
    "topHashtags": [
      { "tag": "tech", "count": 45 }
    ],
    "topContributors": [
      { "user": { /* ... */ }, "score": 890 }
    ]
  }
}
```

### GET /analytics/department/:departmentId
Get department analytics

**Response:** `200 OK`

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Rate Limiting

```
Global: 100 requests per minute
Auth: 5 login attempts per 15 minutes
Upload: 10 files per minute
```

**Response Header:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699012345
```

---

## Pagination

Standard pagination format:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## WebSocket Authentication

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

// Reconnect with new token
socket.auth.token = newAccessToken;
socket.connect();
```

---

**Last Updated:** November 2, 2025  
**API Version:** v1
