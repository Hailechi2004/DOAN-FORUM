-- ============================================
-- Meeting Sessions and Active Participants Tables
-- For Jitsi Meet Video Conferencing Integration
-- Created: 2025-11-30
-- ============================================

USE company_forum;

-- ============================================
-- Table: meeting_sessions
-- Purpose: Track meeting session history, duration, and recordings
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
-- Purpose: Track real-time meeting participants (join/leave events)
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
-- Purpose: Audit log for meeting events (screen share, recording, etc)
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

-- ============================================
-- Stored Procedures
-- ============================================

-- Procedure to get current active participants count
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetActiveMeetingParticipants(IN p_meeting_id BIGINT)
BEGIN
  SELECT 
    map.id,
    map.user_id,
    u.username,
    u.full_name,
    u.email,
    u.avatar_url,
    map.joined_at,
    TIMESTAMPDIFF(SECOND, map.joined_at, NOW()) as seconds_in_meeting,
    map.device_type,
    map.connection_quality
  FROM meeting_active_participants map
  JOIN users u ON map.user_id = u.id
  WHERE map.meeting_id = p_meeting_id 
    AND map.is_active = TRUE
    AND map.left_at IS NULL
  ORDER BY map.joined_at ASC;
END //
DELIMITER ;

-- Procedure to mark user as left meeting
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS MarkUserLeftMeeting(
  IN p_meeting_id BIGINT,
  IN p_user_id BIGINT
)
BEGIN
  UPDATE meeting_active_participants
  SET 
    left_at = NOW(),
    is_active = FALSE,
    duration_seconds = TIMESTAMPDIFF(SECOND, joined_at, NOW()),
    updated_at = NOW()
  WHERE meeting_id = p_meeting_id
    AND user_id = p_user_id
    AND is_active = TRUE
    AND left_at IS NULL;
END //
DELIMITER ;

-- Procedure to end meeting session
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS EndMeetingSession(
  IN p_meeting_id BIGINT,
  IN p_ended_by BIGINT
)
BEGIN
  DECLARE v_session_id BIGINT;
  
  -- Get active session
  SELECT id INTO v_session_id
  FROM meeting_sessions
  WHERE meeting_id = p_meeting_id
    AND ended_at IS NULL
  LIMIT 1;
  
  IF v_session_id IS NOT NULL THEN
    -- Update session
    UPDATE meeting_sessions
    SET 
      ended_at = NOW(),
      ended_by = p_ended_by,
      duration_seconds = TIMESTAMPDIFF(SECOND, started_at, NOW()),
      updated_at = NOW()
    WHERE id = v_session_id;
    
    -- Mark all active participants as left
    UPDATE meeting_active_participants
    SET 
      left_at = NOW(),
      is_active = FALSE,
      duration_seconds = TIMESTAMPDIFF(SECOND, joined_at, NOW()),
      updated_at = NOW()
    WHERE session_id = v_session_id
      AND is_active = TRUE
      AND left_at IS NULL;
  END IF;
END //
DELIMITER ;

-- ============================================
-- Views for analytics
-- ============================================

-- View: Active meetings with participant counts
CREATE OR REPLACE VIEW v_active_meetings AS
SELECT 
  m.id as meeting_id,
  m.title,
  m.start_time,
  ms.id as session_id,
  ms.jitsi_room_id,
  ms.started_at,
  ms.started_by,
  u.full_name as started_by_name,
  COUNT(DISTINCT CASE WHEN map.is_active = TRUE THEN map.user_id END) as active_participants,
  ms.max_concurrent_participants,
  TIMESTAMPDIFF(MINUTE, ms.started_at, NOW()) as duration_minutes
FROM meetings m
JOIN meeting_sessions ms ON m.id = ms.meeting_id
LEFT JOIN meeting_active_participants map ON ms.id = map.session_id
LEFT JOIN users u ON ms.started_by = u.id
WHERE ms.ended_at IS NULL
GROUP BY m.id, ms.id;

-- View: Meeting session analytics
CREATE OR REPLACE VIEW v_meeting_session_stats AS
SELECT 
  m.id as meeting_id,
  m.title,
  m.department_id,
  COUNT(DISTINCT ms.id) as total_sessions,
  SUM(ms.duration_seconds) as total_duration_seconds,
  AVG(ms.duration_seconds) as avg_duration_seconds,
  MAX(ms.max_concurrent_participants) as max_participants_ever,
  COUNT(DISTINCT map.user_id) as unique_participants,
  SUM(CASE WHEN ms.recording_status = 'available' THEN 1 ELSE 0 END) as recorded_sessions
FROM meetings m
LEFT JOIN meeting_sessions ms ON m.id = ms.meeting_id
LEFT JOIN meeting_active_participants map ON ms.id = map.session_id
GROUP BY m.id;

-- ============================================
-- Sample Triggers
-- ============================================

-- Trigger: Update participant count when user joins
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_update_participant_count_on_join
AFTER INSERT ON meeting_active_participants
FOR EACH ROW
BEGIN
  IF NEW.session_id IS NOT NULL THEN
    UPDATE meeting_sessions ms
    SET participant_count = participant_count + 1,
        max_concurrent_participants = GREATEST(
          max_concurrent_participants,
          (SELECT COUNT(*) FROM meeting_active_participants 
           WHERE session_id = NEW.session_id AND is_active = TRUE)
        )
    WHERE id = NEW.session_id;
  END IF;
END //
DELIMITER ;

-- ============================================
-- Initial Data/Indexes
-- ============================================

-- Add comment to existing meetings table about Jitsi integration
ALTER TABLE meetings 
  MODIFY COLUMN meeting_link VARCHAR(1000) NULL 
  COMMENT 'External meeting link (Zoom, Google Meet) or Jitsi room URL';

-- Success message
SELECT 'Meeting sessions tables created successfully!' as status;
SELECT 'Tables created: meeting_sessions, meeting_active_participants, meeting_events' as tables;
SELECT 'Views created: v_active_meetings, v_meeting_session_stats' as views;
SELECT 'Procedures created: GetActiveMeetingParticipants, MarkUserLeftMeeting, EndMeetingSession' as procedures;
