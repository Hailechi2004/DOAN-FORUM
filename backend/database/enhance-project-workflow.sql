-- Enhanced project department system with task assignments and approval workflow

-- 1. Update project_departments - thêm confirmation workflow
ALTER TABLE project_departments 
ADD COLUMN confirmed_at DATETIME DEFAULT NULL AFTER status,
ADD COLUMN confirmed_by BIGINT DEFAULT NULL AFTER confirmed_at,
ADD COLUMN rejection_reason TEXT DEFAULT NULL AFTER confirmed_by,
ADD COLUMN rejected_at DATETIME DEFAULT NULL AFTER rejection_reason,
MODIFY COLUMN status ENUM('pending', 'confirmed', 'rejected', 'in_progress', 'completed') DEFAULT 'pending';

-- 2. Tạo bảng department_tasks (Nhiệm vụ của department trong project)
CREATE TABLE IF NOT EXISTS project_department_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_by BIGINT NOT NULL COMMENT 'Admin who assigned',
  status ENUM('assigned', 'in_progress', 'submitted', 'approved', 'rejected', 'completed') DEFAULT 'assigned',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  deadline DATE,
  estimated_hours INT DEFAULT 0,
  actual_hours INT DEFAULT 0,
  progress INT DEFAULT 0 COMMENT 'Progress 0-100%',
  
  -- Department response
  accepted_at DATETIME DEFAULT NULL,
  accepted_by BIGINT DEFAULT NULL COMMENT 'Manager who accepted',
  rejection_reason TEXT DEFAULT NULL,
  
  -- Submission & Approval
  submitted_at DATETIME DEFAULT NULL,
  submitted_by BIGINT DEFAULT NULL,
  submission_notes TEXT DEFAULT NULL,
  
  approved_at DATETIME DEFAULT NULL,
  approved_by BIGINT DEFAULT NULL COMMENT 'Admin who approved',
  approval_notes TEXT DEFAULT NULL,
  
  completed_at DATETIME DEFAULT NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (accepted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_project_dept (project_id, department_id),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tạo bảng member_tasks (Nhiệm vụ cá nhân)
CREATE TABLE IF NOT EXISTS project_member_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  department_task_id BIGINT NOT NULL COMMENT 'Parent department task',
  project_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  assigned_by BIGINT NOT NULL COMMENT 'Manager who assigned',
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('assigned', 'in_progress', 'submitted', 'approved', 'rejected', 'completed') DEFAULT 'assigned',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  
  deadline DATE,
  estimated_hours INT DEFAULT 0,
  actual_hours INT DEFAULT 0,
  progress INT DEFAULT 0,
  
  -- Member submission
  submitted_at DATETIME DEFAULT NULL,
  submission_notes TEXT DEFAULT NULL,
  submission_files JSON DEFAULT NULL,
  
  -- Manager review
  reviewed_at DATETIME DEFAULT NULL,
  reviewed_by BIGINT DEFAULT NULL,
  review_notes TEXT DEFAULT NULL,
  review_status ENUM('pending', 'approved', 'rejected', 'needs_revision') DEFAULT 'pending',
  
  completed_at DATETIME DEFAULT NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (department_task_id) REFERENCES project_department_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tạo bảng task_reports (Báo cáo tiến độ)
CREATE TABLE IF NOT EXISTS project_task_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  task_type ENUM('department', 'member') NOT NULL,
  reported_by BIGINT NOT NULL,
  
  progress INT NOT NULL COMMENT 'Progress at time of report',
  hours_spent INT DEFAULT 0,
  status_update VARCHAR(100),
  notes TEXT,
  attachments JSON DEFAULT NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_task (task_id, task_type),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tạo bảng warnings/penalties (Cảnh cáo/Phạt)
CREATE TABLE IF NOT EXISTS project_warnings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  target_type ENUM('department', 'user') NOT NULL,
  target_id BIGINT NOT NULL COMMENT 'department_id or user_id',
  
  type ENUM('reminder', 'warning', 'penalty') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  
  reason TEXT NOT NULL,
  task_id BIGINT DEFAULT NULL,
  task_type ENUM('department', 'member') DEFAULT NULL,
  
  penalty_amount DECIMAL(10,2) DEFAULT NULL,
  penalty_type VARCHAR(50) DEFAULT NULL COMMENT 'fine, bonus_deduction, etc',
  
  issued_by BIGINT NOT NULL,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at DATETIME DEFAULT NULL,
  acknowledged_by BIGINT DEFAULT NULL,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_target (target_type, target_id),
  INDEX idx_type (type),
  INDEX idx_issued (issued_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tạo bảng reminders (Nhắc nhở tự động)
CREATE TABLE IF NOT EXISTS project_task_reminders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  task_type ENUM('department', 'member') NOT NULL,
  recipient_id BIGINT NOT NULL,
  
  reminder_type ENUM('deadline_approaching', 'overdue', 'no_progress', 'submission_pending') NOT NULL,
  message TEXT NOT NULL,
  
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME DEFAULT NULL,
  
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_task (task_id, task_type),
  INDEX idx_recipient (recipient_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Update project_notifications - thêm các loại mới
ALTER TABLE project_notifications 
MODIFY COLUMN type ENUM(
  'project_assigned', 
  'task_assigned', 
  'task_submitted', 
  'task_approved', 
  'task_rejected',
  'reminder',
  'warning',
  'penalty',
  'team_assigned', 
  'member_added', 
  'project_updated'
) NOT NULL;
