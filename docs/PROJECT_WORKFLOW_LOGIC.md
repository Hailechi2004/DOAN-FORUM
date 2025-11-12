# Project Workflow Logic: Admin → Manager → Employee

## Tổng Quan

Hệ thống quản lý dự án với 3 roles chính và quyền hạn phân cấp rõ ràng.

---

## 1. ADMIN (Administrator)

### Quyền Hạn

- **Toàn quyền** quản lý projects
- Tạo, sửa, xóa projects
- Assign departments vào projects
- Xem tất cả thông tin projects

### Chức Năng Chi Tiết

#### File: `frontend/src/pages/admin/ProjectDetail.jsx` (1084 dòng, 12 tabs)

**Tabs:**

1. **Overview** - Thông tin tổng quan project
2. **Tasks** - Quản lý tasks (tạo, sửa, xóa)
3. **Milestones** - Quản lý milestones
4. **Comments** - Đọc và viết comments
5. **Files** - Upload/download files
6. **Activities** - Xem activity logs
7. **Members** - Quản lý members
8. **Departments** - **Assign departments to project** ⭐
9. **Công Việc Phòng Ban** - Workflow tasks cho departments
10. **Công Việc Nhân Viên** - Workflow tasks cho employees
11. **Báo Cáo** - Task reports và analytics
12. **Cảnh Báo** - Warnings và alerts

**Điểm Đặc Biệt:**

- Có button **"Assign Departments"** trong tab Departments
- Sử dụng `AssignDepartmentsDialog` component
- Gọi API: `POST /projects/:id/departments` với `department_ids[]`

```javascript
// Admin assigns departments
await axiosInstance.post(`/projects/${id}/departments`, {
  department_ids: [1, 2, 3], // Multiple departments
});
```

**Backend Logic:**

- Route: `POST /projects/:id/departments` (Admin only)
- Controller: `projectDepartmentController.assignDepartments()`
- Model: `ProjectDepartment.assignDepartments()`
- Insert vào `project_departments` table với status = **'pending'**
- Gửi notification đến department managers

---

## 2. MANAGER (Department Manager)

### Quyền Hạn

- **Xem** projects được assign cho department của mình
- **Accept/Reject** project invitations từ Admin
- **Assign teams & members** vào projects sau khi accept
- **Comment** và tương tác với project
- **Không thể** tạo/sửa/xóa projects
- **Không thể** assign departments (Admin only)

### Chức Năng Chi Tiết

#### File: `frontend/src/pages/manager/ProjectDetail_Full.jsx` (820+ dòng, 12 tabs)

**Tabs:** (Giống Admin nhưng khác quyền)

1. **Overview** - View only (no edit button)
2. **Tasks** - View only (no create/delete)
3. **Milestones** - View only
4. **Comments** - **CÓ THỂ POST** comments ✅
5. **Files** - Upload/download files ✅
6. **Activities** - View logs
7. **Members** - View members
8. **Departments** - View + **Accept/Reject invitations** ⭐⭐⭐
9. **Công Việc Phòng Ban** - Manage department tasks
10. **Công Việc Nhân Viên** - Manage member tasks
11. **Báo Cáo** - View reports
12. **Cảnh Báo** - View warnings

**Điểm Đặc Biệt - Tab Departments:**

```jsx
// Manager sees pending invitations for THEIR department
{
  dept.status === "pending" &&
    dept.department_id === currentUser?.department_id && (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => handleAcceptInvitation(dept.department_id)}
        >
          Accept
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleRejectInvitation(dept.department_id, reason)}
        >
          Reject
        </Button>
      </Box>
    );
}
```

**Accept/Reject Logic:**

```javascript
// Accept invitation
const handleAcceptInvitation = async (departmentId) => {
  await axiosInstance.post(
    `/projects/${id}/departments/${departmentId}/accept`
  );
  // Update status: 'pending' → 'confirmed'
};

// Reject invitation
const handleRejectInvitation = async (departmentId, reason) => {
  await axiosInstance.post(
    `/projects/${id}/departments/${departmentId}/reject`,
    { rejection_reason: reason }
  );
  // Update status: 'pending' → 'rejected'
};
```

**Backend API:**

- Route: `POST /projects/:id/departments/:deptId/accept` (Manager only)
- Route: `POST /projects/:id/departments/:deptId/reject` (Manager only)
- Controller: `projectDepartmentController.acceptProjectInvitation()`
- Controller: `projectDepartmentController.rejectProjectInvitation()`
- Model: `ProjectDepartment.acceptInvitation()` - set status='confirmed', confirmed_by, confirmed_at
- Model: `ProjectDepartment.rejectInvitation()` - set status='rejected', rejection_reason

**Xem Projects Của Department:**

```javascript
// Manager sees projects assigned to their department
const response = await axiosInstance.get("/projects", {
  params: {
    department_id: user.department_id, // Filter by department
  },
});
```

**Backend Query:**

```sql
-- MySQLProjectRepository.getAll() với department_id filter
WHERE p.is_deleted = FALSE
  AND (p.department_id = ? OR EXISTS (
    SELECT 1 FROM project_departments pd
    WHERE pd.project_id = p.id AND pd.department_id = ?
  ))
```

---

## 3. EMPLOYEE (Nhân Viên)

### Quyền Hạn

- **Xem** projects mà họ là member
- **Update status** của tasks assigned cho họ (Mark Done/Reopen)
- **Comment** vào projects
- **Upload/download** files
- **View only** tất cả thông tin khác
- **Không thể** tạo/sửa/xóa tasks
- **Không thể** assign/manage members

### Chức Năng Chi Tiết

#### File 1: `frontend/src/pages/employee/Projects.jsx` (254 dòng)

**Danh Sách Projects:**

```javascript
// Fetch projects where employee is a member
const response = await axiosInstance.get("/projects", {
  params: {
    member_id: user.id, // ⭐ Filter by member
    search: searchQuery,
    page: page + 1,
    limit: rowsPerPage,
  },
});
```

**Backend Query:**

```sql
-- MySQLProjectRepository.getAll() với member_id filter
WHERE p.is_deleted = FALSE
  AND EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = p.id AND pm.user_id = ?
  )
```

**Table Columns:**

- Project Name
- Status (badge color)
- Priority (badge color)
- Timeline (start → end date)
- Progress (% completion bar)
- Actions (View button)

#### File 2: `frontend/src/pages/employee/ProjectDetail.jsx` (896 dòng, 8 tabs)

**Tabs:**

1. **Overview** - View project info, **real-time progress calculation**
2. **My Tasks** - Tasks assigned to employee, **CÓ NÚT "Mark Done"/"Reopen"** ⭐⭐⭐
3. **All Tasks** - View all project tasks (read-only)
4. **Milestones** - View milestones (read-only)
5. **Comments** - **CÓ THỂ POST** comments ✅
6. **Files** - **Upload và Download** files ✅
7. **Activities** - View activity logs
8. **Team Members** - View project members

**Điểm Đặc Biệt - Tab "My Tasks":**

```jsx
// Employee can update task status
<Button
  variant={task.status === "completed" ? "outlined" : "contained"}
  color={task.status === "completed" ? "inherit" : "success"}
  size="small"
  onClick={() => handleToggleTaskStatus(task)}
>
  {task.status === "completed" ? "Reopen" : "Mark Done"}
</Button>
```

```javascript
// Update task status
const handleToggleTaskStatus = async (task) => {
  const newStatus = task.status === "completed" ? "in_progress" : "completed";
  await axiosInstance.put(`/projects/${id}/tasks/${task.id}`, {
    status: newStatus,
  });
  enqueueSnackbar(
    `Task ${newStatus === "completed" ? "completed" : "reopened"}!`,
    { variant: "success" }
  );
  loadMyTasks(); // Refresh
};
```

**Load My Tasks:**

```javascript
const loadMyTasks = async () => {
  const response = await axiosInstance.get(`/projects/${id}/tasks`, {
    params: {
      assigned_to: currentUser.id, // Only tasks assigned to me
    },
  });
  setMyTasks(response.data.data || response.data || []);
};
```

**Tab "Comments":**

```jsx
// Employee can post comments
{comments.map((comment) => (
  <ListItem key={comment.id}>
    <Chip
      label={comment.user_id === currentUser?.id ? "You" : comment.user_name}
      color={comment.user_id === currentUser?.id ? "primary" : "default"}
      size="small"
    />
    <Typography>{comment.comment}</Typography>
  </ListItem>
))}

// Post comment
<TextField
  fullWidth
  multiline
  rows={3}
  value={commentText}
  onChange={(e) => setCommentText(e.target.value)}
  placeholder="Write a comment..."
/>
<Button onClick={handlePostComment}>Post Comment</Button>
```

**Tab "Files":**

```jsx
// Upload file
<input
  type="file"
  hidden
  ref={fileInputRef}
  onChange={(e) => setSelectedFile(e.target.files[0])}
/>
<Button
  variant="contained"
  startIcon={<CloudUploadIcon />}
  onClick={() => fileInputRef.current.click()}
>
  Upload File
</Button>

// Download file
<IconButton
  onClick={() => handleDownloadFile(file.id, file.file_name)}
>
  <DownloadIcon />
</IconButton>
```

---

## Database Schema

### Table: `project_departments` (Many-to-Many)

```sql
CREATE TABLE project_departments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  status ENUM('pending', 'confirmed', 'rejected', 'in_progress', 'completed') DEFAULT 'pending',
  assigned_team_id BIGINT,
  confirmed_at DATETIME,
  confirmed_by BIGINT,
  rejected_at DATETIME,
  rejection_reason TEXT,
  assigned_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (project_id, department_id)
);
```

### Table: `project_members`

```sql
CREATE TABLE project_members (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  assigned_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (project_id, user_id)
);
```

---

## API Endpoints Summary

### Projects API

| Endpoint        | Method | Role  | Mô Tả                                            |
| --------------- | ------ | ----- | ------------------------------------------------ |
| `/projects`     | GET    | All   | List projects (filter: department_id, member_id) |
| `/projects/:id` | GET    | All   | Get project details                              |
| `/projects`     | POST   | Admin | Create project                                   |
| `/projects/:id` | PUT    | Admin | Update project                                   |
| `/projects/:id` | DELETE | Admin | Delete project                                   |

### Project Departments API

| Endpoint                                   | Method | Role        | Mô Tả                      |
| ------------------------------------------ | ------ | ----------- | -------------------------- |
| `/projects/:id/departments`                | GET    | All         | Get assigned departments   |
| `/projects/:id/departments`                | POST   | **Admin**   | **Assign departments** ⭐  |
| `/projects/:id/departments/:deptId`        | DELETE | Admin       | Remove department          |
| `/projects/:id/departments/:deptId/accept` | POST   | **Manager** | **Accept invitation** ⭐⭐ |
| `/projects/:id/departments/:deptId/reject` | POST   | **Manager** | **Reject invitation** ⭐⭐ |

### Project Extensions API

| Endpoint                               | Method | Role          | Mô Tả                                    |
| -------------------------------------- | ------ | ------------- | ---------------------------------------- |
| `/projects/:id/tasks`                  | GET    | All           | List tasks (filter: assigned_to)         |
| `/projects/:id/tasks`                  | POST   | Admin/Manager | Create task                              |
| `/projects/:id/tasks/:taskId`          | PUT    | All           | **Update task** (Employee: own tasks) ⭐ |
| `/projects/:id/tasks/:taskId`          | DELETE | Admin/Manager | Delete task                              |
| `/projects/:id/comments`               | GET    | All           | List comments                            |
| `/projects/:id/comments`               | POST   | **All**       | **Post comment** ✅                      |
| `/projects/:id/files`                  | GET    | All           | List files                               |
| `/projects/:id/files`                  | POST   | **All**       | **Upload file** ✅                       |
| `/projects/:id/files/:fileId/download` | GET    | **All**       | **Download file** ✅                     |
| `/projects/:id/files/:fileId`          | DELETE | Admin/Manager | Delete file                              |

---

## Workflow Chính

### 1. Admin Tạo Project và Assign Departments

```
1. Admin tạo project mới
2. Admin vào tab "Departments"
3. Click button "Assign Departments"
4. Chọn departments từ danh sách
5. Submit → Insert vào `project_departments` với status='pending'
6. System gửi notification đến managers của departments đã chọn
```

### 2. Manager Accept/Reject Invitation

```
1. Manager đăng nhập
2. Vào menu "Projects" → thấy projects với status badge
3. Click vào project
4. Vào tab "Departments" → thấy invitation với status='pending'
5. Nếu là department của mình → thấy buttons "Accept" / "Reject"
6. Click "Accept":
   - Status: 'pending' → 'confirmed'
   - confirmed_by = manager_id
   - confirmed_at = NOW()
7. Click "Reject":
   - Nhập reason (optional)
   - Status: 'pending' → 'rejected'
   - rejection_reason = text
```

### 3. Manager Assign Members

```
1. Sau khi accept project
2. Manager assign team members vào project
3. Insert vào `project_members` table
4. Employees giờ có thể thấy project trong danh sách
```

### 4. Employee Tham Gia Project

```
1. Employee đăng nhập
2. Menu "Projects" → thấy projects mà họ là member
3. Click project → 8 tabs
4. Tab "My Tasks":
   - Thấy tasks assigned cho mình
   - Click "Mark Done" để complete task
   - Click "Reopen" để reopen task
5. Tab "Comments":
   - Viết comment về project
   - Thấy badge "You" cho comments của mình
6. Tab "Files":
   - Upload files liên quan
   - Download files của người khác
```

---

## Security & Permissions

### Backend Authorization

```javascript
// Admin only
router.post(
  "/projects/:id/departments",
  authenticate,
  authorize("admin", "System Admin", "Administrator"),
  projectDepartmentController.assignDepartments
);

// Manager only
router.post(
  "/projects/:id/departments/:deptId/accept",
  authenticate,
  authorize("manager", "Department Manager"),
  projectDepartmentController.acceptProjectInvitation
);

// All authenticated users
router.post("/projects/:id/comments", authenticate, async (req, res) => {
  // Anyone can comment
});
```

### Frontend Conditional Rendering

```jsx
// Admin sees assign button
{
  currentUser?.role === "admin" && (
    <Button onClick={() => setAssignDepartmentsDialog(true)}>
      Assign Departments
    </Button>
  );
}

// Manager sees accept/reject buttons for THEIR department only
{
  dept.status === "pending" &&
    dept.department_id === currentUser?.department_id && (
      <Button onClick={() => handleAcceptInvitation(dept.department_id)}>
        Accept
      </Button>
    );
}

// Employee can only update their own tasks
{
  task.assigned_to === currentUser?.id && (
    <Button onClick={() => handleToggleTaskStatus(task)}>Mark Done</Button>
  );
}
```

---

## Real-time Features

### Socket.io Integration

```javascript
// Manager and Admin get real-time updates
useTaskWorkflowSocket(projectId);

// Events:
-"task:created" -
  "task:updated" -
  "task:deleted" -
  "comment:posted" -
  "file:uploaded" -
  "department:accepted";
```

---

## Progress Calculation

```javascript
// Employee tab "Overview" shows real-time progress
const calculateProgress = () => {
  const totalTasks = tasks.length;
  if (totalTasks === 0) return 0;

  const completedTasks = tasks.filter(
    (t) => t.status === "completed" && t.assigned_to === currentUser.id
  ).length;

  return Math.round((completedTasks / totalTasks) * 100);
};
```

---

## Tổng Kết Logic

### ✅ Đúng Logic:

1. **Admin** có toàn quyền, assign departments
2. **Manager** accept/reject invitations, manage sau khi accept
3. **Employee** chỉ xem và tương tác với projects được assigned
4. **Comments**: Ai cũng có thể comment
5. **Files**: Ai cũng có thể upload/download
6. **Tasks**: Employee chỉ update được tasks của mình
7. **Database**: Sử dụng `project_departments` và `project_members` correctly
8. **API filtering**: `department_id` cho Manager, `member_id` cho Employee

### 🔥 Điểm Mạnh:

- Phân quyền rõ ràng 3 cấp
- Manager có thể từ chối project (workflow hợp lý)
- Employee có quyền tương tác (comment, upload, update tasks)
- Real-time updates với Socket.io
- Clean Architecture pattern trong backend
- Repository pattern với EXISTS subquery (performance tốt)

### 📝 Notes:

- Cần test API `member_id` filter hoạt động đúng
- Cần test accept/reject workflow
- Cần test file upload/download
- Frontend đã implement đầy đủ, backend APIs hoàn chỉnh
