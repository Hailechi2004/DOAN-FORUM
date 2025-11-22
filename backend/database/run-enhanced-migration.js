const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  let connection;

  try {
    // Database connection config
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "company_forum",
      multipleStatements: true,
    };

    console.log("🔌 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database!");

    // Read SQL file
    const sqlFile = path.join(__dirname, "create-task-workflow-tables.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    console.log("\n📝 Executing migration...");
    await connection.query(sql);

    console.log("✅ Migration completed successfully!");

    // Verify tables created
    console.log("\n🔍 Verifying new tables...");
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${dbConfig.database}' 
      AND TABLE_NAME LIKE 'project_%task%' OR TABLE_NAME LIKE 'project_warning%'
      ORDER BY TABLE_NAME
    `);

    console.log("\n📊 Tables created:");
    tables.forEach((table) => {
      console.log(`  ✓ ${table.TABLE_NAME}`);
    });

    // Get table counts
    console.log("\n📈 Current data:");
    const [deptTasks] = await connection.query(
      "SELECT COUNT(*) as count FROM project_department_tasks"
    );
    const [memberTasks] = await connection.query(
      "SELECT COUNT(*) as count FROM project_member_tasks"
    );
    const [reports] = await connection.query(
      "SELECT COUNT(*) as count FROM project_task_reports"
    );
    const [warnings] = await connection.query(
      "SELECT COUNT(*) as count FROM project_warnings"
    );
    const [reminders] = await connection.query(
      "SELECT COUNT(*) as count FROM project_task_reminders"
    );

    console.log(`  Department Tasks: ${deptTasks[0].count}`);
    console.log(`  Member Tasks: ${memberTasks[0].count}`);
    console.log(`  Reports: ${reports[0].count}`);
    console.log(`  Warnings: ${warnings[0].count}`);
    console.log(`  Reminders: ${reminders[0].count}`);

    console.log("\n🎉 All done!");
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error.message);
    if (error.sql) {
      console.error("\n💥 Failed SQL:");
      console.error(error.sql.substring(0, 200) + "...");
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

runMigration();
