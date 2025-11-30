-- ============================================
-- Meeting Sessions and Active Participants Tables (Simplified)
-- For Jitsi Meet Video Conferencing Integration  
-- Created: 2025-11-30
-- ============================================

USE company_forum;

-- ============================================
-- Table: meeting_sessions
-- ============================================

CREATE TABLE IF NOT EXISTS meeting_sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT NOT NULL,
  jitsi_room_id VARCHAR(255) NOT NULL COMMENT 'Unique Jitsi room identifier',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When meeting was started',
  ended_at DATETIME NULL COMMENT 'When meeting ended (NULL if still active)',
  duration_seconds INT NULL COMMENT 'Total duration in seconds (calculated on end)',
  recording_url VARCHAR(1000) NULL COMMENT 'URL to recording file if available',
  recording_status ENUM('none', 'recording', 'processing', 'available', 'failed') DEFAULT 'none' COMMENT 'Recording status',
  started_by BIGINT NULL COMMENT 'User ID who started the meeting',
  ended_by BIGINT NULL COMMENT 'User ID who ended the meeting',
  participant_count INT DEFAULT 0 COMMENT 'Total number of participants who joined',
  max_concurrent_participants INT DEFAULT 0 COMMENT 'Maximum concurrent participants',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_started_at (started_at),
  INDEX idx_ended_at (ended_at),
  INDEX idx_jitsi_room_id (jitsi_room_id),
  INDEX idx_recording_status (recording_status),
  
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (started_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (ended_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks meeting session history and recordings';

-- ============================================
-- Table: meeting_active_participants
-- ============================================

CREATE TABLE IF NOT EXISTS meeting_active_participants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  session_id BIGINT NULL COMMENT 'Reference to meeting_sessions.id',
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When user joined the meeting',
  left_at DATETIME NULL COMMENT 'When user left (NULL if still in meeting)',
  duration_seconds INT NULL COMMENT 'Duration user was in meeting (calculated on leave)',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Is user currently in meeting',
  device_type VARCHAR(50) NULL COMMENT 'Desktop, mobile, tablet, etc',
  connection_quality VARCHAR(20) NULL COMMENT 'good, moderate, poor',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_is_active (is_active),
  INDEX idx_joined_at (joined_at),
  INDEX idx_meeting_user_active (meeting_id, user_id, is_active),
  
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES meeting_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks real-time meeting participants and their session details';

-- ============================================
-- Table: meeting_events
-- ============================================

CREATE TABLE IF NOT EXISTS meeting_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT NOT NULL,
  session_id BIGINT NULL,
  user_id BIGINT NULL COMMENT 'User who triggered the event',
  event_type VARCHAR(50) NOT NULL COMMENT 'screen_share_start, screen_share_stop, recording_start, etc',
  event_data JSON NULL COMMENT 'Additional event metadata',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_session_id (session_id),
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES meeting_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit log for all meeting events';

-- Success message
SELECT 'Meeting sessions tables created successfully!' as status;
