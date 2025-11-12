-- Add multiple departments to a project
-- Thay vì chỉ 1 department_id, project sẽ có nhiều departments

-- 1. Tạo bảng project_departments (Many-to-Many)
CREATE TABLE IF NOT EXISTS project_departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  department_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  assigned_team_id INT DEFAULT NULL,
  assigned_by INT DEFAULT NULL, -- Manager who assigned team
  assigned_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_team_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_project_department (project_id, department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tạo bảng project_team_members (Team members trong project)
CREATE TABLE IF NOT EXISTS project_team_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  department_id INT NOT NULL,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- member, lead, etc.
  assigned_by INT DEFAULT NULL, -- Manager who assigned
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_project_member (project_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tạo bảng notifications cho phòng ban
CREATE TABLE IF NOT EXISTS project_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  department_id INT NOT NULL,
  user_id INT NOT NULL, -- Department manager
  type ENUM('project_assigned', 'team_assigned', 'member_added', 'project_updated') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Migrate existing data
-- Copy single department_id to project_departments
INSERT INTO project_departments (project_id, department_id, status)
SELECT id, department_id, 'accepted'
FROM projects
WHERE department_id IS NOT NULL;

-- 5. Optional: Remove old department_id column (sau khi test xong)
-- ALTER TABLE projects DROP COLUMN department_id;
-- ALTER TABLE projects DROP COLUMN team_id;
