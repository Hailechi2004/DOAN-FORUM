const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function archiveOldTasks() {
  let connection;

  try {
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "company_forum",
    };

    console.log("🔌 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected!\n");

    // Step 1: Backup old tasks data to JSON
    console.log("📦 STEP 1: Backing up old tasks to JSON file...");
    const [oldTasks] = await connection.query(`
      SELECT 
        t.*,
        p.name as project_name,
        u1.username as creator_name,
        u2.username as assignee_name
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      ORDER BY t.project_id, t.id
    `);

    const backupFile = path.join(
      __dirname,
      `project_tasks_backup_${Date.now()}.json`
    );
    fs.writeFileSync(backupFile, JSON.stringify(oldTasks, null, 2));
    console.log(`✅ Backed up ${oldTasks.length} tasks to: ${backupFile}\n`);

    // Step 2: Rename table
    console.log("📝 STEP 2: Renaming project_tasks → project_tasks_archive...");
    await connection.query(
      "RENAME TABLE project_tasks TO project_tasks_archive"
    );
    console.log("✅ Table renamed successfully!\n");

    // Step 3: Update comments
    console.log("📝 STEP 3: Adding archive comment...");
    await connection.query(`
      ALTER TABLE project_tasks_archive 
      COMMENT = 'ARCHIVED: Old task system, replaced by department workflow on ${new Date().toISOString()}'
    `);
    console.log("✅ Comment added!\n");

    // Step 4: Verify
    console.log("🔍 STEP 4: Verifying...");
    const [tables] = await connection.query(
      `
      SELECT TABLE_NAME, TABLE_COMMENT, TABLE_ROWS 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME LIKE '%task%'
      ORDER BY TABLE_NAME
    `,
      [dbConfig.database]
    );

    console.log("Current task-related tables:");
    tables.forEach((table) => {
      const icon = table.TABLE_NAME.includes("archive") ? "📦" : "✅";
      console.log(
        `  ${icon} ${table.TABLE_NAME} (${table.TABLE_ROWS} rows)${table.TABLE_COMMENT ? " - " + table.TABLE_COMMENT : ""}`
      );
    });

    console.log(
      "\n═══════════════════════════════════════════════════════════"
    );
    console.log("✅ ARCHIVE COMPLETE!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\nWhat happened:");
    console.log("  1. ✅ Old tasks backed up to JSON file");
    console.log("  2. ✅ project_tasks → project_tasks_archive");
    console.log("  3. ✅ Archive comment added");
    console.log("  4. ✅ New workflow system is now the only active system\n");

    console.log("Next steps:");
    console.log("  1. Update frontend to remove old Tasks tab (if not done)");
    console.log("  2. Test new workflow tabs thoroughly");
    console.log("  3. After 30 days, drop project_tasks_archive table:");
    console.log("     DROP TABLE project_tasks_archive;\n");

    console.log("Rollback (if needed):");
    console.log("  RENAME TABLE project_tasks_archive TO project_tasks;\n");
  } catch (error) {
    console.error("\n❌ Archive failed:");
    console.error(error);
    console.log("\n🔄 Attempting rollback...");
    try {
      await connection.query(
        "RENAME TABLE project_tasks_archive TO project_tasks"
      );
      console.log("✅ Rollback successful");
    } catch (rollbackError) {
      console.error("❌ Rollback failed:", rollbackError);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

archiveOldTasks();
