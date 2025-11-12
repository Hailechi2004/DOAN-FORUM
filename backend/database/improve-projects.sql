-- Cải tiến bảng projects
-- Note: IF NOT EXISTS không work với ADD COLUMN, nên phải check manually hoặc bỏ qua lỗi nếu đã tồn tại

-- Thêm team_id
ALTER TABLE projects 
ADD COLUMN team_id BIGINT NULL AFTER department_id;

-- Thêm priority
ALTER TABLE projects 
ADD COLUMN priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' AFTER status;

-- Thêm progress
ALTER TABLE projects 
ADD COLUMN progress INT DEFAULT 0 COMMENT 'Progress percentage 0-100' AFTER priority;

-- Thêm attachments
ALTER TABLE projects 
ADD COLUMN attachments JSON NULL COMMENT 'Project attachments/documents' AFTER budget;

-- Thêm metadata  
ALTER TABLE projects 
ADD COLUMN metadata JSON NULL COMMENT 'Additional project metadata' AFTER attachments;

-- Cải tiến bảng project_members
ALTER TABLE project_members
ADD COLUMN status ENUM('active', 'inactive', 'left') DEFAULT 'active' AFTER role;

ALTER TABLE project_members
ADD COLUMN contribution_hours DECIMAL(10,2) DEFAULT 0 COMMENT 'Hours contributed' AFTER status;

ALTER TABLE project_members
ADD COLUMN notes TEXT NULL AFTER contribution_hours;

ALTER TABLE project_members
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER joined_at;

-- Tạo bảng project_tasks (nếu chưa có)
CREATE TABLE IF NOT EXISTS project_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to BIGINT,
  status ENUM('todo', 'in_progress', 'review', 'completed', 'blocked') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  start_date DATE,
  due_date DATE,
  completed_at DATETIME,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  parent_task_id BIGINT NULL COMMENT 'For subtasks',
  order_index INT DEFAULT 0,
  created_by BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_project (project_id),
  INDEX idx_assigned (assigned_to),
  INDEX idx_status (status)
);

-- Tạo bảng project_milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status ENUM('pending', 'completed', 'missed') DEFAULT 'pending',
  completed_at DATETIME,
  order_index INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project (project_id)
);

-- Tạo bảng project_comments
CREATE TABLE IF NOT EXISTS project_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  comment TEXT NOT NULL,
  parent_id BIGINT NULL COMMENT 'For replies',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES project_comments(id) ON DELETE CASCADE,
  INDEX idx_project (project_id),
  INDEX idx_user (user_id)
);

-- Tạo bảng project_files
CREATE TABLE IF NOT EXISTS project_files (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT COMMENT 'Size in bytes',
  file_type VARCHAR(100),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_project (project_id)
);

-- Tạo bảng project_activity_logs
CREATE TABLE IF NOT EXISTS project_activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  user_id BIGINT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) COMMENT 'project, task, member, file, etc',
  entity_id BIGINT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_project (project_id),
  INDEX idx_created (created_at)
);

