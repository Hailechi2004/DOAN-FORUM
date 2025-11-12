-- ================================================================
-- SEED DEPARTMENTS, TEAMS AND EMPLOYEE ASSIGNMENTS
-- This script adds sample departments, teams and assigns employees
-- ================================================================

USE company_forum;

-- ================================================================
-- 1. INSERT DEPARTMENTS
-- ================================================================

-- Main departments
INSERT INTO departments (id, name, code, parent_id, description, manager_id, created_at, is_active) VALUES
(1, 'Ban Giám Đốc', 'BOD', NULL, 'Ban Giám đốc điều hành công ty', NULL, NOW(), TRUE),
(2, 'Phòng Nhân Sự', 'HR', NULL, 'Quản lý nguồn nhân lực và tuyển dụng', NULL, NOW(), TRUE),
(3, 'Phòng Kế Toán', 'ACC', NULL, 'Quản lý tài chính và kế toán', NULL, NOW(), TRUE),
(4, 'Phòng Công Nghệ Thông Tin', 'IT', NULL, 'Phát triển và vận hành hệ thống CNTT', NULL, NOW(), TRUE),
(5, 'Phòng Marketing', 'MKT', NULL, 'Marketing và truyền thông thương hiệu', NULL, NOW(), TRUE),
(6, 'Phòng Kinh Doanh', 'SALES', NULL, 'Bán hàng và phát triển khách hàng', NULL, NOW(), TRUE),
(7, 'Phòng Hành Chính', 'ADM', NULL, 'Hành chính tổng hợp', NULL, NOW(), TRUE),
(8, 'Phòng Chăm Sóc Khách Hàng', 'CS', NULL, 'Chăm sóc và hỗ trợ khách hàng', NULL, NOW(), TRUE);

-- Sub-departments under IT
INSERT INTO departments (id, name, code, parent_id, description, manager_id, created_at, is_active) VALUES
(9, 'Bộ Phận Phát Triển Web', 'IT-WEB', 4, 'Phát triển ứng dụng web', NULL, NOW(), TRUE),
(10, 'Bộ Phận Phát Triển Mobile', 'IT-MOB', 4, 'Phát triển ứng dụng di động', NULL, NOW(), TRUE),
(11, 'Bộ Phận DevOps', 'IT-OPS', 4, 'Vận hành và triển khai hệ thống', NULL, NOW(), TRUE),
(12, 'Bộ Phận QA/Testing', 'IT-QA', 4, 'Kiểm thử chất lượng phần mềm', NULL, NOW(), TRUE);

-- Sub-departments under Sales
INSERT INTO departments (id, name, code, parent_id, description, manager_id, created_at, is_active) VALUES
(13, 'Bộ Phận Kinh Doanh B2B', 'SALES-B2B', 6, 'Kinh doanh doanh nghiệp', NULL, NOW(), TRUE),
(14, 'Bộ Phận Kinh Doanh B2C', 'SALES-B2C', 6, 'Kinh doanh cá nhân', NULL, NOW(), TRUE);

-- ================================================================
-- 2. INSERT TEAMS
-- ================================================================

-- IT Teams
INSERT INTO teams (id, name, department_id, is_private, created_by, created_at, description, avatar_url) VALUES
(1, 'Team Frontend Development', 9, FALSE, NULL, NOW(), 'Đội phát triển giao diện người dùng với React, Vue', NULL),
(2, 'Team Backend Development', 9, FALSE, NULL, NOW(), 'Đội phát triển API và server-side với Node.js, Python', NULL),
(3, 'Team Mobile Apps', 10, FALSE, NULL, NOW(), 'Đội phát triển ứng dụng iOS và Android', NULL),
(4, 'Team DevOps & Infrastructure', 11, FALSE, NULL, NOW(), 'Đội quản lý server, CI/CD, cloud infrastructure', NULL),
(5, 'Team Quality Assurance', 12, FALSE, NULL, NOW(), 'Đội kiểm thử tự động và thủ công', NULL);

-- Marketing Teams
INSERT INTO teams (id, name, department_id, is_private, created_by, created_at, description, avatar_url) VALUES
(6, 'Team Digital Marketing', 5, FALSE, NULL, NOW(), 'Đội marketing online, SEO, SEM, Social Media', NULL),
(7, 'Team Content Creation', 5, FALSE, NULL, NOW(), 'Đội sản xuất nội dung, thiết kế đồ họa', NULL),
(8, 'Team Brand Management', 5, FALSE, NULL, NOW(), 'Đội quản lý thương hiệu và PR', NULL);

-- Sales Teams
INSERT INTO teams (id, name, department_id, is_private, created_by, created_at, description, avatar_url) VALUES
(9, 'Team Enterprise Sales', 13, FALSE, NULL, NOW(), 'Đội bán hàng doanh nghiệp lớn', NULL),
(10, 'Team SMB Sales', 13, FALSE, NULL, NOW(), 'Đội bán hàng doanh nghiệp vừa và nhỏ', NULL),
(11, 'Team Retail Sales', 14, FALSE, NULL, NOW(), 'Đội bán hàng bán lẻ', NULL);

-- HR Teams
INSERT INTO teams (id, name, department_id, is_private, created_by, created_at, description, avatar_url) VALUES
(12, 'Team Recruitment', 2, FALSE, NULL, NOW(), 'Đội tuyển dụng nhân sự', NULL),
(13, 'Team Training & Development', 2, FALSE, NULL, NOW(), 'Đội đào tạo và phát triển nhân sự', NULL);

-- Customer Service Teams
INSERT INTO teams (id, name, department_id, is_private, created_by, created_at, description, avatar_url) VALUES
(14, 'Team Technical Support', 8, FALSE, NULL, NOW(), 'Đội hỗ trợ kỹ thuật', NULL),
(15, 'Team Customer Success', 8, FALSE, NULL, NOW(), 'Đội chăm sóc và tư vấn khách hàng', NULL);

-- Accounting Teams
INSERT INTO teams (id, name, department_id, is_private, created_by, created_at, description, avatar_url) VALUES
(16, 'Team Financial Planning', 3, FALSE, NULL, NOW(), 'Đội lập kế hoạch tài chính', NULL),
(17, 'Team Accounts Payable/Receivable', 3, FALSE, NULL, NOW(), 'Đội công nợ và thanh toán', NULL);

-- Admin Teams
INSERT INTO teams (id, name, department_id, is_private, created_by, created_at, description, avatar_url) VALUES
(18, 'Team Facilities Management', 7, FALSE, NULL, NOW(), 'Đội quản lý cơ sở vật chất', NULL),
(19, 'Team General Affairs', 7, FALSE, NULL, NOW(), 'Đội hành chính tổng hợp', NULL);

-- ================================================================
-- 3. UPDATE EMPLOYEE RECORDS WITH DEPARTMENTS
-- ================================================================

-- Assign departments to existing employees
-- Note: Adjust user_ids based on your actual user data

-- IT Department employees (assuming user IDs 1-20 are tech staff)
UPDATE employee_records SET department_id = 9, team_id = 1 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 2 AND 5 LIMIT 4);

UPDATE employee_records SET department_id = 9, team_id = 2 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 6 AND 9 LIMIT 4);

UPDATE employee_records SET department_id = 10, team_id = 3 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 10 AND 13 LIMIT 4);

UPDATE employee_records SET department_id = 11, team_id = 4 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 14 AND 17 LIMIT 4);

UPDATE employee_records SET department_id = 12, team_id = 5 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 18 AND 21 LIMIT 4);

-- Marketing Department employees
UPDATE employee_records SET department_id = 5, team_id = 6 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 22 AND 25 LIMIT 4);

UPDATE employee_records SET department_id = 5, team_id = 7 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 26 AND 29 LIMIT 4);

-- Sales Department employees
UPDATE employee_records SET department_id = 13, team_id = 9 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 30 AND 33 LIMIT 4);

UPDATE employee_records SET department_id = 14, team_id = 11 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 34 AND 37 LIMIT 4);

-- HR Department employees
UPDATE employee_records SET department_id = 2, team_id = 12 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 38 AND 41 LIMIT 4);

-- Customer Service employees
UPDATE employee_records SET department_id = 8, team_id = 14 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 42 AND 45 LIMIT 4);

UPDATE employee_records SET department_id = 8, team_id = 15 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 46 AND 49 LIMIT 4);

-- Accounting employees
UPDATE employee_records SET department_id = 3, team_id = 16 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 50 AND 53 LIMIT 4);

-- Admin employees
UPDATE employee_records SET department_id = 7, team_id = 18 
WHERE user_id IN (SELECT id FROM users WHERE id BETWEEN 54 AND 57 LIMIT 4);

-- ================================================================
-- 4. INSERT TEAM MEMBERS
-- ================================================================

-- Team 1: Frontend Development
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 1, id, 'member', NOW() FROM users WHERE id BETWEEN 2 AND 5 LIMIT 4;

-- Team 2: Backend Development
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 2, id, 'member', NOW() FROM users WHERE id BETWEEN 6 AND 9 LIMIT 4;

-- Team 3: Mobile Apps
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 3, id, 'member', NOW() FROM users WHERE id BETWEEN 10 AND 13 LIMIT 4;

-- Team 4: DevOps
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 4, id, 'member', NOW() FROM users WHERE id BETWEEN 14 AND 17 LIMIT 4;

-- Team 5: QA
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 5, id, 'member', NOW() FROM users WHERE id BETWEEN 18 AND 21 LIMIT 4;

-- Team 6: Digital Marketing
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 6, id, 'member', NOW() FROM users WHERE id BETWEEN 22 AND 25 LIMIT 4;

-- Team 7: Content Creation
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 7, id, 'member', NOW() FROM users WHERE id BETWEEN 26 AND 29 LIMIT 4;

-- Team 9: Enterprise Sales
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 9, id, 'member', NOW() FROM users WHERE id BETWEEN 30 AND 33 LIMIT 4;

-- Team 11: Retail Sales
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 11, id, 'member', NOW() FROM users WHERE id BETWEEN 34 AND 37 LIMIT 4;

-- Team 12: Recruitment
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 12, id, 'member', NOW() FROM users WHERE id BETWEEN 38 AND 41 LIMIT 4;

-- Team 14: Technical Support
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 14, id, 'member', NOW() FROM users WHERE id BETWEEN 42 AND 45 LIMIT 4;

-- Team 15: Customer Success
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 15, id, 'member', NOW() FROM users WHERE id BETWEEN 46 AND 49 LIMIT 4;

-- Team 16: Financial Planning
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 16, id, 'member', NOW() FROM users WHERE id BETWEEN 50 AND 53 LIMIT 4;

-- Team 18: Facilities Management
INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
SELECT 18, id, 'member', NOW() FROM users WHERE id BETWEEN 54 AND 57 LIMIT 4;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check departments count
SELECT 'Total Departments:' as info, COUNT(*) as count FROM departments;

-- Check teams count
SELECT 'Total Teams:' as info, COUNT(*) as count FROM teams;

-- Check employees with departments
SELECT 'Employees with Departments:' as info, COUNT(*) as count 
FROM employee_records WHERE department_id IS NOT NULL;

-- Check employees with teams
SELECT 'Employees with Teams:' as info, COUNT(*) as count 
FROM employee_records WHERE team_id IS NOT NULL;

-- Check team members
SELECT 'Total Team Members:' as info, COUNT(*) as count FROM team_members;

-- Show department distribution
SELECT d.name as department, COUNT(er.id) as employee_count
FROM departments d
LEFT JOIN employee_records er ON d.id = er.department_id
GROUP BY d.id, d.name
ORDER BY employee_count DESC;

-- Show team distribution
SELECT t.name as team, d.name as department, COUNT(tm.user_id) as member_count
FROM teams t
LEFT JOIN departments d ON t.department_id = d.id
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name, d.name
ORDER BY member_count DESC;

SELECT '✅ Seed departments and teams completed!' as status;
