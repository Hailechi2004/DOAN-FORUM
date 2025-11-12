-- Create junction table for multiple departments per meeting
CREATE TABLE IF NOT EXISTS meeting_departments (
  meeting_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (meeting_id, department_id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_department_id (department_id)
);

-- Create junction table for multiple departments per event
CREATE TABLE IF NOT EXISTS event_departments (
  event_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id, department_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_event_id (event_id),
  INDEX idx_department_id (department_id)
);

-- Migrate existing single department_id to junction tables (for meetings)
INSERT INTO meeting_departments (meeting_id, department_id)
SELECT id, department_id
FROM meetings
WHERE department_id IS NOT NULL
ON DUPLICATE KEY UPDATE meeting_id = meeting_id;

-- Migrate existing single department_id to junction tables (for events)
INSERT INTO event_departments (event_id, department_id)
SELECT id, department_id
FROM events
WHERE department_id IS NOT NULL
ON DUPLICATE KEY UPDATE event_id = event_id;
