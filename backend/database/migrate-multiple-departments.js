const mysql = require("mysql2/promise");

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "company_forum",
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log("✅ Connected to database");

    // Create meeting_departments junction table
    console.log("\n📋 Creating meeting_departments table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS meeting_departments (
        meeting_id BIGINT NOT NULL,
        department_id BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (meeting_id, department_id),
        FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        INDEX idx_meeting_id (meeting_id),
        INDEX idx_department_id (department_id)
      )
    `);
    console.log("✅ meeting_departments table created");

    // Create event_departments junction table
    console.log("\n📋 Creating event_departments table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_departments (
        event_id BIGINT NOT NULL,
        department_id BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (event_id, department_id),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        INDEX idx_event_id (event_id),
        INDEX idx_department_id (department_id)
      )
    `);
    console.log("✅ event_departments table created");

    // Migrate existing meeting department_id to junction table
    console.log("\n📦 Migrating existing meeting departments...");
    const [meetingResult] = await connection.query(`
      INSERT INTO meeting_departments (meeting_id, department_id)
      SELECT id, department_id
      FROM meetings
      WHERE department_id IS NOT NULL
      ON DUPLICATE KEY UPDATE meeting_id = meeting_id
    `);
    console.log(
      `✅ Migrated ${meetingResult.affectedRows} meeting department associations`
    );

    // Migrate existing event department_id to junction table
    console.log("\n📦 Migrating existing event departments...");
    const [eventResult] = await connection.query(`
      INSERT INTO event_departments (event_id, department_id)
      SELECT id, department_id
      FROM events
      WHERE department_id IS NOT NULL
      ON DUPLICATE KEY UPDATE event_id = event_id
    `);
    console.log(
      `✅ Migrated ${eventResult.affectedRows} event department associations`
    );

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
