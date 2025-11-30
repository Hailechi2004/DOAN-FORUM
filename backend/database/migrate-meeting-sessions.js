/**
 * Migration Script: Create Meeting Sessions Tables
 * Run this to create meeting_sessions, meeting_active_participants, and meeting_events tables
 *
 * Usage: node backend/database/migrate-meeting-sessions.js
 */

const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function runMigration() {
  let connection;

  try {
    console.log("🚀 Starting meeting sessions migration...\n");

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "company_forum",
      multipleStatements: true,
    });

    console.log(
      "✅ Connected to database:",
      process.env.DB_NAME || "company_forum"
    );

    // Read SQL file - use simplified version
    const sqlFilePath = path.join(
      __dirname,
      "create-meeting-tables-simple.sql"
    );
    const sql = await fs.readFile(sqlFilePath, "utf8");

    console.log("📄 Executing SQL migration...\n");

    // Execute SQL
    const [results] = await connection.query(sql);

    console.log("\n✅ Migration completed successfully!\n");

    // Show results
    if (Array.isArray(results)) {
      const lastResult = results[results.length - 1];
      if (lastResult && lastResult.length > 0) {
        console.log("📊 Migration Summary:");
        lastResult.forEach((row) => {
          console.log(row);
        });
      }
    }

    // Verify tables were created
    const [tables] = await connection.query(
      `
      SELECT TABLE_NAME, TABLE_COMMENT, TABLE_ROWS
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME IN ('meeting_sessions', 'meeting_active_participants', 'meeting_events')
      ORDER BY TABLE_NAME
    `,
      [process.env.DB_NAME || "company_forum"]
    );

    if (tables.length > 0) {
      console.log("\n📋 Created Tables:");
      console.table(tables);
    }

    // Verify views
    const [views] = await connection.query(
      `
      SELECT TABLE_NAME as VIEW_NAME
      FROM information_schema.VIEWS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME LIKE 'v_%meeting%'
      ORDER BY TABLE_NAME
    `,
      [process.env.DB_NAME || "company_forum"]
    );

    if (views.length > 0) {
      console.log("\n👁️  Created Views:");
      console.table(views);
    }

    // Verify procedures
    const [procedures] = await connection.query(
      `
      SELECT ROUTINE_NAME as PROCEDURE_NAME, ROUTINE_TYPE
      FROM information_schema.ROUTINES
      WHERE ROUTINE_SCHEMA = ?
        AND (ROUTINE_NAME LIKE '%Meeting%' OR ROUTINE_NAME LIKE '%meeting%')
      ORDER BY ROUTINE_NAME
    `,
      [process.env.DB_NAME || "company_forum"]
    );

    if (procedures.length > 0) {
      console.log("\n⚙️  Created Procedures:");
      console.table(procedures);
    }

    console.log("\n✨ All meeting session features are ready to use!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Backend code updated to use new tables");
    console.log("   2. Test the API endpoints:");
    console.log("      - POST /api/meetings/:id/start");
    console.log("      - POST /api/meetings/:id/join");
    console.log("      - POST /api/meetings/:id/end");
    console.log("      - GET  /api/meetings/:id/active-participants");
    console.log("   3. Frontend integration ready for Jitsi Meet");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

// Run migration
runMigration();
