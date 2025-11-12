# Task Workflow API - Usage Examples

## Authentication

All endpoints require JWT token in Authorization header:

```javascript
Authorization: Bearer <your_jwt_token>
```

---

## 1. Department Task Workflow

### Assign Task to Department (Admin only)

```http
POST /api/projects/30/department-tasks
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "department_id": 4,
  "title": "Develop User Authentication Module",
  "description": "Implement complete authentication system with JWT tokens",
  "priority": "high",
  "deadline": "2025-02-15",
  "estimated_hours": 120
}
```

**Response**:

```json
{
  "success": true,
  "message": "Task assigned to department successfully",
  "data": {
    "taskId": 8
  }
}
```

### Manager Accepts Task

```http
POST /api/department-tasks/8/accept
Content-Type: application/json
Authorization: Bearer <manager_token>

{
  "notes": "Team confirmed capacity. Starting immediately."
}
```

**Response**:

```json
{
  "success": true,
  "message": "Task accepted successfully",
  "data": {
    "task": {
      "id": 8,
      "status": "in_progress",
      "accepted_at": "2025-01-05T10:30:00.000Z",
      "accepted_by": 2
    }
  }
}
```

### Update Department Task Progress

```http
PATCH /api/department-tasks/8/progress
Content-Type: application/json
Authorization: Bearer <manager_token>

{
  "progress": 100,
  "actual_hours": 115
}
```

**Response**:

```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "progress": 100,
    "actual_hours": 115
  }
}
```

### Submit Department Task for Admin Approval

```http
POST /api/department-tasks/8/submit
Content-Type: application/json
Authorization: Bearer <manager_token>

{
  "notes": "All member tasks completed and tested. Ready for final approval."
}
```

**Response**:

```json
{
  "success": true,
  "message": "Task submitted for approval",
  "data": {
    "taskId": 8,
    "status": "submitted",
    "submitted_at": "2025-01-05T16:45:00.000Z"
  }
}
```

### Admin Approves Department Task

```http
POST /api/department-tasks/8/approve
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "notes": "Excellent work! Task approved and completed."
}
```

**Response**:

```json
{
  "success": true,
  "message": "Task approved successfully",
  "data": {
    "taskId": 8,
    "status": "approved",
    "approved_at": "2025-01-05T17:00:00.000Z"
  }
}
```

### Get Department Tasks for Project

```http
GET /api/projects/30/department-tasks
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 8,
        "project_id": 30,
        "department_id": 4,
        "title": "Develop User Authentication Module",
        "description": "Implement complete authentication system...",
        "status": "approved",
        "priority": "high",
        "progress": 100,
        "estimated_hours": 120,
        "actual_hours": 115,
        "deadline": "2025-02-15",
        "assigned_by": 1,
        "accepted_by": 2,
        "department_name": "Finance Department",
        "assigned_by_name": "admin"
      }
    ]
  }
}
```

---

## 2. Member Task Workflow

### Assign Task to Team Member (Manager only)

```http
POST /api/department-tasks/8/member-tasks
Content-Type: application/json
Authorization: Bearer <manager_token>

{
  "user_id": 1,
  "title": "Implement JWT Token Generation",
  "description": "Create secure JWT token generation and validation logic",
  "priority": "high",
  "deadline": "2025-02-10",
  "estimated_hours": 40
}
```

**Response**:

```json
{
  "success": true,
  "message": "Task assigned to member successfully",
  "data": {
    "taskId": 6
  }
}
```

### Member Starts Task

```http
POST /api/member-tasks/6/start
Authorization: Bearer <member_token>
```

**Response**:

```json
{
  "success": true,
  "message": "Task started successfully",
  "data": {
    "taskId": 6,
    "status": "in_progress",
    "started_at": "2025-01-05T11:00:00.000Z"
  }
}
```

### Update Member Task Progress

```http
PATCH /api/member-tasks/6/progress
Content-Type: application/json
Authorization: Bearer <member_token>

{
  "progress": 50,
  "actual_hours": 20
}
```

**Response**:

```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "progress": 50,
    "actual_hours": 20
  }
}
```

### Member Submits Task for Review

```http
POST /api/member-tasks/6/submit
Content-Type: application/json
Authorization: Bearer <member_token>

{
  "notes": "JWT generation and validation complete. All unit tests passing."
}
```

**Response**:

```json
{
  "success": true,
  "message": "Task submitted for approval",
  "data": {
    "taskId": 6,
    "status": "submitted",
    "submitted_at": "2025-01-05T15:30:00.000Z"
  }
}
```

### Manager Approves Member Task

```http
POST /api/member-tasks/6/approve
Content-Type: application/json
Authorization: Bearer <manager_token>

{
  "notes": "Code reviewed and approved. Good work!"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Task approved successfully",
  "data": {
    "taskId": 6,
    "status": "approved",
    "approved_at": "2025-01-05T16:00:00.000Z"
  }
}
```

### Get Member's Tasks

```http
GET /api/users/1/member-tasks?status=in_progress
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 6,
        "department_task_id": 8,
        "user_id": 1,
        "title": "Implement JWT Token Generation",
        "status": "in_progress",
        "priority": "high",
        "progress": 50,
        "estimated_hours": 40,
        "actual_hours": 20,
        "deadline": "2025-02-10",
        "project_name": "Enterprise System Migration",
        "department_name": "Finance Department"
      }
    ]
  }
}
```

### Get Member Workload

```http
GET /api/users/1/workload
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "total_tasks": 5,
    "in_progress": 2,
    "total_hours": 180,
    "completed_hours": 95,
    "tasks": [...]
  }
}
```

---

## 3. Task Reports

### Create Progress Report

```http
POST /api/reports
Content-Type: application/json
Authorization: Bearer <token>

{
  "project_id": 30,
  "member_task_id": 6,
  "report_type": "weekly",
  "title": "Week 1 Progress Report",
  "content": "Completed JWT token generation logic. Started work on token validation. No major blockers.",
  "progress": 50,
  "issues": null
}
```

**Response**:

```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "reportId": 5
  }
}
```

### Get Project Reports

```http
GET /api/projects/30/reports?report_type=weekly
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 5,
        "project_id": 30,
        "member_task_id": 6,
        "report_type": "weekly",
        "title": "Week 1 Progress Report",
        "content": "Completed JWT token generation logic...",
        "progress": 50,
        "created_by": 1,
        "created_at": "2025-01-05T14:00:00.000Z",
        "created_by_name": "admin"
      }
    ]
  }
}
```

### Get Reports with Issues

```http
GET /api/reports/with-issues
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 3,
        "title": "Critical Bug Report",
        "issues": "Database connection timeout in production",
        "project_name": "Enterprise System Migration",
        "created_by_name": "john_doe",
        "created_at": "2025-01-04T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 4. Warning System

### Issue Warning (Manager/Admin only)

```http
POST /api/warnings
Content-Type: application/json
Authorization: Bearer <manager_token>

{
  "project_id": 30,
  "department_task_id": 8,
  "warned_user_id": 2,
  "warning_type": "late_submission",
  "severity": "medium",
  "reason": "Task was submitted 2 days after deadline",
  "penalty_amount": 0
}
```

**Response**:

```json
{
  "success": true,
  "message": "Warning issued successfully",
  "data": {
    "warningId": 2
  }
}
```

### Get User Warnings

```http
GET /api/users/2/warnings
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "warnings": [
      {
        "id": 2,
        "project_id": 30,
        "warned_user_id": 2,
        "warning_type": "late_submission",
        "severity": "medium",
        "reason": "Task was submitted 2 days after deadline",
        "penalty_amount": 0,
        "issued_at": "2025-01-05T17:30:00.000Z",
        "acknowledged": false,
        "project_name": "Enterprise System Migration",
        "issued_by_name": "admin"
      }
    ]
  }
}
```

### Acknowledge Warning

```http
POST /api/warnings/2/acknowledge
Content-Type: application/json
Authorization: Bearer <warned_user_token>

{
  "acknowledgment_note": "Understood. Will ensure timely submissions going forward."
}
```

**Response**:

```json
{
  "success": true,
  "message": "Warning acknowledged successfully",
  "data": {
    "warningId": 2,
    "acknowledged_at": "2025-01-05T18:00:00.000Z"
  }
}
```

### Get User Warning Statistics

```http
GET /api/users/2/warning-stats
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "total_warnings": 5,
    "by_severity": {
      "low": 2,
      "medium": 2,
      "high": 1,
      "critical": 0
    },
    "by_type": {
      "late_submission": 3,
      "poor_quality": 1,
      "missed_deadline": 1
    },
    "acknowledged": 3,
    "unacknowledged": 2,
    "total_penalty": 150.0
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Only in-progress tasks can be submitted"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No token provided"
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
  "message": "Task not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to process request",
  "error": "Database connection failed"
}
```

---

## Status Values

### Department/Member Task Status

- `assigned` - Task assigned but not yet accepted/started
- `in_progress` - Work is ongoing
- `submitted` - Submitted for review/approval
- `approved` - Approved by reviewer
- `rejected` - Rejected, needs rework
- `completed` - Finalized and closed

### Priority Levels

- `low` - Can be done later
- `medium` - Normal priority
- `high` - Important, needs attention
- `critical` - Urgent, top priority

### Report Types

- `daily` - Daily progress update
- `weekly` - Weekly summary
- `monthly` - Monthly overview
- `completion` - Task completion report
- `issue` - Problem/blocker report

### Warning Types

- `late_submission` - Missed deadline
- `poor_quality` - Work quality issues
- `missed_deadline` - Deadline not met
- `incomplete_work` - Incomplete deliverables
- `other` - Other issues

### Severity Levels

- `low` - Minor issue
- `medium` - Moderate concern
- `high` - Serious issue
- `critical` - Severe problem

---

## Frontend Integration Example

```javascript
// taskService.js
import api from "@/utils/api";

export const taskService = {
  // Department Tasks
  assignToDepartment: (projectId, data) =>
    api.post(`/projects/${projectId}/department-tasks`, data),

  acceptDepartmentTask: (taskId, notes) =>
    api.post(`/department-tasks/${taskId}/accept`, { notes }),

  updateDepartmentProgress: (taskId, progress, actualHours) =>
    api.patch(`/department-tasks/${taskId}/progress`, {
      progress,
      actual_hours: actualHours,
    }),

  submitDepartmentTask: (taskId, notes) =>
    api.post(`/department-tasks/${taskId}/submit`, { notes }),

  // Member Tasks
  assignToMember: (departmentTaskId, data) =>
    api.post(`/department-tasks/${departmentTaskId}/member-tasks`, data),

  startMemberTask: (taskId) => api.post(`/member-tasks/${taskId}/start`),

  updateMemberProgress: (taskId, progress, actualHours) =>
    api.patch(`/member-tasks/${taskId}/progress`, {
      progress,
      actual_hours: actualHours,
    }),

  submitMemberTask: (taskId, notes) =>
    api.post(`/member-tasks/${taskId}/submit`, { notes }),

  // Reports
  createReport: (data) => api.post("/reports", data),

  getProjectReports: (projectId, reportType) =>
    api.get(`/projects/${projectId}/reports`, {
      params: { report_type: reportType },
    }),

  // Warnings
  issueWarning: (data) => api.post("/warnings", data),

  acknowledgeWarning: (warningId, note) =>
    api.post(`/warnings/${warningId}/acknowledge`, {
      acknowledgment_note: note,
    }),
};
```

---

**Last Updated**: January 2025  
**API Version**: 1.0.0  
**Base URL**: `http://localhost:3000/api`
