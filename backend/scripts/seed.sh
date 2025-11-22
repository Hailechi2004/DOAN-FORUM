#!/bin/bash

# Database Seeder Script
# This script populates the database with sample data

set -e

echo "========================================"
echo "Database Seeder Script"
echo "========================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-company_forum}
DB_USER=${DB_USER:-forum_user}
DB_PASSWORD=${DB_PASSWORD}

# Check if seeding is needed
read -p "This will add sample data to the database. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding cancelled"
    exit 0
fi

echo "Seeding database with sample data..."

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<'EOF'

-- ========================================
-- SEED DATA FOR DEVELOPMENT
-- ========================================

-- Note: Passwords are hashed with bcrypt
-- Default password for all users: "Password123!"
-- Hash: $2b$10$rN0Y2J8/xqXGvWp4P8P8GuLj7JxG3oK1xN8F8P8P8P8P8P8P8P8Pe

-- 1. Insert Admin User
INSERT IGNORE INTO users (id, username, email, password_hash, is_system_admin, status) VALUES
(1, 'admin', 'admin@company.com', '$2b$10$rN0Y2J8/xqXGvWp4P8P8GuLj7JxG3oK1xN8F8P8P8P8P8P8P8P8Pe', TRUE, 'active');

INSERT IGNORE INTO profiles (user_id, full_name, bio) VALUES
(1, 'System Administrator', 'System administrator account');

-- 2. Insert Departments
INSERT IGNORE INTO departments (id, name, code, description) VALUES
(1, 'Phòng Nhân sự', 'HR', 'Quản lý nguồn nhân lực'),
(2, 'Phòng Kỹ thuật', 'IT', 'Phát triển và vận hành hệ thống'),
(3, 'Phòng Kinh doanh', 'SALES', 'Bán hàng và chăm sóc khách hàng'),
(4, 'Phòng Marketing', 'MKT', 'Marketing và truyền thông'),
(5, 'Phòng Kế toán', 'ACC', 'Quản lý tài chính');

-- 3. Insert Department Managers
INSERT IGNORE INTO users (id, username, email, password_hash, status) VALUES
(2, 'hr.manager', 'hr.manager@company.com', '$2b$10$rN0Y2J8/xqXGvWp4P8P8GuLj7JxG3oK1xN8F8P8P8P8P8P8P8P8Pe', 'active'),
(3, 'it.manager', 'it.manager@company.com', '$2b$10$rN0Y2J8/xqXGvWp4P8P8GuLj7JxG3oK1xN8F8P8P8P8P8P8P8P8Pe', 'active');

INSERT IGNORE INTO profiles (user_id, full_name, bio) VALUES
(2, 'Nguyễn Văn HR', 'Quản lý phòng Nhân sự'),
(3, 'Trần Văn IT', 'Quản lý phòng Kỹ thuật');

-- Update department managers
UPDATE departments SET manager_id = 2 WHERE id = 1;
UPDATE departments SET manager_id = 3 WHERE id = 2;

-- 4. Insert Sample Employees
INSERT IGNORE INTO users (id, username, email, password_hash, status) VALUES
(4, 'john.doe', 'john.doe@company.com', '$2b$10$rN0Y2J8/xqXGvWp4P8P8GuLj7JxG3oK1xN8F8P8P8P8P8P8P8P8Pe', 'active'),
(5, 'jane.smith', 'jane.smith@company.com', '$2b$10$rN0Y2J8/xqXGvWp4P8P8GuLj7JxG3oK1xN8F8P8P8P8P8P8P8P8Pe', 'active'),
(6, 'bob.wilson', 'bob.wilson@company.com', '$2b$10$rN0Y2J8/xqXGvWp4P8P8GuLj7JxG3oK1xN8F8P8P8P8P8P8P8P8Pe', 'active'),
(7, 'alice.brown', 'alice.brown@company.com', '$2b$10$rN0Y2J8/xqXGvWp4P8P8GuLj7JxG3oK1xN8F8P8P8P8P8P8P8P8Pe', 'active');

INSERT IGNORE INTO profiles (user_id, full_name, bio, phone, gender) VALUES
(4, 'John Doe', 'Senior Developer', '+84 901 234 567', 'male'),
(5, 'Jane Smith', 'Marketing Specialist', '+84 902 345 678', 'female'),
(6, 'Bob Wilson', 'Sales Executive', '+84 903 456 789', 'male'),
(7, 'Alice Brown', 'HR Specialist', '+84 904 567 890', 'female');

-- 5. Insert Employee Records
INSERT IGNORE INTO employee_records (user_id, department_id, position, employee_code, start_date, status) VALUES
(2, 1, 'Trưởng phòng Nhân sự', 'EMP002', '2020-01-01', 'active'),
(3, 2, 'Trưởng phòng IT', 'EMP003', '2020-01-01', 'active'),
(4, 2, 'Senior Developer', 'EMP004', '2021-03-15', 'active'),
(5, 4, 'Marketing Specialist', 'EMP005', '2021-06-01', 'active'),
(6, 3, 'Sales Executive', 'EMP006', '2022-01-10', 'active'),
(7, 1, 'HR Specialist', 'EMP007', '2022-03-20', 'active');

-- 6. Assign Roles
INSERT IGNORE INTO user_roles (user_id, role_id, department_id) VALUES
(1, 1, NULL), -- Admin
(2, 2, 1), -- HR Manager
(3, 2, 2), -- IT Manager
(4, 3, NULL), -- Employee
(5, 3, NULL), -- Employee
(6, 3, NULL), -- Employee
(7, 3, NULL); -- Employee

-- 7. Create Sample Teams
INSERT IGNORE INTO teams (id, name, department_id, is_private, created_by, description) VALUES
(1, 'Development Team', 2, FALSE, 3, 'Main development team'),
(2, 'Marketing Campaign Team', 4, FALSE, 5, 'Q4 Marketing campaigns');

INSERT IGNORE INTO team_members (team_id, user_id, role_in_team) VALUES
(1, 3, 'owner'),
(1, 4, 'member'),
(2, 5, 'owner');

-- 8. Create Sample Posts
INSERT IGNORE INTO posts (id, author_id, department_id, category_id, title, content, visibility, created_at) VALUES
(1, 1, NULL, 1, 'Welcome to Company Forum', 'Welcome everyone to our new internal forum system! This platform will help us communicate better and share knowledge across departments.', 'company', NOW()),
(2, 3, 2, 2, 'New Development Tools', 'We have upgraded our development environment with the latest tools and frameworks. Check out the documentation for more details.', 'department', NOW() - INTERVAL 1 DAY),
(3, 5, 4, 3, 'Marketing Strategy Discussion', 'Let''s discuss our Q4 marketing strategy. What are your thoughts on our current campaigns?', 'company', NOW() - INTERVAL 2 DAY);

-- 9. Create Sample Hashtags
INSERT IGNORE INTO hashtags (id, tag, usage_count) VALUES
(1, 'welcome', 1),
(2, 'development', 1),
(3, 'marketing', 1),
(4, 'general', 0);

INSERT IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES
(1, 1),
(2, 2),
(3, 3);

-- 10. Create Sample Comments
INSERT IGNORE INTO comments (id, post_id, author_id, content, path, depth, created_at) VALUES
(1, 1, 4, 'Thank you! This looks great!', '/1/', 0, NOW()),
(2, 1, 5, 'Excited to use this platform!', '/2/', 0, NOW()),
(3, 1, 4, 'I agree! Can''t wait to explore all features.', '/2/3/', 1, NOW()),
(4, 2, 4, 'The new tools are awesome! Much faster now.', '/4/', 0, NOW());

UPDATE posts SET reply_count = 3 WHERE id = 1;
UPDATE posts SET reply_count = 1 WHERE id = 2;

-- 11. Add Sample Reactions
INSERT IGNORE INTO post_reactions (post_id, user_id, reaction_type_id) VALUES
(1, 2, 2), -- love
(1, 3, 1), -- like
(1, 4, 1), -- like
(1, 5, 1), -- like
(2, 4, 1); -- like

UPDATE posts SET reaction_count = 4 WHERE id = 1;
UPDATE posts SET reaction_count = 1 WHERE id = 2;

-- 12. Create Sample Meeting
INSERT IGNORE INTO meetings (id, title, description, organizer_id, department_id, start_time, end_time, location) VALUES
(1, 'Q4 Planning Meeting', 'Quarterly planning for all departments', 1, NULL, DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 2 HOUR, 'Meeting Room A');

INSERT IGNORE INTO meeting_attendees (meeting_id, user_id, status) VALUES
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(1, 4, 'invited'),
(1, 5, 'invited');

-- 13. Create Notification Preferences for all users
INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, email_enabled, push_enabled)
SELECT 
    u.id,
    nt.type,
    TRUE,
    TRUE,
    TRUE
FROM users u
CROSS JOIN (
    SELECT 'post_comment' AS type UNION ALL
    SELECT 'post_mention' UNION ALL
    SELECT 'post_reaction' UNION ALL
    SELECT 'comment_reply' UNION ALL
    SELECT 'meeting_invite' UNION ALL
    SELECT 'message_received'
) nt
WHERE u.status = 'active';

-- 14. Initialize User Activity Stats
INSERT IGNORE INTO user_activity_stats (user_id, posts_count, comments_count)
SELECT id, 0, 0 FROM users WHERE status = 'active';

UPDATE user_activity_stats SET posts_count = 1 WHERE user_id = 1;
UPDATE user_activity_stats SET posts_count = 1 WHERE user_id = 3;
UPDATE user_activity_stats SET posts_count = 1 WHERE user_id = 5;
UPDATE user_activity_stats SET comments_count = 2 WHERE user_id = 4;
UPDATE user_activity_stats SET comments_count = 1 WHERE user_id = 5;

EOF

if [ $? -eq 0 ]; then
    echo "========================================"
    echo "✓ Database seeded successfully"
    echo ""
    echo "Sample Login Credentials:"
    echo "------------------------"
    echo "Admin:"
    echo "  Email: admin@company.com"
    echo "  Password: Password123!"
    echo ""
    echo "HR Manager:"
    echo "  Email: hr.manager@company.com"
    echo "  Password: Password123!"
    echo ""
    echo "IT Manager:"
    echo "  Email: it.manager@company.com"
    echo "  Password: Password123!"
    echo ""
    echo "Employee:"
    echo "  Email: john.doe@company.com"
    echo "  Password: Password123!"
    echo "========================================"
else
    echo "✗ Failed to seed database"
    exit 1
fi
