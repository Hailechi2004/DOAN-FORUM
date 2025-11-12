-- ================================================================
-- COMPANY FORUM DATABASE - COMPLETE SCHEMA
-- Database for internal company forum system
-- Version: 1.0
-- Date: November 2, 2025
-- ================================================================

-- Drop existing database if exists (caution in production)
-- DROP DATABASE IF EXISTS company_forum;
-- CREATE DATABASE company_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE company_forum;

-- ================================================================
-- SECTION 1: USER MANAGEMENT & AUTHENTICATION
-- ================================================================

-- 1. Users (tÃ i khoáº£n há»‡ thá»‘ng)
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NULL,
  status ENUM('active','suspended','resigned','disabled') NOT NULL DEFAULT 'active',
  is_system_admin BOOLEAN NOT NULL DEFAULT FALSE, -- super admin
  profile_id BIGINT NULL, -- FK to profiles (optional)
  settings JSON NULL, -- user preferences, notification settings
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at DATETIME NULL,
  is_online BOOLEAN NOT NULL DEFAULT FALSE, -- tráº¡ng thÃ¡i online/offline
  last_seen DATETIME NULL, -- láº§n cuá»‘i hoáº¡t Ä‘á»™ng
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status),
  INDEX idx_is_online (is_online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Profiles (thÃ´ng tin cÃ¡ nhÃ¢n / trang cÃ¡ nhÃ¢n)
CREATE TABLE profiles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500) NULL,
  cover_url VARCHAR(500) NULL,
  bio TEXT NULL,
  phone VARCHAR(50) NULL,
  birth_date DATE NULL,
  gender ENUM('male','female','other','unspecified') DEFAULT 'unspecified',
  marital_status ENUM('single','married','divorced','widowed','unspecified') DEFAULT 'unspecified',
  address JSON NULL, -- {city, hometown, current_residence}
  work_info JSON NULL, -- {title, company, department_id}
  education JSON NULL, -- array of education objects
  extras JSON NULL, -- languages, hobbies, links, religion, politics
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_full_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User Connections / Friends (danh sÃ¡ch báº¡n bÃ¨)
CREATE TABLE user_connections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  connected_user_id BIGINT NOT NULL,
  status ENUM('pending','accepted','blocked') NOT NULL DEFAULT 'pending',
  requested_by BIGINT NOT NULL, -- who initiated the connection
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (connected_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_connection (user_id, connected_user_id),
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 2: ORGANIZATIONAL STRUCTURE
-- ================================================================

-- 4. Departments
CREATE TABLE departments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NULL UNIQUE,
  parent_id BIGINT NULL,
  description TEXT NULL,
  manager_id BIGINT NULL, -- Quáº£n lÃ½ phÃ²ng ban
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  INDEX idx_name (name),
  INDEX idx_code (code),
  FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Teams (nhÃ³m dá»± Ã¡n, private groups)
CREATE TABLE teams (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  department_id BIGINT NULL,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT NULL,
  avatar_url VARCHAR(500) NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dept (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Team Members (thÃ nh viÃªn nhÃ³m)
CREATE TABLE team_members (
  team_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role_in_team ENUM('member','owner','manager') NOT NULL DEFAULT 'member',
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Employment records (lá»‹ch sá»­ & há»“ sÆ¡ há»£p Ä‘á»“ng)
CREATE TABLE employee_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  department_id BIGINT NULL,
  team_id BIGINT NULL,
  position VARCHAR(200) NULL,
  employee_code VARCHAR(50) NULL UNIQUE,
  start_date DATE NULL,
  end_date DATE NULL,
  contract JSON NULL, -- lÆ°u metadata file contract: {file_id, type, signed_at}
  work_history JSON NULL, -- lá»‹ch sá»­ lÃ m viá»‡c
  status ENUM('active','on_hold','resigned') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  INDEX idx_user_status (user_id, status),
  INDEX idx_employee_code (employee_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 3: ROLES & PERMISSIONS
-- ================================================================

-- 8. Roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g. Admin, DepartmentManager, Employee
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Permissions
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(150) NOT NULL UNIQUE, -- e.g. posts.create, posts.delete.any, comments.moderate
  description VARCHAR(255),
  category VARCHAR(50) NULL -- group permissions: posts, users, reports, etc.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Role Permissions
CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. User Roles
CREATE TABLE user_roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role_id INT NOT NULL,
  department_id BIGINT NULL, -- optional: role scoped to dept
  assigned_by BIGINT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_role_dept (user_id, role_id, department_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_user_dept (user_id, department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 4: FILE MANAGEMENT
-- ================================================================

-- 12. Files (metadata for all uploads)
CREATE TABLE files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  uploader_id BIGINT NULL,
  storage_path VARCHAR(1000) NOT NULL, -- e.g. /uploads/2025/10/xxxxx.jpg or object storage key
  original_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(200),
  size_bytes BIGINT NOT NULL,
  max_size_mb INT NOT NULL DEFAULT 50, -- giá»›i háº¡n dung lÆ°á»£ng file
  checksum VARCHAR(128) NULL, -- optional
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_uploader (uploader_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 5: POSTS & INTERACTIONS
-- ================================================================

-- 13. Post Categories (loáº¡i bÃ i viáº¿t)
CREATE TABLE post_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  icon VARCHAR(50) NULL,
  color VARCHAR(20) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO post_categories (code, name, description) VALUES
('announcement', 'ThÃ´ng bÃ¡o', 'ThÃ´ng bÃ¡o chÃ­nh thá»©c tá»« cÃ´ng ty hoáº·c phÃ²ng ban'),
('sharing', 'Chia sáº»', 'Chia sáº» kiáº¿n thá»©c, kinh nghiá»‡m'),
('opinion', 'Ã kiáº¿n', 'ÄÃ³ng gÃ³p Ã½ kiáº¿n, tháº£o luáº­n'),
('proposal', 'Äá» xuáº¥t', 'Äá» xuáº¥t cáº£i tiáº¿n, sÃ¡ng kiáº¿n'),
('entertainment', 'Giáº£i trÃ­', 'Ná»™i dung giáº£i trÃ­ ná»™i bá»™');

-- 14. Posts
CREATE TABLE posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  author_id BIGINT NOT NULL,
  department_id BIGINT NULL, -- original dept scope or null
  team_id BIGINT NULL,  -- if posted to a team
  category_id INT NULL, -- loáº¡i bÃ i viáº¿t
  title VARCHAR(500) NULL,
  content MEDIUMTEXT NOT NULL,
  content_html MEDIUMTEXT NULL, -- sanitized HTML
  visibility ENUM('company','department','team','private') NOT NULL DEFAULT 'company',
  allowed_group_id BIGINT NULL, -- if visibility='team' or private group id
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at DATETIME NULL,
  deleted_by BIGINT NULL, -- admin/manager who deleted
  reply_count INT NOT NULL DEFAULT 0,
  reaction_count INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  share_count INT NOT NULL DEFAULT 0,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  pinned_until DATETIME NULL,
  pinned_by BIGINT NULL,
  INDEX idx_author (author_id),
  INDEX idx_department (department_id),
  INDEX idx_team (team_id),
  INDEX idx_visibility (visibility),
  INDEX idx_created_at (created_at),
  INDEX idx_category (category_id),
  FULLTEXT KEY ft_posts_content (title, content),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (allowed_group_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES post_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (pinned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Post Attachments (image, video, pdf, ...)
CREATE TABLE post_attachments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  file_id BIGINT NOT NULL,
  attachment_type ENUM('image','video','document','other') NOT NULL DEFAULT 'other',
  sort_order INT NOT NULL DEFAULT 0,
  meta JSON NULL, -- {width,height,duration,thumb_id,...}
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Hashtags
CREATE TABLE hashtags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tag VARCHAR(200) NOT NULL UNIQUE,
  usage_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tag (tag),
  INDEX idx_usage_count (usage_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Post Hashtags
CREATE TABLE post_hashtags (
  post_id BIGINT NOT NULL,
  hashtag_id BIGINT NOT NULL,
  PRIMARY KEY (post_id, hashtag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Post Mentions (@mentions)
CREATE TABLE post_mentions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  mentioned_user_id BIGINT NOT NULL,
  position INT NULL, -- optional char offset in content
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_mentioned_user (mentioned_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Post Views (lá»‹ch sá»­ xem bÃ i viáº¿t)
CREATE TABLE post_views (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  view_duration INT NULL, -- seconds spent on post
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_user (post_id, user_id),
  INDEX idx_viewed_at (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Saved Posts (bÃ i viáº¿t Ä‘Ã£ lÆ°u)
CREATE TABLE saved_posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  post_id BIGINT NOT NULL,
  saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  collection_name VARCHAR(100) NULL, -- optional: organize saved posts
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_post (user_id, post_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Reaction Types (static)
CREATE TABLE reaction_types (
  id TINYINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE, -- like, love, haha, sad, angry
  label VARCHAR(50) NOT NULL,
  emoji VARCHAR(16) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default reactions
INSERT INTO reaction_types (code, label, emoji) VALUES
('like','Like','ðŸ‘'),
('love','Love','â¤ï¸'),
('haha','Haha','ðŸ˜‚'),
('sad','Sad','ðŸ˜¢'),
('angry','Angry','ðŸ˜¡');

-- 22. Post Reactions (allows one reaction per user per post)
CREATE TABLE post_reactions (
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  reaction_type_id TINYINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reaction_type_id) REFERENCES reaction_types(id) ON DELETE RESTRICT,
  INDEX idx_reaction_type (reaction_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Post Shares (when a post is shared)
CREATE TABLE post_shares (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  shared_by BIGINT NOT NULL,
  comment TEXT NULL, -- comment added on share
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  visibility ENUM('company','department','team','private') NULL, -- can override
  department_id BIGINT NULL,
  team_id BIGINT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  INDEX idx_shared_by (shared_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 6: COMMENTS & REPLIES
-- ================================================================

-- 24. Comments (tree structure using parent_id + path)
CREATE TABLE comments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  content TEXT NOT NULL,
  content_html TEXT NULL,
  path VARCHAR(1000) NOT NULL, -- materialized path: /1/34/567/
  depth TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at DATETIME NULL,
  deleted_by BIGINT NULL,
  reaction_count INT NOT NULL DEFAULT 0,
  INDEX idx_post (post_id),
  INDEX idx_author (author_id),
  INDEX idx_path (path(255)),
  INDEX idx_parent (parent_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Comment Attachments
CREATE TABLE comment_attachments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  comment_id BIGINT NOT NULL,
  file_id BIGINT NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  INDEX idx_comment (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Comment Reactions
CREATE TABLE comment_reactions (
  comment_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  reaction_type_id TINYINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id),
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reaction_type_id) REFERENCES reaction_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 7: MESSAGING SYSTEM
-- ================================================================

-- 27. Conversations
CREATE TABLE conversations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('dm','group') NOT NULL DEFAULT 'dm',
  title VARCHAR(255) NULL,
  created_by BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME NULL,
  avatar_url VARCHAR(500) NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_last_message (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. Conversation Participants
CREATE TABLE conversation_participants (
  conversation_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unread_count INT NOT NULL DEFAULT 0,
  last_read_message_id BIGINT NULL, -- last message they read
  is_active BOOLEAN NOT NULL DEFAULT TRUE, -- left/archived conversation
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_unread (user_id, unread_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. Messages
CREATE TABLE messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  sender_id BIGINT NULL,
  content TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at DATETIME NULL,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at DATETIME NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  FULLTEXT KEY ft_message_content (content),
  INDEX idx_conversation (conversation_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. Message Attachments
CREATE TABLE message_attachments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  message_id BIGINT NOT NULL,
  file_id BIGINT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  INDEX idx_message (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. Message Read Receipts (Ä‘Ã£ xem tin nháº¯n)
CREATE TABLE message_read_receipts (
  message_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. Typing Indicators (Ä‘ang gÃµ)
CREATE TABLE typing_indicators (
  conversation_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL, -- auto-expire after 5-10 seconds
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 8: MEETINGS & EVENTS
-- ================================================================

-- 33. Meetings
CREATE TABLE meetings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NULL,
  organizer_id BIGINT NULL,
  department_id BIGINT NULL, -- meeting scope
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  location VARCHAR(500) NULL,
  meeting_link VARCHAR(1000) NULL, -- online meeting link
  recurrence JSON NULL, -- recurring meeting rules
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at DATETIME NULL,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_start_time (start_time),
  INDEX idx_organizer (organizer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. Meeting Attendees
CREATE TABLE meeting_attendees (
  meeting_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  status ENUM('invited','accepted','declined','tentative') NOT NULL DEFAULT 'invited',
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  responded_at DATETIME NULL,
  PRIMARY KEY (meeting_id, user_id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 35. Meeting Attachments
CREATE TABLE meeting_attachments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT NOT NULL,
  file_id BIGINT NOT NULL,
  description VARCHAR(255) NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  INDEX idx_meeting (meeting_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 9: NOTIFICATIONS
-- ================================================================

-- 36. Notification Preferences (cÃ i Ä‘áº·t thÃ´ng bÃ¡o)
CREATE TABLE notification_preferences (
  user_id BIGINT NOT NULL,
  notification_type VARCHAR(100) NOT NULL, -- post_comment, mention, like, meeting_invite, etc.
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (user_id, notification_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 37. Notifications
CREATE TABLE notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  actor_id BIGINT NULL, -- who triggered it
  type VARCHAR(150) NOT NULL, -- post_comment, mention, like, meeting_invite, report_resolved...
  reference_type VARCHAR(50) NULL, -- post, comment, meeting...
  reference_id BIGINT NULL,
  payload JSON NULL, -- extra data for client display
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 10: REPORTS & MODERATION
-- ================================================================

-- 38. Reports (bÃ¡o cÃ¡o vi pháº¡m)
CREATE TABLE reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT NOT NULL,
  target_type ENUM('post','comment','user','message') NOT NULL,
  target_id BIGINT NOT NULL,
  reason VARCHAR(500) NULL,
  details TEXT NULL,
  status ENUM('open','in_progress','resolved','dismissed') NOT NULL DEFAULT 'open',
  handled_by BIGINT NULL,
  department_id BIGINT NULL, -- scope of report
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  resolution_note TEXT NULL,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 11: AUDIT & LOGGING
-- ================================================================

-- 39. Audit Log (nháº­t kÃ½ hÃ nh Ä‘á»™ng)
CREATE TABLE audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT NULL,
  action VARCHAR(200) NOT NULL, -- post.created, post.edited, user.login, ...
  target_type VARCHAR(50) NULL, -- post, comment, user...
  target_id BIGINT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  details JSON NULL, -- what changed, old/new snapshots
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  INDEX idx_actor (actor_id),
  INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 12: ANNOUNCEMENTS (ThÃ´ng bÃ¡o phÃ²ng ban)
-- ================================================================

-- 40. Department Announcements
CREATE TABLE department_announcements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  department_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL, -- manager who created
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT NULL,
  priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  published_at DATETIME NULL,
  expires_at DATETIME NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_dept_published (department_id, published_at),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 41. Announcement Read Receipts
CREATE TABLE announcement_read_receipts (
  announcement_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (announcement_id, user_id),
  FOREIGN KEY (announcement_id) REFERENCES department_announcements(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 13: STATISTICS & ANALYTICS
-- ================================================================

-- 42. Monthly Activity Summary (for reports)
CREATE TABLE monthly_activity_summary (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL,
  dept_id BIGINT NULL,
  posts_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  active_users_count INT NOT NULL DEFAULT 0,
  total_reactions INT NOT NULL DEFAULT 0,
  total_shares INT NOT NULL DEFAULT 0,
  total_meetings INT NOT NULL DEFAULT 0,
  UNIQUE KEY unique_year_month_dept (year, month, dept_id),
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_year_month (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 43. User Activity Stats (cache table for performance)
CREATE TABLE user_activity_stats (
  user_id BIGINT PRIMARY KEY,
  posts_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  reactions_given INT NOT NULL DEFAULT 0,
  reactions_received INT NOT NULL DEFAULT 0,
  shares_count INT NOT NULL DEFAULT 0,
  last_post_at DATETIME NULL,
  last_comment_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SECTION 14: SYSTEM CONFIGURATION
-- ================================================================

-- 44. System Settings
CREATE TABLE system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NULL,
  data_type ENUM('string','number','boolean','json') NOT NULL DEFAULT 'string',
  description VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, data_type, description) VALUES
('max_file_size_mb', '50', 'number', 'Maximum file upload size in MB'),
('max_images_per_post', '10', 'number', 'Maximum images per post'),
('max_videos_per_post', '5', 'number', 'Maximum videos per post'),
('allowed_file_types', '["jpg","jpeg","png","gif","pdf","doc","docx","xls","xlsx","zip","mp4","mov"]', 'json', 'Allowed file types'),
('post_edit_time_limit', '60', 'number', 'Minutes allowed to edit post after creation'),
('comment_max_depth', '5', 'number', 'Maximum comment nesting depth'),
('typing_indicator_timeout', '10', 'number', 'Seconds before typing indicator expires');

-- ================================================================
-- INSERT SAMPLE DATA FOR ROLES & PERMISSIONS
-- ================================================================

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('System Admin', 'Super administrator with full system access'),
('Department Manager', 'Manager of a department with moderation rights'),
('Employee', 'Regular employee with standard access');

-- Insert sample permissions
INSERT INTO permissions (code, description, category) VALUES
-- Posts
('posts.create', 'Create new posts', 'posts'),
('posts.edit.own', 'Edit own posts', 'posts'),
('posts.edit.any', 'Edit any posts', 'posts'),
('posts.delete.own', 'Delete own posts', 'posts'),
('posts.delete.any', 'Delete any posts in scope', 'posts'),
('posts.view.all', 'View all posts', 'posts'),
('posts.moderate', 'Moderate posts (approve/reject)', 'posts'),
('posts.pin', 'Pin posts', 'posts'),
-- Comments
('comments.create', 'Create comments', 'comments'),
('comments.edit.own', 'Edit own comments', 'comments'),
('comments.edit.any', 'Edit any comments', 'comments'),
('comments.delete.own', 'Delete own comments', 'comments'),
('comments.delete.any', 'Delete any comments in scope', 'comments'),
('comments.moderate', 'Moderate comments', 'comments'),
-- Users
('users.view.all', 'View all users', 'users'),
('users.manage', 'Manage user accounts', 'users'),
('users.assign.roles', 'Assign roles to users', 'users'),
-- Departments
('departments.create', 'Create departments', 'departments'),
('departments.edit', 'Edit departments', 'departments'),
('departments.delete', 'Delete departments', 'departments'),
('departments.manage.own', 'Manage own department', 'departments'),
-- Reports
('reports.view.all', 'View all reports', 'reports'),
('reports.view.department', 'View department reports', 'reports'),
('reports.handle', 'Handle and resolve reports', 'reports'),
-- Announcements
('announcements.create', 'Create announcements', 'announcements'),
('announcements.edit', 'Edit announcements', 'announcements'),
('announcements.delete', 'Delete announcements', 'announcements'),
-- Meetings
('meetings.create', 'Create meetings', 'meetings'),
('meetings.edit.own', 'Edit own meetings', 'meetings'),
('meetings.edit.any', 'Edit any meetings', 'meetings'),
('meetings.delete.own', 'Delete own meetings', 'meetings'),
('meetings.delete.any', 'Delete any meetings', 'meetings'),
-- Analytics
('analytics.view.company', 'View company-wide analytics', 'analytics'),
('analytics.view.department', 'View department analytics', 'analytics'),
-- Audit
('audit.view', 'View audit logs', 'audit');

-- Assign permissions to System Admin role (full access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Assign permissions to Department Manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE code IN (
  'posts.view.all',
  'posts.moderate',
  'posts.delete.any',
  'posts.edit.any',
  'posts.pin',
  'comments.moderate',
  'comments.delete.any',
  'users.view.all',
  'departments.manage.own',
  'reports.view.department',
  'reports.handle',
  'announcements.create',
  'announcements.edit',
  'announcements.delete',
  'analytics.view.department',
  'meetings.create',
  'meetings.edit.any',
  'meetings.delete.any'
);

-- Assign permissions to Employee role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code IN (
  'posts.create',
  'posts.edit.own',
  'posts.delete.own',
  'posts.view.all',
  'comments.create',
  'comments.edit.own',
  'comments.delete.own',
  'users.view.all',
  'meetings.create',
  'meetings.edit.own',
  'meetings.delete.own'
);

-- ================================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ================================================================

-- View: Active users with profiles
CREATE VIEW v_active_users AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.status,
  u.is_online,
  u.last_seen,
  p.full_name,
  p.avatar_url,
  p.bio,
  er.position,
  d.name AS department_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN employee_records er ON u.id = er.user_id AND er.status = 'active'
LEFT JOIN departments d ON er.department_id = d.id
WHERE u.status = 'active' AND u.is_deleted = FALSE;

-- View: Post with author info
CREATE VIEW v_posts_with_author AS
SELECT 
  p.*,
  u.username AS author_username,
  pr.full_name AS author_name,
  pr.avatar_url AS author_avatar,
  d.name AS department_name,
  pc.name AS category_name
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN profiles pr ON u.id = pr.user_id
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN post_categories pc ON p.category_id = pc.id
WHERE p.is_deleted = FALSE;

-- ================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================================================
-- Most important indexes are already included in table definitions
-- Additional composite indexes can be added based on actual query patterns

-- ================================================================
-- TRIGGERS FOR AUTO-UPDATE COUNTERS
-- ================================================================

DELIMITER $$

-- Trigger: Update post reaction_count
CREATE TRIGGER trg_post_reaction_count_insert
AFTER INSERT ON post_reactions
FOR EACH ROW
BEGIN
  UPDATE posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
END$$

CREATE TRIGGER trg_post_reaction_count_delete
AFTER DELETE ON post_reactions
FOR EACH ROW
BEGIN
  UPDATE posts SET reaction_count = reaction_count - 1 WHERE id = OLD.post_id;
END$$

-- Trigger: Update post reply_count
CREATE TRIGGER trg_post_reply_count_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
  UPDATE posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
END$$

CREATE TRIGGER trg_post_reply_count_delete
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
  UPDATE posts SET reply_count = reply_count - 1 WHERE id = OLD.post_id;
END$$

-- Trigger: Update comment reaction_count
CREATE TRIGGER trg_comment_reaction_count_insert
AFTER INSERT ON comment_reactions
FOR EACH ROW
BEGIN
  UPDATE comments SET reaction_count = reaction_count + 1 WHERE id = NEW.comment_id;
END$$

CREATE TRIGGER trg_comment_reaction_count_delete
AFTER DELETE ON comment_reactions
FOR EACH ROW
BEGIN
  UPDATE comments SET reaction_count = reaction_count - 1 WHERE id = OLD.comment_id;
END$$

-- Trigger: Update post share_count
CREATE TRIGGER trg_post_share_count_insert
AFTER INSERT ON post_shares
FOR EACH ROW
BEGIN
  UPDATE posts SET share_count = share_count + 1 WHERE id = NEW.post_id;
END$$

CREATE TRIGGER trg_post_share_count_delete
AFTER DELETE ON post_shares
FOR EACH ROW
BEGIN
  UPDATE posts SET share_count = share_count - 1 WHERE id = OLD.post_id;
END$$

-- Trigger: Update hashtag usage_count
CREATE TRIGGER trg_hashtag_usage_insert
AFTER INSERT ON post_hashtags
FOR EACH ROW
BEGIN
  UPDATE hashtags SET usage_count = usage_count + 1 WHERE id = NEW.hashtag_id;
END$$

CREATE TRIGGER trg_hashtag_usage_delete
AFTER DELETE ON post_hashtags
FOR EACH ROW
BEGIN
  UPDATE hashtags SET usage_count = usage_count - 1 WHERE id = OLD.hashtag_id;
END$$

-- Trigger: Update conversation last_message_at
CREATE TRIGGER trg_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
  UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
END$$

DELIMITER ;

-- ================================================================
-- STORED PROCEDURES (Optional - for common operations)
-- ================================================================

DELIMITER $$

-- Procedure: Get user feed (posts visible to user)
CREATE PROCEDURE sp_get_user_feed(
  IN p_user_id BIGINT,
  IN p_limit INT,
  IN p_offset INT
)
BEGIN
  -- Get user's department
  DECLARE v_dept_id BIGINT;
  SELECT department_id INTO v_dept_id 
  FROM employee_records 
  WHERE user_id = p_user_id AND status = 'active' 
  LIMIT 1;
  
  -- Return posts
  SELECT DISTINCT p.*
  FROM posts p
  WHERE p.is_deleted = FALSE
    AND (
      p.visibility = 'company'
      OR (p.visibility = 'department' AND p.department_id = v_dept_id)
      OR p.author_id = p_user_id
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END$$

-- Procedure: Create notification
CREATE PROCEDURE sp_create_notification(
  IN p_user_id BIGINT,
  IN p_actor_id BIGINT,
  IN p_type VARCHAR(150),
  IN p_reference_type VARCHAR(50),
  IN p_reference_id BIGINT,
  IN p_payload JSON
)
BEGIN
  -- Check if user has this notification type enabled
  DECLARE v_enabled BOOLEAN;
  
  SELECT enabled INTO v_enabled
  FROM notification_preferences
  WHERE user_id = p_user_id AND notification_type = p_type
  LIMIT 1;
  
  IF v_enabled IS NULL THEN
    SET v_enabled = TRUE; -- default enabled
  END IF;
  
  IF v_enabled = TRUE THEN
    INSERT INTO notifications (user_id, actor_id, type, reference_type, reference_id, payload)
    VALUES (p_user_id, p_actor_id, p_type, p_reference_type, p_reference_id, p_payload);
  END IF;
END$$

DELIMITER ;

-- ================================================================
-- END OF DATABASE SCHEMA
-- ================================================================

-- Notes:
-- 1. Remember to set appropriate file size limits in system_settings
-- 2. Configure backup strategy for audit_log table (can grow large)
-- 3. Consider partitioning large tables by date (posts, comments, notifications)
-- 4. Implement proper caching strategy for frequently accessed data
-- 5. Set up full-text search indexes for better search performance
-- 6. Configure proper character set (utf8mb4) for emoji support
-- 7. Implement soft delete for important data (is_deleted flags)
-- 8. Regular cleanup of old typing_indicators and expired notifications

