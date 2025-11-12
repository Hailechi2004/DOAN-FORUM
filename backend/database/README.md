# Database Documentation - Company Forum System

## 📋 Tổng quan

Database này được thiết kế cho hệ thống diễn đàn nội bộ công ty với đầy đủ các tính năng:

- Phân quyền người dùng (Admin, Quản lý phòng ban, Nhân viên)
- Quản lý bài viết với hashtag, mention, reactions, chia sẻ
- Hệ thống bình luận phân cấp
- Tin nhắn nội bộ (1-1 và nhóm)
- Lịch họp và sự kiện
- Thông báo thông minh
- Báo cáo vi phạm
- Audit log đầy đủ

## 🗂️ Cấu trúc Database

### SECTION 1: User Management (Quản lý người dùng)

- `users` - Tài khoản hệ thống
- `profiles` - Thông tin cá nhân & trang cá nhân
- `user_connections` - Danh sách bạn bè/kết nối

### SECTION 2: Organizational Structure (Cấu trúc tổ chức)

- `departments` - Phòng ban
- `teams` - Nhóm/dự án
- `team_members` - Thành viên nhóm
- `employee_records` - Hồ sơ nhân viên

### SECTION 3: Roles & Permissions (Phân quyền)

- `roles` - Vai trò
- `permissions` - Quyền hạn
- `role_permissions` - Quyền theo vai trò
- `user_roles` - Vai trò của người dùng

### SECTION 4: File Management (Quản lý file)

- `files` - Metadata file upload

### SECTION 5: Posts & Interactions (Bài viết & tương tác)

- `post_categories` - Loại bài viết
- `posts` - Bài viết
- `post_attachments` - File đính kèm bài viết
- `hashtags` - Hashtag
- `post_hashtags` - Hashtag của bài viết
- `post_mentions` - Mention trong bài viết
- `post_views` - Lịch sử xem bài viết
- `saved_posts` - Bài viết đã lưu
- `reaction_types` - Loại cảm xúc
- `post_reactions` - Cảm xúc bài viết
- `post_shares` - Chia sẻ bài viết

### SECTION 6: Comments & Replies (Bình luận)

- `comments` - Bình luận (cấu trúc cây)
- `comment_attachments` - File đính kèm bình luận
- `comment_reactions` - Cảm xúc bình luận

### SECTION 7: Messaging System (Tin nhắn)

- `conversations` - Cuộc trò chuyện
- `conversation_participants` - Người tham gia
- `messages` - Tin nhắn
- `message_attachments` - File đính kèm tin nhắn
- `message_read_receipts` - Trạng thái đã xem
- `typing_indicators` - Trạng thái đang gõ

### SECTION 8: Meetings & Events (Lịch họp)

- `meetings` - Cuộc họp
- `meeting_attendees` - Người tham dự
- `meeting_attachments` - Tài liệu họp

### SECTION 9: Notifications (Thông báo)

- `notification_preferences` - Cài đặt thông báo
- `notifications` - Thông báo

### SECTION 10: Reports & Moderation (Báo cáo & kiểm duyệt)

- `reports` - Báo cáo vi phạm

### SECTION 11: Audit & Logging (Nhật ký)

- `audit_log` - Nhật ký hoạt động

### SECTION 12: Announcements (Thông báo phòng ban)

- `department_announcements` - Thông báo phòng ban
- `announcement_read_receipts` - Trạng thái đã đọc

### SECTION 13: Statistics (Thống kê)

- `monthly_activity_summary` - Tổng hợp hoạt động theo tháng
- `user_activity_stats` - Thống kê hoạt động người dùng

### SECTION 14: System Configuration (Cấu hình)

- `system_settings` - Cài đặt hệ thống

## 🎯 Các tính năng đã được đáp ứng

### ✅ Phân quyền

- [x] Admin hệ thống (full quyền)
- [x] Quản lý phòng ban (quyền trong phạm vi phòng ban)
- [x] Nhân viên (quyền cơ bản)
- [x] Phân quyền chi tiết với bảng permissions

### ✅ Quản lý nhân viên

- [x] Hồ sơ nhân viên đầy đủ
- [x] Trạng thái: active, on_hold, resigned
- [x] Soft delete (không xóa hồ sơ, chỉ ẩn)
- [x] Lịch sử làm việc

### ✅ Trang cá nhân & Profile

- [x] Avatar và Cover photo
- [x] Thông tin cá nhân đầy đủ
- [x] Học vấn, kinh nghiệm
- [x] Sở thích, liên kết
- [x] Timeline hoạt động

### ✅ Bài viết (Posts)

- [x] Nội dung văn bản + HTML
- [x] File đính kèm (ảnh, video, PDF, Word, Excel, zip)
- [x] Giới hạn dung lượng
- [x] Hashtag nội bộ
- [x] Mention (@user)
- [x] Cảm xúc (5 loại: like, love, haha, sad, angry)
- [x] Chia sẻ với comment
- [x] Loại bài viết (thông báo, chia sẻ, ý kiến, đề xuất, giải trí)

### ✅ Bình luận

- [x] Cấu trúc cây (reply)
- [x] Cảm xúc với comment
- [x] Đính kèm ảnh/emoji

### ✅ Quyền riêng tư

- [x] Công khai nội bộ công ty
- [x] Chỉ phòng ban
- [x] Nhóm riêng tư
- [x] Cá nhân

### ✅ Quản lý phòng ban

- [x] Cấu trúc phòng ban
- [x] Quản lý phòng ban (manager_id)
- [x] Thông báo nội bộ phòng ban
- [x] Thống kê hoạt động phòng ban

### ✅ Lịch họp

- [x] Thông tin chi tiết cuộc họp
- [x] Gửi lời mời
- [x] Trạng thái tham dự
- [x] Nhắc nhở trước khi họp
- [x] File đính kèm

### ✅ Tin nhắn

- [x] Chat 1-1 và nhóm
- [x] Gửi văn bản, ảnh, video, file
- [x] Trạng thái online/offline
- [x] Trạng thái đã xem
- [x] Trạng thái đang gõ
- [x] Đếm tin nhắn chưa đọc

### ✅ Thông báo

- [x] Thông báo đa dạng (bài viết mới, tương tác, mention, họp, vi phạm)
- [x] Cài đặt thông báo chi tiết
- [x] Bật/tắt theo loại

### ✅ Báo cáo & vi phạm

- [x] Báo cáo bài viết/comment/user
- [x] Admin và quản lý xử lý
- [x] Trạng thái xử lý
- [x] Ghi chú giải quyết

### ✅ Nhật ký hoạt động

- [x] Audit log chi tiết
- [x] Ghi lại IP, User Agent
- [x] Snapshot thay đổi
- [x] Tra cứu lịch sử

### ✅ Thống kê

- [x] Thống kê theo tháng
- [x] Thống kê theo phòng ban
- [x] Thống kê người dùng
- [x] Tần suất hoạt động

## 🚀 Hướng dẫn sử dụng

### 1. Khởi tạo Database

```sql
-- Tạo database
CREATE DATABASE company_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE company_forum;

-- Chạy file SQL
SOURCE complete_forum_database.sql;
```

Hoặc trong MySQL Workbench/phpMyAdmin:

- Import file `complete_forum_database.sql`

### 2. Tạo Admin đầu tiên

```sql
-- Tạo user admin
INSERT INTO users (username, email, password_hash, is_system_admin)
VALUES ('admin', 'admin@company.com', '$2y$10$...', TRUE);

-- Tạo profile
INSERT INTO profiles (user_id, full_name)
VALUES (LAST_INSERT_ID(), 'System Administrator');

-- Gán role Admin
INSERT INTO user_roles (user_id, role_id)
VALUES (LAST_INSERT_ID(), 1);
```

### 3. Tạo phòng ban mẫu

```sql
INSERT INTO departments (name, code, description) VALUES
('Phòng Nhân sự', 'HR', 'Quản lý nguồn nhân lực'),
('Phòng Kỹ thuật', 'IT', 'Phát triển và vận hành hệ thống'),
('Phòng Kinh doanh', 'SALES', 'Bán hàng và chăm sóc khách hàng'),
('Phòng Marketing', 'MKT', 'Marketing và truyền thông');
```

## 📊 Views có sẵn

### v_active_users

Danh sách người dùng đang hoạt động với thông tin profile đầy đủ

```sql
SELECT * FROM v_active_users;
```

### v_posts_with_author

Danh sách bài viết kèm thông tin tác giả

```sql
SELECT * FROM v_posts_with_author WHERE department_name = 'Phòng IT';
```

## 🔧 Stored Procedures

### sp_get_user_feed

Lấy feed bài viết cho user (dựa trên quyền truy cập)

```sql
CALL sp_get_user_feed(user_id, limit, offset);
```

### sp_create_notification

Tạo thông báo (kiểm tra preferences)

```sql
CALL sp_create_notification(user_id, actor_id, 'post_comment', 'post', post_id, '{}');
```

## ⚡ Triggers tự động

Database đã có các triggers tự động cập nhật:

- Đếm reactions (bài viết & comment)
- Đếm comments
- Đếm shares
- Đếm hashtag usage
- Cập nhật last_message_at

## 🔐 Security Best Practices

1. **Password hashing**: Luôn dùng bcrypt/argon2 để hash password
2. **Soft delete**: Dữ liệu quan trọng chỉ đánh dấu is_deleted, không xóa vật lý
3. **Audit log**: Mọi hành động quan trọng đều được ghi log
4. **File upload**: Kiểm tra mime type và size trước khi lưu
5. **SQL Injection**: Luôn dùng prepared statements

## 📈 Performance Tips

1. **Indexes**: Đã có indexes cho các truy vấn phổ biến
2. **Full-text search**: Sử dụng cho posts và messages
3. **Partitioning**: Cân nhắc partition tables lớn theo date
4. **Caching**: Cache user info, roles, permissions
5. **Cleanup**: Định kỳ xóa typing_indicators và notifications cũ

## 🔍 Các cột quan trọng

### Trạng thái user

- `status`: active, suspended, resigned, disabled
- `is_deleted`: soft delete flag
- `is_online`: trạng thái online/offline
- `last_seen`: lần cuối hoạt động

### Trạng thái nhân viên

- `status`: active, on_hold, resigned

### Visibility của bài viết

- `company`: toàn công ty
- `department`: chỉ phòng ban
- `team`: chỉ nhóm
- `private`: riêng tư

### Loại bài viết

- announcement: Thông báo
- sharing: Chia sẻ
- opinion: Ý kiến
- proposal: Đề xuất
- entertainment: Giải trí

## 📝 Notes

1. **Character Set**: utf8mb4 để hỗ trợ emoji 😊
2. **Collation**: utf8mb4_unicode_ci cho Unicode chuẩn
3. **Foreign Keys**: CASCADE/SET NULL tùy logic nghiệp vụ
4. **JSON fields**: Lưu dữ liệu linh hoạt (settings, metadata)
5. **Materialized Path**: Dùng cho comments tree (path column)

## 🛠️ Maintenance Tasks

### Daily

- Cleanup expired typing_indicators
- Update user_activity_stats

### Weekly

- Archive old notifications (> 30 days)
- Update monthly_activity_summary

### Monthly

- Analyze slow queries
- Optimize tables
- Backup audit_log

## 📞 Support

Nếu có vấn đề hoặc cần bổ sung tính năng, vui lòng liên hệ team phát triển.

---

**Version**: 1.0  
**Last Updated**: November 2, 2025  
**Database Engine**: MySQL 8.0+
