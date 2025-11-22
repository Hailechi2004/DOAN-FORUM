require("dotenv").config();
const mysql = require("mysql2/promise");

async function runMigration() {
  let connection;
  try {
    console.log("🔄 Starting project departments migration...\n");

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "dacn",
      multipleStatements: true,
    });

    console.log("✅ Connected to database\n");

    // 1. Create project_departments table
    console.log("📝 Creating project_departments table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_departments (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        project_id BIGINT NOT NULL,
        department_id BIGINT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        assigned_team_id BIGINT DEFAULT NULL,
        assigned_by BIGINT DEFAULT NULL,
        assigned_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_team_id) REFERENCES teams(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_project_department (project_id, department_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ project_departments table created\n");

    // 2. Create project_team_members table
    console.log("📝 Creating project_team_members table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_team_members (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        project_id BIGINT NOT NULL,
        department_id BIGINT NOT NULL,
        team_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        assigned_by BIGINT DEFAULT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_project_member (project_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ project_team_members table created\n");

    // 3. Create project_notifications table
    console.log("📝 Creating project_notifications table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_notifications (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        project_id BIGINT NOT NULL,
        department_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ project_notifications table created\n");

    // 4. Migrate existing data
    console.log("📝 Migrating existing project data...");
    const [migratedRows] = await connection.query(`
      INSERT IGNORE INTO project_departments (project_id, department_id, status)
      SELECT id, department_id, 'accepted'
      FROM projects
      WHERE department_id IS NOT NULL
    `);
    console.log(`✅ Migrated ${migratedRows.affectedRows} existing projects\n`);

    // 5. Show summary
    const [projectDepts] = await connection.query(
      "SELECT COUNT(*) as count FROM project_departments"
    );
    const [teamMembers] = await connection.query(
      "SELECT COUNT(*) as count FROM project_team_members"
    );
    const [notifications] = await connection.query(
      "SELECT COUNT(*) as count FROM project_notifications"
    );

    console.log("📊 Migration Summary:");
    console.log(`   - project_departments: ${projectDepts[0].count} records`);
    console.log(`   - project_team_members: ${teamMembers[0].count} records`);
    console.log(
      `   - project_notifications: ${notifications[0].count} records`
    );
    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
