-- Safe migration: Only create NEW tables for enhanced workflow
-- Does NOT modify existing tables

-- 1. Department Tasks Table
CREATE TABLE IF NOT EXISTS project_department_tasks (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_by BIGINT NOT NULL COMMENT 'Admin who assigned',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('assigned', 'in_progress', 'submitted', 'approved', 'rejected', 'completed') DEFAULT 'assigned',
  deadline DATE,
  estimated_hours DECIMAL(10,2) DEFAULT 0,
  actual_hours DECIMAL(10,2) DEFAULT 0,
  progress TINYINT UNSIGNED DEFAULT 0 COMMENT '0-100%',
  
  -- Acceptance workflow
  accepted_at DATETIME NULL,
  accepted_by BIGINT NULL COMMENT 'Manager who accepted',
  rejection_reason TEXT NULL,
  
  -- Submission workflow
  submitted_at DATETIME NULL,
  submitted_by BIGINT NULL,
  submission_notes TEXT NULL,
  
  -- Approval workflow
  approved_at DATETIME NULL,
  approved_by BIGINT NULL COMMENT 'Admin who approved',
  approval_notes TEXT NULL,
  
  completed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  FOREIGN KEY (accepted_by) REFERENCES users(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  INDEX idx_project_dept (project_id, department_id),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline),
  INDEX idx_assigned_by (assigned_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Member Tasks Table
CREATE TABLE IF NOT EXISTS project_member_tasks (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_by BIGINT NOT NULL COMMENT 'Manager who assigned',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('assigned', 'in_progress', 'submitted', 'approved', 'completed') DEFAULT 'assigned',
  deadline DATE,
  estimated_hours DECIMAL(10,2) DEFAULT 0,
  actual_hours DECIMAL(10,2) DEFAULT 0,
  progress TINYINT UNSIGNED DEFAULT 0 COMMENT '0-100%',
  
  started_at DATETIME NULL,
  submitted_at DATETIME NULL,
  submission_notes TEXT NULL,
  
  approved_at DATETIME NULL,
  approved_by BIGINT NULL COMMENT 'Manager who approved',
  approval_notes TEXT NULL,
  
  completed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (department_task_id) REFERENCES project_department_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  INDEX idx_dept_task (department_task_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Task Reports Table
CREATE TABLE IF NOT EXISTS project_task_reports (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  department_task_id BIGINT NULL,
  member_task_id BIGINT NULL,
  reported_by BIGINT NOT NULL,
  report_type ENUM('daily', 'weekly', 'monthly', 'completion', 'issue') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  progress TINYINT UNSIGNED COMMENT '0-100%',
  issues TEXT NULL COMMENT 'Problems encountered',
  attachments JSON NULL COMMENT 'File paths or URLs',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (department_task_id) REFERENCES project_department_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (member_task_id) REFERENCES project_member_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id),
  
  INDEX idx_project (project_id),
  INDEX idx_dept_task (department_task_id),
  INDEX idx_member_task (member_task_id),
  INDEX idx_report_type (report_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Warnings/Penalties Table
CREATE TABLE IF NOT EXISTS project_warnings (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  department_task_id BIGINT NULL,
  member_task_id BIGINT NULL,
  warned_user_id BIGINT NOT NULL,
  issued_by BIGINT NOT NULL COMMENT 'Admin/Manager who issued warning',
  warning_type ENUM('late_submission', 'poor_quality', 'missed_deadline', 'incomplete_work', 'other') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  reason TEXT NOT NULL,
  penalty_amount DECIMAL(10,2) NULL COMMENT 'Financial penalty if applicable',
  
  acknowledged_at DATETIME NULL,
  acknowledged_by BIGINT NULL,
  
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (department_task_id) REFERENCES project_department_tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (member_task_id) REFERENCES project_member_tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (warned_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(id),
  FOREIGN KEY (acknowledged_by) REFERENCES users(id),
  
  INDEX idx_project (project_id),
  INDEX idx_warned_user (warned_user_id),
  INDEX idx_severity (severity),
  INDEX idx_issued_at (issued_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Task Reminders Table
CREATE TABLE IF NOT EXISTS project_task_reminders (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_task_id BIGINT NULL,
  member_task_id BIGINT NULL,
  user_id BIGINT NOT NULL,
  reminder_type ENUM('deadline_approaching', 'overdue', 'status_update', 'approval_needed') NOT NULL,
  message TEXT NOT NULL,
  remind_at DATETIME NOT NULL,
  sent_at DATETIME NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (department_task_id) REFERENCES project_department_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (member_task_id) REFERENCES project_member_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_user (user_id),
  INDEX idx_remind_at (remind_at),
  INDEX idx_sent (sent_at),
  INDEX idx_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Success message
SELECT 'Migration completed successfully! 5 new tables created.' as message;
