# Database Export Tools

Công cụ để export cấu trúc và dữ liệu database từ MySQL.

## 📋 Các Scripts

### 1. `export-database-schema.js` - Export Schema Only

Export chỉ cấu trúc database (tables, views, triggers, procedures) không có dữ liệu.

**Sử dụng:**

```bash
cd backend
node export-database-schema.js
```

**Output:**

- File: `backend/database/FULL_DATABASE_SCHEMA_EXPORT.sql`
- Summary: `backend/database/EXPORT_SUMMARY.json`

**Nội dung:**

- ✅ All tables với CREATE TABLE statements
- ✅ Foreign keys và indexes
- ✅ Views
- ✅ Triggers
- ✅ Stored Procedures
- ✅ Thống kê: số lượng rows, size mỗi table

### 2. `export-database-with-data.js` - Export Schema + Data

Export cả cấu trúc và dữ liệu mẫu.

**Sử dụng:**

```bash
cd backend
node export-database-with-data.js
```

**Output:**

- File: `backend/database/FULL_DATABASE_WITH_DATA.sql`
- Summary: `backend/database/EXPORT_WITH_DATA_SUMMARY.json`

**Nội dung:**

- ✅ All tables với CREATE TABLE statements
- ✅ INSERT statements cho tất cả data
- ✅ Batch inserts (100 rows per batch) để tối ưu
- ✅ Tổng số rows và file size

## ⚙️ Cấu hình

Scripts sử dụng database config từ `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=company_forum
```

## 📝 Example Usage

### Export schema để share với team:

```bash
node export-database-schema.js
```

### Export full database để backup hoặc migrate:

```bash
node export-database-with-data.js
```

### Import vào database mới:

```bash
mysql -u root -p < backend/database/FULL_DATABASE_SCHEMA_EXPORT.sql
# hoặc
mysql -u root -p < backend/database/FULL_DATABASE_WITH_DATA.sql
```

## 🔍 Output File Structure

### FULL_DATABASE_SCHEMA_EXPORT.sql

```sql
-- Header with metadata
-- Table definitions với stats
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (...);

-- Views
DROP VIEW IF EXISTS `v_active_users`;
CREATE VIEW `v_active_users` AS ...;

-- Triggers
DELIMITER $$
DROP TRIGGER IF EXISTS `trg_post_reaction_count_insert`$$
CREATE TRIGGER `trg_post_reaction_count_insert` ...$$
DELIMITER ;

-- Stored Procedures
DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_get_user_feed`$$
CREATE PROCEDURE `sp_get_user_feed` ...$$
DELIMITER ;
```

### FULL_DATABASE_WITH_DATA.sql

```sql
-- Schema + Data
DROP DATABASE IF EXISTS `company_forum`;
CREATE DATABASE `company_forum` ...;
USE `company_forum`;

SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- Tables với INSERT data
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (...);

INSERT INTO `users` (...) VALUES
  (...),
  (...),
  ...;

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
```

## 📊 Export Summary (JSON)

```json
{
  "database": "company_forum",
  "exported_at": "2025-11-12T10:30:00.000Z",
  "tables": 45,
  "views": 2,
  "triggers": 8,
  "procedures": 2,
  "total_rows": 1250,
  "file_size_mb": "2.45",
  "output_file": "backend/database/FULL_DATABASE_WITH_DATA.sql"
}
```

## 🚀 Advanced Usage

### Export chỉ structure của một số tables:

Modify script để filter tables:

```javascript
const tables = await getAllTables(connection);
const filteredTables = tables.filter(
  (t) => t.startsWith("project_") || t.startsWith("user_")
);
```

### Export data với limit:

```javascript
async function getTableData(connection, tableName, limit = 1000) {
  const [rows] = await connection.query(
    `SELECT * FROM \`${tableName}\` LIMIT ?`,
    [limit]
  );
  return rows;
}
```

## ⚠️ Notes

1. **File size:** Export với data có thể tạo file rất lớn. Kiểm tra trước:

   ```bash
   node export-database-schema.js  # Schema only: ~500KB
   node export-database-with-data.js # With data: 2-50MB+
   ```

2. **Performance:** Export lớn có thể mất vài phút. Script sẽ hiển thị progress.

3. **Sensitive data:** Nếu export production data, nhớ xóa/mask dữ liệu nhạy cảm:
   - Passwords (đã hash nhưng vẫn nên cẩn thận)
   - Email addresses
   - Personal information
   - API keys trong JSON fields

4. **Git:** Các file export đã được thêm vào `.gitignore`:
   ```
   backend/database/FULL_DATABASE_*.sql
   backend/database/EXPORT_*.json
   ```

## 🔧 Troubleshooting

### Error: "Cannot connect to database"

Check `.env` file và MySQL service:

```bash
# Kiểm tra MySQL đang chạy
mysqladmin -u root -p status

# Test connection
mysql -u root -p -h localhost company_forum
```

### Error: "Out of memory"

Nếu database quá lớn, giảm batch size:

```javascript
const batchSize = 50; // Thay vì 100
```

### File không tạo được

Check quyền write:

```bash
chmod 755 backend/database/
```

## 📚 Related Files

- `backend/database/complete_forum_database.sql` - Base schema
- `backend/database/enhance-project-workflow.sql` - Project workflow schema
- `backend/database/create-task-workflow-tables.sql` - Task workflow tables

## 🎯 Use Cases

1. **Documentation:** Share schema với team mới
2. **Backup:** Backup trước khi migration lớn
3. **Testing:** Tạo test database với sample data
4. **Migration:** Move database giữa servers
5. **Analysis:** Analyze database structure và relationships
6. **CI/CD:** Tự động backup trong pipeline

## 📞 Support

Nếu có vấn đề, check:

- MySQL connection trong `.env`
- MySQL user có quyền `SELECT`, `SHOW VIEW`, `TRIGGER`
- Disk space đủ để ghi file

---

**Last Updated:** November 12, 2025
