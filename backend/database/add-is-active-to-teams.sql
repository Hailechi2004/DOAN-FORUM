-- Add is_active column to teams table for soft delete
ALTER TABLE teams 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE 
AFTER created_at;

-- Add index for filtering active teams
ALTER TABLE teams 
ADD INDEX idx_is_active (is_active);
