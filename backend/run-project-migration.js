const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
    multipleStatements: true,
  });

  try {
    console.log("🔄 Running database migration for projects...\n");

    const sqlFile = fs.readFileSync(
      path.join(__dirname, "database", "improve-projects.sql"),
      "utf8"
    );

    await db.query(sqlFile);

    console.log("✅ Migration completed successfully!\n");

    // Verify changes
    console.log("📋 Verifying projects table structure:");
    const [projectsCols] = await db.query("DESCRIBE projects");
    console.log(
      "Projects columns:",
      projectsCols.map((c) => c.Field).join(", ")
    );

    console.log("\n📋 New tables created:");
    const [tables] = await db.query(`
      SHOW TABLES LIKE 'project_%'
    `);
    tables.forEach((t) => console.log("  -", Object.values(t)[0]));
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await db.end();
  }
}

runMigration();
